import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

const ESTADOS = ["apuntado", "interesado"];

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const eventoId = Number(params.id);
  const status = (await req.json().catch(() => null))?.status;

  if (!Number.isInteger(eventoId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  if (!ESTADOS.includes(status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const { rows: eventoRows } = await query(`SELECT 1 FROM eventos WHERE id = $1 AND deleted_at IS NULL`, [eventoId]);
  if (!eventoRows[0]) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  const { rows: actualRows } = await query(
    `SELECT status FROM evento_asistentes WHERE evento_id = $1 AND user_id = $2`,
    [eventoId, meId]
  );

  let miStatus;
  if (actualRows[0]?.status === status) {
    await query(`DELETE FROM evento_asistentes WHERE evento_id = $1 AND user_id = $2`, [eventoId, meId]);
    miStatus = null;
  } else {
    await query(
      `INSERT INTO evento_asistentes (evento_id, user_id, status) VALUES ($1, $2, $3)
       ON CONFLICT (evento_id, user_id) DO UPDATE SET status = EXCLUDED.status`,
      [eventoId, meId, status]
    );
    miStatus = status;
  }

  const { rows: counts } = await query(
    `SELECT
       (SELECT count(*)::int FROM evento_asistentes WHERE evento_id = $1 AND status = 'apuntado') AS apuntados_count,
       (SELECT count(*)::int FROM evento_asistentes WHERE evento_id = $1 AND status = 'interesado') AS interesados_count`,
    [eventoId]
  );

  return NextResponse.json({ miStatus, ...counts[0] });
}

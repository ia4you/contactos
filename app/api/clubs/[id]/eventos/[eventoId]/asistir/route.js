import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

// Toggle simple (apuntado / no apuntado) — misma mecánica de
// delete-si-existe / insert-si-no que /api/eventos/[id]/asistir, pero con
// un único estado en vez de apuntado/interesado.
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const clubId = Number(params.id);
  const eventoId = Number(params.eventoId);
  if (!Number.isInteger(clubId) || !Number.isInteger(eventoId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: eventoRows } = await query(
    `SELECT 1 FROM club_eventos WHERE id = $1 AND club_id = $2`,
    [eventoId, clubId]
  );
  if (!eventoRows[0]) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  const { rowCount: existia } = await query(
    `DELETE FROM club_evento_asistentes WHERE club_evento_id = $1 AND user_id = $2`,
    [eventoId, meId]
  );

  let miApuntado;
  if (existia) {
    miApuntado = false;
  } else {
    await query(
      `INSERT INTO club_evento_asistentes (club_evento_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [eventoId, meId]
    );
    miApuntado = true;
  }

  const { rows: countRows } = await query(
    `SELECT count(*)::int AS apuntados_count FROM club_evento_asistentes WHERE club_evento_id = $1`,
    [eventoId]
  );

  return NextResponse.json({ miApuntado, apuntadosCount: countRows[0].apuntados_count });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const historiaId = Number(params.id);
  if (!Number.isInteger(historiaId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows } = await query(`SELECT 1 FROM historias WHERE id = $1 AND expires_at > now()`, [historiaId]);
  if (!rows[0]) {
    return NextResponse.json({ error: "Historia no encontrada." }, { status: 404 });
  }

  await query(
    `INSERT INTO historia_vistas (historia_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [historiaId, session.user.id]
  );

  return NextResponse.json({ ok: true });
}

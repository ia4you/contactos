import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: grupoRows } = await query(`SELECT 1 FROM grupos WHERE id = $1`, [id]);
  if (!grupoRows[0]) {
    return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
  }

  await query(
    `INSERT INTO grupo_miembros (grupo_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [id, session.user.id]
  );

  return NextResponse.json({ ok: true });
}

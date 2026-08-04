import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const conversacionId = Number(params.conversacionId);
  const meId = Number(session.user.id);
  if (!Number.isInteger(conversacionId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: convRows } = await query(
    `SELECT 1 FROM conversaciones WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
    [conversacionId, meId]
  );
  if (!convRows[0]) {
    return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
  }

  await query(
    `UPDATE mensajes SET leido = true WHERE conversacion_id = $1 AND sender_id != $2 AND leido = false`,
    [conversacionId, meId]
  );

  return NextResponse.json({ ok: true });
}

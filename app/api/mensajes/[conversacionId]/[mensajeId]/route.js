import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const conversacionId = Number(params.conversacionId);
  const mensajeId = Number(params.mensajeId);
  const meId = Number(session.user.id);
  if (!Number.isInteger(conversacionId) || !Number.isInteger(mensajeId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rowCount } = await query(
    `UPDATE mensajes SET deleted_at = now()
      WHERE id = $1 AND conversacion_id = $2 AND sender_id = $3 AND deleted_at IS NULL`,
    [mensajeId, conversacionId, meId]
  );

  if (!rowCount) {
    return NextResponse.json({ error: "Mensaje no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

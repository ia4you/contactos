import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const esAdmin = session.user.role === "admin";
  const { rowCount } = await query(
    `UPDATE publicaciones SET deleted_at = now()
      WHERE id = $1 AND deleted_at IS NULL AND ($2 OR user_id = $3)`,
    [id, esAdmin, session.user.id]
  );

  if (!rowCount) {
    return NextResponse.json({ error: "Publicación no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

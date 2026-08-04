import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const publicacionId = Number(body?.publicacionId);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";

  if (!Number.isInteger(publicacionId) || !texto || texto.length > 500) {
    return NextResponse.json({ error: "Comentario inválido." }, { status: 400 });
  }

  const { rows: existe } = await query(
    `SELECT 1 FROM publicaciones WHERE id = $1 AND deleted_at IS NULL`,
    [publicacionId]
  );
  if (!existe[0]) {
    return NextResponse.json({ error: "Publicación no encontrada." }, { status: 404 });
  }

  const { rows } = await query(
    `INSERT INTO comentarios (user_id, publicacion_id, texto) VALUES ($1, $2, $3)
     RETURNING id, texto, created_at`,
    [session.user.id, publicacionId, texto]
  );

  return NextResponse.json({
    comentario: {
      ...rows[0],
      user_id: Number(session.user.id),
      nick: session.user.nick,
    },
  });
}

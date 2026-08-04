import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { crearNotificacion } from "@/lib/notificaciones";

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
    `SELECT user_id FROM publicaciones WHERE id = $1 AND deleted_at IS NULL`,
    [publicacionId]
  );
  const publicacion = existe[0];
  if (!publicacion) {
    return NextResponse.json({ error: "Publicación no encontrada." }, { status: 404 });
  }

  const { rows } = await query(
    `INSERT INTO comentarios (user_id, publicacion_id, texto) VALUES ($1, $2, $3)
     RETURNING id, texto, created_at`,
    [session.user.id, publicacionId, texto]
  );

  if (Number(publicacion.user_id) !== Number(session.user.id)) {
    await crearNotificacion(publicacion.user_id, "comentario", session.user.id, publicacionId);
  }

  return NextResponse.json({
    comentario: {
      ...rows[0],
      user_id: Number(session.user.id),
      nick: session.user.nick,
    },
  });
}

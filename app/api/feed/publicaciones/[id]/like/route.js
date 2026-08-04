import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { crearNotificacion } from "@/lib/notificaciones";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: existe } = await query(
    `SELECT user_id FROM publicaciones WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  const publicacion = existe[0];
  if (!publicacion) {
    return NextResponse.json({ error: "Publicación no encontrada." }, { status: 404 });
  }

  const { rowCount } = await query(
    `DELETE FROM publicacion_likes WHERE user_id = $1 AND publicacion_id = $2`,
    [session.user.id, id]
  );

  let meGusta;
  if (rowCount) {
    meGusta = false;
  } else {
    await query(
      `INSERT INTO publicacion_likes (user_id, publicacion_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [session.user.id, id]
    );
    meGusta = true;
    if (Number(publicacion.user_id) !== Number(session.user.id)) {
      await crearNotificacion(publicacion.user_id, "like_publicacion", session.user.id, id);
    }
  }

  const { rows } = await query(
    `SELECT count(*)::int AS likes_count FROM publicacion_likes WHERE publicacion_id = $1`,
    [id]
  );

  return NextResponse.json({ meGusta, likesCount: rows[0].likes_count });
}

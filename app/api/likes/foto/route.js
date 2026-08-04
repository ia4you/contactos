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
  const photoId = Number(body?.photo_id);
  const meId = Number(session.user.id);
  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "Foto inválida." }, { status: 400 });
  }

  const { rows: fotoRows } = await query(`SELECT user_id FROM photos WHERE id = $1`, [photoId]);
  const foto = fotoRows[0];
  if (!foto) {
    return NextResponse.json({ error: "Foto no encontrada." }, { status: 404 });
  }

  const { rowCount: existia } = await query(
    `DELETE FROM foto_likes WHERE user_id = $1 AND photo_id = $2`,
    [meId, photoId]
  );

  let meGusta;
  if (existia) {
    meGusta = false;
  } else {
    await query(`INSERT INTO foto_likes (user_id, photo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [meId, photoId]);
    meGusta = true;
    if (foto.user_id !== meId) {
      await crearNotificacion(foto.user_id, "like_foto", meId, photoId);
    }
  }

  const { rows } = await query(`SELECT count(*)::int AS likes_count FROM foto_likes WHERE photo_id = $1`, [photoId]);

  return NextResponse.json({ meGusta, likesCount: rows[0].likes_count });
}

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

  const { rows: fotoRows } = await query(
    `SELECT p.user_id, pub.id AS publicacion_id
       FROM photos p
       LEFT JOIN publicaciones pub ON pub.photo_id = p.id AND pub.tipo = 'foto' AND pub.deleted_at IS NULL
      WHERE p.id = $1`,
    [photoId]
  );
  const foto = fotoRows[0];
  if (!foto) {
    return NextResponse.json({ error: "Foto no encontrada." }, { status: 404 });
  }

  // Si la foto está también publicada en el feed, el like cuenta en
  // publicacion_likes (la misma tabla que usa el feed) en vez de en
  // foto_likes, para que el contador sea idéntico se mire desde donde se
  // mire. `tabla`/`columna` solo pueden tomar uno de estos dos valores
  // fijos definidos aquí mismo, nunca algo que venga del body — no hay
  // inyección SQL posible al interpolarlos.
  const enFeed = foto.publicacion_id != null;
  const tabla = enFeed ? "publicacion_likes" : "foto_likes";
  const columna = enFeed ? "publicacion_id" : "photo_id";
  const idObjetivo = enFeed ? foto.publicacion_id : photoId;

  const { rowCount: existia } = await query(
    `DELETE FROM ${tabla} WHERE user_id = $1 AND ${columna} = $2`,
    [meId, idObjetivo]
  );

  let meGusta;
  if (existia) {
    meGusta = false;
  } else {
    await query(`INSERT INTO ${tabla} (user_id, ${columna}) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [meId, idObjetivo]);
    meGusta = true;
    if (foto.user_id !== meId) {
      // Se notifica siempre como "like a tu foto" (independientemente de en
      // qué tabla se contabilice el like): desde la vista de perfil el
      // usuario sigue dando like a "la foto", no a "la publicación".
      await crearNotificacion(foto.user_id, "like_foto", meId, photoId);
    }
  }

  const { rows } = await query(`SELECT count(*)::int AS likes_count FROM ${tabla} WHERE ${columna} = $1`, [idObjetivo]);

  return NextResponse.json({ meGusta, likesCount: rows[0].likes_count });
}

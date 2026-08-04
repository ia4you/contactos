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

  const { rows: existe } = await query(
    `SELECT 1 FROM publicaciones WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  if (!existe[0]) {
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
  }

  const { rows } = await query(
    `SELECT count(*)::int AS likes_count FROM publicacion_likes WHERE publicacion_id = $1`,
    [id]
  );

  return NextResponse.json({ meGusta, likesCount: rows[0].likes_count });
}

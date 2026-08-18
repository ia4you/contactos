import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows } = await query(
    `SELECT c.id, c.texto, c.created_at, u.id AS user_id, u.nick, u.profile_type,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM comentarios c
       JOIN users u ON u.id = c.user_id
      WHERE c.publicacion_id = $1 AND c.deleted_at IS NULL AND u.deleted_at IS NULL
      ORDER BY c.created_at ASC`,
    [id]
  );

  return NextResponse.json({ comentarios: rows });
}

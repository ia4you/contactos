import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

const LIMITE = 20;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);
  const limiteParam = Number(req.nextUrl.searchParams.get("limite"));
  const limite = Number.isInteger(limiteParam) && limiteParam > 0 && limiteParam <= 50 ? limiteParam : LIMITE;

  const { rows } = await query(
    `SELECT n.id, n.tipo, n.entity_id, n.leida, n.created_at,
            u.id AS from_id, u.nick, u.profile_type,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM notificaciones n
       LEFT JOIN users u ON u.id = n.from_user_id AND u.deleted_at IS NULL
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3`,
    [meId, limite + 1, offset]
  );

  const hasMore = rows.length > limite;
  const notificaciones = rows.slice(0, limite);

  return NextResponse.json({ notificaciones, hasMore });
}

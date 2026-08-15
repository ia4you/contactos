import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

const LIMITE = 24;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);

  const { rows } = await query(
    `SELECT p.id, p.filename, p.created_at, u.id AS user_id, u.nick, u.profile_type,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM photos p
       JOIN users u ON u.id = p.user_id
      WHERE p.status = 'approved'
        AND p.is_private = false
        AND u.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
    [meId, LIMITE + 1, offset]
  );

  const hasMore = rows.length > LIMITE;
  const fotos = rows.slice(0, LIMITE);

  return NextResponse.json({ fotos, hasMore });
}

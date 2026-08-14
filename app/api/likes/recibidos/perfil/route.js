import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

const LIMITE = 30;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);

  const { rows } = await query(
    `SELECT l.from_id AS id, l.created_at, u.nick, u.profile_type, u.island, u.last_active, u.show_last_seen, u.is_demo,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename,
            EXISTS (
              SELECT 1 FROM matches m
               WHERE m.user1_id = LEAST($1, l.from_id) AND m.user2_id = GREATEST($1, l.from_id)
            ) AS match
       FROM likes l
       JOIN users u ON u.id = l.from_id
      WHERE l.to_id = $1 AND u.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3`,
    [meId, LIMITE + 1, offset]
  );

  const hasMore = rows.length > LIMITE;
  const likes = rows.slice(0, LIMITE);

  return NextResponse.json({ likes, hasMore });
}

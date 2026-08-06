import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const { rows } = await query(
    `SELECT u.id, u.nick, u.profile_type, u.island, u.last_active, u.show_last_seen, m.created_at,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM matches m
       JOIN users u ON u.id = (CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END)
      WHERE (m.user1_id = $1 OR m.user2_id = $1) AND u.deleted_at IS NULL
      ORDER BY m.created_at DESC`,
    [meId]
  );

  return NextResponse.json({ matches: rows });
}

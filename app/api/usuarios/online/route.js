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
    `SELECT u.id, u.nick, u.profile_type, u.island,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM users u
      WHERE u.id != $1
        AND u.deleted_at IS NULL
        AND u.show_last_seen = true
        AND u.last_active > now() - interval '15 minutes'
        AND EXISTS (SELECT 1 FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved')
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY u.last_active DESC`,
    [meId]
  );

  return NextResponse.json({ usuarios: rows });
}

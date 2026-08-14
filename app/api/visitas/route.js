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
    `SELECT u.id, u.nick, u.profile_type, u.island, u.last_active, u.show_last_seen, u.is_demo, v.visited_at,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM visits v
       JOIN users u ON u.id = v.visitor_id
      WHERE v.visited_id = $1
        AND u.deleted_at IS NULL
        AND v.visited_at > now() - interval '30 days'
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY v.visited_at DESC
      LIMIT $2 OFFSET $3`,
    [meId, LIMITE + 1, Math.min(offset, 500)]
  );

  const hasMore = rows.length > LIMITE;
  const visitas = rows.slice(0, LIMITE);

  return NextResponse.json({ visitas, hasMore });
}

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  await query(`UPDATE users SET visitas_vistas_at = now() WHERE id = $1`, [session.user.id]);

  return NextResponse.json({ ok: true });
}

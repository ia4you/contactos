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
    `SELECT count(*)::int AS nuevas
       FROM visits v
       JOIN users u ON u.id = v.visitor_id
      WHERE v.visited_id = $1
        AND u.deleted_at IS NULL
        AND v.visited_at > COALESCE((SELECT visitas_vistas_at FROM users WHERE id = $1), 'epoch'::timestamptz)
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))`,
    [meId]
  );

  return NextResponse.json({ nuevas: rows[0].nuevas });
}

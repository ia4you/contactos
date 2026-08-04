import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { rows } = await query(
    `SELECT u.id, u.nick, u.profile_type,
            (SELECT p.filename FROM photos p
               WHERE p.user_id = u.id AND p.is_avatar = true AND p.status = 'approved'
               LIMIT 1) AS filename
       FROM blocks b
       JOIN users u ON u.id = b.blocked_id
      WHERE b.blocker_id = $1
      ORDER BY b.created_at DESC`,
    [session.user.id]
  );

  return NextResponse.json({ bloqueados: rows });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const blockedId = body?.blocked_id;

  if (!Number.isInteger(blockedId)) {
    return NextResponse.json({ error: "Usuario no válido." }, { status: 400 });
  }
  if (String(blockedId) === session.user.id) {
    return NextResponse.json({ error: "No puedes bloquearte a ti mismo." }, { status: 400 });
  }

  const { rows } = await query(
    `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [blockedId]
  );
  if (!rows[0]) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  await query(
    `INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2)
     ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
    [session.user.id, blockedId]
  );

  return NextResponse.json({ ok: true });
}

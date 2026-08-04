import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const toUserId = Number(body?.to_user_id);
  const meId = Number(session.user.id);
  if (!Number.isInteger(toUserId) || toUserId === meId) {
    return NextResponse.json({ error: "Destinatario inválido." }, { status: 400 });
  }

  const { rows: bloqueoRows } = await query(
    `SELECT 1 FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
    [meId, toUserId]
  );
  if (bloqueoRows[0]) {
    return NextResponse.json({ error: "No puedes enviar mensajes a este usuario." }, { status: 403 });
  }

  const user1 = Math.min(meId, toUserId);
  const user2 = Math.max(meId, toUserId);

  const { rows } = await query(
    `INSERT INTO conversaciones (user1_id, user2_id) VALUES ($1, $2)
     ON CONFLICT (user1_id, user2_id) DO UPDATE SET user1_id = EXCLUDED.user1_id
     RETURNING id`,
    [user1, user2]
  );

  return NextResponse.json({ conversacionId: rows[0].id });
}

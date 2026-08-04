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
    `SELECT count(*)::int AS no_leidos
       FROM mensajes m
       JOIN conversaciones c ON c.id = m.conversacion_id
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
        AND m.sender_id != $1 AND m.leido = false AND m.deleted_at IS NULL`,
    [meId]
  );

  return NextResponse.json({ noLeidos: rows[0].no_leidos });
}

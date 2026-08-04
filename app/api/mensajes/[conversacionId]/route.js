import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const conversacionId = Number(params.conversacionId);
  const meId = Number(session.user.id);
  if (!Number.isInteger(conversacionId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: convRows } = await query(
    `SELECT c.id, c.user1_id, c.user2_id,
            u.id AS otro_id, u.nick, u.profile_type, u.island,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM conversaciones c
       JOIN users u ON u.id = (CASE WHEN c.user1_id = $2 THEN c.user2_id ELSE c.user1_id END)
      WHERE c.id = $1 AND (c.user1_id = $2 OR c.user2_id = $2)`,
    [conversacionId, meId]
  );
  const conversacion = convRows[0];
  if (!conversacion) {
    return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
  }

  const { rows: mensajes } = await query(
    `SELECT id, sender_id, texto, leido, created_at
       FROM mensajes
      WHERE conversacion_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 50`,
    [conversacionId]
  );

  return NextResponse.json({
    otro: {
      id: conversacion.otro_id,
      nick: conversacion.nick,
      profile_type: conversacion.profile_type,
      island: conversacion.island,
      avatar_filename: conversacion.avatar_filename,
    },
    mensajes: mensajes.reverse(),
  });
}

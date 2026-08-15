import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { crearNotificacion } from "@/lib/notificaciones";
import { generarRespuestaDemo } from "@/lib/demoReply";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const { rows } = await query(
    `SELECT c.id, c.last_message_at,
            u.id AS otro_id, u.nick, u.profile_type, u.island, u.last_active, u.show_last_seen, u.is_demo, u.badge_especial,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename,
            (SELECT texto FROM mensajes m WHERE m.conversacion_id = c.id AND m.deleted_at IS NULL ORDER BY m.created_at DESC LIMIT 1) AS ultimo_texto,
            (SELECT count(*)::int FROM mensajes m WHERE m.conversacion_id = c.id AND m.sender_id != $1 AND m.leido = false AND m.deleted_at IS NULL) AS no_leidos
       FROM conversaciones c
       JOIN users u ON u.id = (CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END)
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
        AND u.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`,
    [meId]
  );

  return NextResponse.json({ conversaciones: rows });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const toUserId = Number(body?.to_user_id);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  const meId = Number(session.user.id);

  if (!Number.isInteger(toUserId) || toUserId === meId || !texto || texto.length > 2000) {
    return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
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

  const { rows: convRows } = await query(
    `INSERT INTO conversaciones (user1_id, user2_id) VALUES ($1, $2)
     ON CONFLICT (user1_id, user2_id) DO UPDATE SET user1_id = EXCLUDED.user1_id
     RETURNING id`,
    [user1, user2]
  );
  const conversacionId = convRows[0].id;

  const { rows: mensajeRows } = await query(
    `INSERT INTO mensajes (conversacion_id, sender_id, texto) VALUES ($1, $2, $3)
     RETURNING id, texto, leido, created_at, sender_id`,
    [conversacionId, meId, texto]
  );
  const mensaje = mensajeRows[0];

  await query(`UPDATE conversaciones SET last_message_at = now() WHERE id = $1`, [conversacionId]);
  await crearNotificacion(toUserId, "mensaje", meId, mensaje.id);

  const { rows: demoRows } = await query(
    `SELECT id, nick, profile_type, island, bio, her_bio, his_bio, orientacion, rol
       FROM users WHERE id = $1 AND is_demo = true`,
    [toUserId]
  );
  if (demoRows[0]) {
    // Fire-and-forget: no se espera a que termine para responder al usuario.
    generarRespuestaDemo(demoRows[0], conversacionId, meId, texto).catch((err) => {
      console.error("Error en generarRespuestaDemo:", err);
    });
  }

  return NextResponse.json({ conversacionId, mensaje });
}

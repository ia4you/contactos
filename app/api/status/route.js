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
    `SELECT
       (SELECT count(*)::int FROM notificaciones WHERE user_id = $1 AND leida = false) AS notificaciones_no_leidas,
       (SELECT count(*)::int
          FROM mensajes m
          JOIN conversaciones c ON c.id = m.conversacion_id
         WHERE (c.user1_id = $1 OR c.user2_id = $1)
           AND m.sender_id != $1 AND m.leido = false AND m.deleted_at IS NULL) AS mensajes_no_leidos,
       (SELECT count(*)::int
          FROM visits v
          JOIN users u ON u.id = v.visitor_id
         WHERE v.visited_id = $1
           AND u.deleted_at IS NULL
           AND v.visited_at > COALESCE((SELECT visitas_vistas_at FROM users WHERE id = $1), 'epoch'::timestamptz)
           AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))) AS visitas_nuevas,
       (SELECT count(*)::int
          FROM amistades a
          JOIN users u ON u.id = a.from_id
         WHERE a.to_id = $1 AND a.status = 'pending' AND u.deleted_at IS NULL) AS solicitudes_pendientes
    `,
    [meId]
  );

  return NextResponse.json(rows[0]);
}

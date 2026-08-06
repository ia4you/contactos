import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { crearNotificacion } from "@/lib/notificaciones";

const CAMPOS_USUARIO = `u.id, u.nick, u.profile_type, u.island, u.last_active, u.show_last_seen,
  (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename`;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const { rows: amigos } = await query(
    `SELECT ${CAMPOS_USUARIO}, a.resolved_at
       FROM amistades a
       JOIN users u ON u.id = (CASE WHEN a.from_id = $1 THEN a.to_id ELSE a.from_id END)
      WHERE (a.from_id = $1 OR a.to_id = $1) AND a.status = 'accepted' AND u.deleted_at IS NULL
      ORDER BY a.resolved_at DESC`,
    [meId]
  );

  const { rows: recibidas } = await query(
    `SELECT ${CAMPOS_USUARIO}, a.created_at
       FROM amistades a
       JOIN users u ON u.id = a.from_id
      WHERE a.to_id = $1 AND a.status = 'pending' AND u.deleted_at IS NULL
      ORDER BY a.created_at DESC`,
    [meId]
  );

  const { rows: enviadas } = await query(
    `SELECT ${CAMPOS_USUARIO}, a.created_at
       FROM amistades a
       JOIN users u ON u.id = a.to_id
      WHERE a.from_id = $1 AND a.status = 'pending' AND u.deleted_at IS NULL
      ORDER BY a.created_at DESC`,
    [meId]
  );

  return NextResponse.json({ amigos, recibidas, enviadas });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const toId = Number(body?.to_id);
  const meId = Number(session.user.id);
  if (!Number.isInteger(toId) || toId === meId) {
    return NextResponse.json({ error: "Destinatario inválido." }, { status: 400 });
  }

  const { rows: destinoRows } = await query(`SELECT 1 FROM users WHERE id = $1 AND deleted_at IS NULL`, [toId]);
  if (!destinoRows[0]) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const { rows: existentes } = await query(
    `SELECT from_id, to_id, status FROM amistades WHERE (from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1)`,
    [meId, toId]
  );

  const propia = existentes.find((a) => a.from_id === meId);
  const ajena = existentes.find((a) => a.from_id === toId);

  if (existentes.some((a) => a.status === "accepted")) {
    return NextResponse.json({ error: "Ya sois amigos." }, { status: 400 });
  }
  if (propia?.status === "pending") {
    return NextResponse.json({ error: "Ya has enviado una solicitud a este usuario." }, { status: 400 });
  }

  // Si el otro usuario ya te había enviado una solicitud pendiente, la
  // aceptamos directamente en vez de crear una segunda fila cruzada.
  if (ajena?.status === "pending") {
    await query(
      `UPDATE amistades SET status = 'accepted', resolved_at = now() WHERE from_id = $1 AND to_id = $2`,
      [toId, meId]
    );
    await crearNotificacion(toId, "amistad_aceptada", meId);
    return NextResponse.json({ status: "accepted" });
  }

  await query(
    `INSERT INTO amistades (from_id, to_id, status) VALUES ($1, $2, 'pending')
     ON CONFLICT (from_id, to_id) DO UPDATE SET status = 'pending', created_at = now(), resolved_at = NULL`,
    [meId, toId]
  );
  await crearNotificacion(toId, "amistad_recibida", meId);

  return NextResponse.json({ status: "pending" });
}

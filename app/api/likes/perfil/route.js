import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { crearNotificacion } from "@/lib/notificaciones";

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

  const { rows: destinoRows } = await query(
    `SELECT 1 FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [toId]
  );
  if (!destinoRows[0]) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const { rowCount: existia } = await query(
    `DELETE FROM likes WHERE from_id = $1 AND to_id = $2`,
    [meId, toId]
  );

  if (existia) {
    return NextResponse.json({ meGusta: false, match: false });
  }

  await query(`INSERT INTO likes (from_id, to_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [meId, toId]);

  const { rows: reciprocoRows } = await query(
    `SELECT 1 FROM likes WHERE from_id = $1 AND to_id = $2`,
    [toId, meId]
  );

  if (reciprocoRows[0]) {
    const user1 = Math.min(meId, toId);
    const user2 = Math.max(meId, toId);
    await query(
      `INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user1, user2]
    );
    await crearNotificacion(toId, "match", meId);
    await crearNotificacion(meId, "match", toId);
    return NextResponse.json({ meGusta: true, match: true });
  }

  await crearNotificacion(toId, "like_perfil", meId);
  return NextResponse.json({ meGusta: true, match: false });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const photoId = body?.photoId;
  if (!photoId) {
    return NextResponse.json({ error: "Falta el id de la foto." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT id FROM photos WHERE id = $1 AND user_id = $2`,
      [photoId, session.user.id]
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Foto no encontrada." }, { status: 404 });
    }

    await client.query(`UPDATE photos SET is_avatar = false WHERE user_id = $1`, [session.user.id]);
    await client.query(`UPDATE photos SET is_avatar = true WHERE id = $1`, [photoId]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return NextResponse.json({ ok: true });
}

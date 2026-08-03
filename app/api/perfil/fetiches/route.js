import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, pool } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { rows: fetiches } = await query(
    `SELECT id, nombre, categoria FROM fetiches ORDER BY categoria, id`
  );

  const categorias = {};
  for (const f of fetiches) {
    if (!categorias[f.categoria]) categorias[f.categoria] = [];
    categorias[f.categoria].push({ id: f.id, nombre: f.nombre });
  }

  const { rows: seleccionadosRows } = await query(
    `SELECT fetiche_id FROM user_fetiches WHERE user_id = $1`,
    [session.user.id]
  );

  return NextResponse.json({
    categorias,
    seleccionados: seleccionadosRows.map((r) => r.fetiche_id),
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const feticheIds = body?.fetiche_ids;

  if (!Array.isArray(feticheIds) || !feticheIds.every((id) => Number.isInteger(id))) {
    return NextResponse.json({ error: "fetiche_ids debe ser un array de enteros." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM user_fetiches WHERE user_id = $1`, [session.user.id]);

    const idsUnicos = [...new Set(feticheIds)];
    for (const feticheId of idsUnicos) {
      await client.query(
        `INSERT INTO user_fetiches (user_id, fetiche_id) VALUES ($1, $2)`,
        [session.user.id, feticheId]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return NextResponse.json({ ok: true });
}

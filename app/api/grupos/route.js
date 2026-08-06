import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { ISLANDS } from "@/lib/constants";

const ISLAND_VALUES = ISLANDS.map((i) => i.value);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { rows } = await query(
    `SELECT g.id, g.nombre, g.descripcion, g.isla, g.created_at,
            (SELECT count(*)::int FROM grupo_miembros WHERE grupo_id = g.id) AS miembros_count,
            (SELECT texto FROM grupo_mensajes WHERE grupo_id = g.id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) AS ultimo_mensaje,
            EXISTS (SELECT 1 FROM grupo_miembros WHERE grupo_id = g.id AND user_id = $1) AS soy_miembro
       FROM grupos g
      ORDER BY g.isla NULLS LAST, g.nombre`,
    [session.user.id]
  );

  return NextResponse.json({ grupos: rows });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim() : "";
  const isla = body?.isla || null;

  if (!nombre || nombre.length > 50) {
    return NextResponse.json({ error: "El nombre debe tener entre 1 y 50 caracteres." }, { status: 400 });
  }
  if (descripcion.length > 200) {
    return NextResponse.json({ error: "La descripción no puede superar los 200 caracteres." }, { status: 400 });
  }
  if (isla && !ISLAND_VALUES.includes(isla)) {
    return NextResponse.json({ error: "Isla inválida." }, { status: 400 });
  }

  const { rows } = await query(
    `INSERT INTO grupos (nombre, descripcion, isla, creador_id) VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, descripcion, isla, created_at`,
    [nombre, descripcion || null, isla, session.user.id]
  );
  const grupo = rows[0];

  await query(
    `INSERT INTO grupo_miembros (grupo_id, user_id, rol) VALUES ($1, $2, 'admin')`,
    [grupo.id, session.user.id]
  );

  return NextResponse.json({ grupo: { ...grupo, miembros_count: 1, soy_miembro: true } });
}

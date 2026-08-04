import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { ISLANDS, LOOKING_FOR_OPTIONS } from "@/lib/constants";

const ISLAND_VALUES = ISLANDS.map((i) => i.value);
const LOOKING_FOR_VALUES = LOOKING_FOR_OPTIONS.map((l) => l.value);

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim() : "";
  const busco = Array.isArray(body?.busco) ? body.busco.filter((v) => LOOKING_FOR_VALUES.includes(v)) : [];
  const island = body?.island;

  if (!titulo || titulo.length > 80) {
    return NextResponse.json({ error: "El título debe tener entre 1 y 80 caracteres." }, { status: 400 });
  }
  if (!descripcion || descripcion.length > 300) {
    return NextResponse.json({ error: "La descripción debe tener entre 1 y 300 caracteres." }, { status: 400 });
  }
  if (!busco.length) {
    return NextResponse.json({ error: "Selecciona al menos qué buscas." }, { status: 400 });
  }
  if (!ISLAND_VALUES.includes(island)) {
    return NextResponse.json({ error: "Isla inválida." }, { status: 400 });
  }

  const { rows } = await query(
    `UPDATE anuncios SET titulo = $1, descripcion = $2, busco = $3, island = $4
      WHERE id = $5 AND user_id = $6 AND deleted_at IS NULL
      RETURNING id, titulo, descripcion, busco, island, created_at, expires_at`,
    [titulo, descripcion, busco, island, id, session.user.id]
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Anuncio no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ anuncio: rows[0] });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rowCount } = await query(
    `UPDATE anuncios SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, session.user.id]
  );

  if (!rowCount) {
    return NextResponse.json({ error: "Anuncio no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

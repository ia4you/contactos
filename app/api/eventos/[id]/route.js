import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { ISLANDS } from "@/lib/constants";

const ISLAND_VALUES = ISLANDS.map((i) => i.value);
const TIPOS = ["quedada", "fiesta", "club", "otro"];

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: eventoRows } = await query(
    `SELECT e.id, e.titulo, e.descripcion, e.isla, e.lugar, e.fecha_evento, e.aforo, e.tipo, e.foto, e.user_id, e.created_at,
            u.nick AS organizador_nick,
            (SELECT count(*)::int FROM evento_asistentes ea WHERE ea.evento_id = e.id AND ea.status = 'apuntado') AS apuntados_count,
            (SELECT count(*)::int FROM evento_asistentes ea WHERE ea.evento_id = e.id AND ea.status = 'interesado') AS interesados_count,
            (SELECT status FROM evento_asistentes ea WHERE ea.evento_id = e.id AND ea.user_id = $1) AS mi_status
       FROM eventos e
       JOIN users u ON u.id = e.user_id
      WHERE e.id = $2 AND e.deleted_at IS NULL`,
    [meId, id]
  );
  const evento = eventoRows[0];
  if (!evento) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  const { rows: asistentes } = await query(
    `SELECT u.id, u.nick, u.profile_type, ea.status,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM evento_asistentes ea
       JOIN users u ON u.id = ea.user_id
      WHERE ea.evento_id = $1 AND u.deleted_at IS NULL
      ORDER BY ea.created_at ASC`,
    [id]
  );

  return NextResponse.json({ evento, asistentes });
}

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
  const isla = body?.isla;
  const lugar = typeof body?.lugar === "string" ? body.lugar.trim() : "";
  const tipo = TIPOS.includes(body?.tipo) ? body.tipo : null;
  const aforo = body?.aforo != null && body.aforo !== "" ? Number(body.aforo) : null;

  if (!titulo || titulo.length > 100) {
    return NextResponse.json({ error: "El título debe tener entre 1 y 100 caracteres." }, { status: 400 });
  }
  if (!ISLAND_VALUES.includes(isla)) {
    return NextResponse.json({ error: "Isla inválida." }, { status: 400 });
  }
  if (!tipo) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }
  const fecha = new Date(body?.fechaEvento);
  if (Number.isNaN(fecha.getTime()) || fecha.getTime() < Date.now()) {
    return NextResponse.json({ error: "La fecha del evento debe ser válida y futura." }, { status: 400 });
  }
  if (aforo != null && (!Number.isInteger(aforo) || aforo < 1)) {
    return NextResponse.json({ error: "Aforo inválido." }, { status: 400 });
  }

  const { rows } = await query(
    `UPDATE eventos SET titulo = $1, descripcion = $2, isla = $3, lugar = $4, fecha_evento = $5, aforo = $6, tipo = $7
      WHERE id = $8 AND user_id = $9 AND deleted_at IS NULL
      RETURNING id, titulo, descripcion, isla, lugar, fecha_evento, aforo, tipo, foto, created_at`,
    [titulo, descripcion || null, isla, lugar || null, fecha.toISOString(), aforo, tipo, id, session.user.id]
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ evento: rows[0] });
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
    `UPDATE eventos SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [id, session.user.id]
  );

  if (!rowCount) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { ISLANDS } from "@/lib/constants";

const ISLAND_VALUES = ISLANDS.map((i) => i.value);
const TIPOS = ["quedada", "fiesta", "club", "otro"];
const LIMITE = 20;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const params = req.nextUrl.searchParams;
  const isla = params.get("isla");
  const tipo = params.get("tipo");
  const pasados = params.get("pasados") === "true";
  const offset = Math.max(0, Number(params.get("offset")) || 0);

  const condiciones = ["e.deleted_at IS NULL", pasados ? "e.fecha_evento <= now()" : "e.fecha_evento > now()"];
  const valores = [meId];

  function agregar(condicionFn, valor) {
    valores.push(valor);
    condiciones.push(condicionFn(valores.length));
  }

  if (isla && ISLAND_VALUES.includes(isla)) agregar((n) => `e.isla = $${n}`, isla);
  if (tipo && TIPOS.includes(tipo)) agregar((n) => `e.tipo = $${n}`, tipo);

  const limiteIdx = valores.length + 1;
  const offsetIdx = valores.length + 2;
  valores.push(LIMITE + 1, offset);

  const { rows } = await query(
    `SELECT e.id, e.titulo, e.descripcion, e.isla, e.lugar, e.fecha_evento, e.aforo, e.tipo, e.user_id, e.created_at,
            u.nick AS organizador_nick,
            (SELECT count(*)::int FROM evento_asistentes ea WHERE ea.evento_id = e.id AND ea.status = 'apuntado') AS apuntados_count,
            (SELECT count(*)::int FROM evento_asistentes ea WHERE ea.evento_id = e.id AND ea.status = 'interesado') AS interesados_count,
            (SELECT status FROM evento_asistentes ea WHERE ea.evento_id = e.id AND ea.user_id = $1) AS mi_status
       FROM eventos e
       JOIN users u ON u.id = e.user_id
      WHERE ${condiciones.join(" AND ")}
      ORDER BY e.fecha_evento ${pasados ? "DESC" : "ASC"}
      LIMIT $${limiteIdx} OFFSET $${offsetIdx}`,
    valores
  );

  const hasMore = rows.length > LIMITE;
  const eventos = rows.slice(0, LIMITE);

  return NextResponse.json({ eventos, hasMore });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim() : "";
  const isla = body?.isla;
  const lugar = typeof body?.lugar === "string" ? body.lugar.trim() : "";
  const fechaEvento = body?.fechaEvento;
  const aforo = body?.aforo != null && body.aforo !== "" ? Number(body.aforo) : null;
  const tipo = TIPOS.includes(body?.tipo) ? body.tipo : "quedada";

  if (!titulo || titulo.length > 100) {
    return NextResponse.json({ error: "El título debe tener entre 1 y 100 caracteres." }, { status: 400 });
  }
  if (!ISLAND_VALUES.includes(isla)) {
    return NextResponse.json({ error: "Isla inválida." }, { status: 400 });
  }
  const fecha = new Date(fechaEvento);
  if (Number.isNaN(fecha.getTime()) || fecha.getTime() < Date.now()) {
    return NextResponse.json({ error: "La fecha del evento debe ser válida y futura." }, { status: 400 });
  }
  if (aforo != null && (!Number.isInteger(aforo) || aforo < 1)) {
    return NextResponse.json({ error: "Aforo inválido." }, { status: 400 });
  }

  const { rows } = await query(
    `INSERT INTO eventos (user_id, titulo, descripcion, isla, lugar, fecha_evento, aforo, tipo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, titulo, descripcion, isla, lugar, fecha_evento, aforo, tipo, created_at`,
    [session.user.id, titulo, descripcion || null, isla, lugar || null, fecha.toISOString(), aforo, tipo]
  );

  return NextResponse.json({ evento: rows[0] });
}

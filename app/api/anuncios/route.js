import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { ISLANDS, LOOKING_FOR_OPTIONS } from "@/lib/constants";

const ISLAND_VALUES = ISLANDS.map((i) => i.value);
const LOOKING_FOR_VALUES = LOOKING_FOR_OPTIONS.map((l) => l.value);

const LIMITE = 20;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const islas = params.getAll("islas").filter((v) => ISLAND_VALUES.includes(v));
  const busco = params.getAll("busco").filter((v) => LOOKING_FOR_VALUES.includes(v));
  const offset = Math.max(0, Number(params.get("offset")) || 0);

  const condiciones = [
    "a.deleted_at IS NULL",
    "a.expires_at > now()",
    "u.deleted_at IS NULL",
    "NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))",
  ];
  const valores = [session.user.id];

  function agregar(condicionFn, valor) {
    valores.push(valor);
    condiciones.push(condicionFn(valores.length));
  }

  if (islas.length) agregar((n) => `a.island::text = ANY($${n}::text[])`, islas);
  if (busco.length) agregar((n) => `a.busco && $${n}::text[]`, busco);

  const limiteIdx = valores.length + 1;
  const offsetIdx = valores.length + 2;
  valores.push(LIMITE + 1, offset);

  const sql = `
    SELECT
      a.id, a.titulo, a.descripcion, a.busco, a.island, a.created_at, a.expires_at,
      u.id AS user_id, u.nick, u.profile_type,
      (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
    FROM anuncios a
    JOIN users u ON u.id = a.user_id
    WHERE ${condiciones.join(" AND ")}
    ORDER BY a.created_at DESC
    LIMIT $${limiteIdx} OFFSET $${offsetIdx}
  `;

  const { rows } = await query(sql, valores);
  const hasMore = rows.length > LIMITE;
  const anuncios = rows.slice(0, LIMITE);

  return NextResponse.json({ anuncios, hasMore });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
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

  const { rows: activo } = await query(
    `SELECT 1 FROM anuncios WHERE user_id = $1 AND deleted_at IS NULL AND expires_at > now()`,
    [session.user.id]
  );
  if (activo[0]) {
    return NextResponse.json({ error: "Ya tienes un anuncio activo. Edítalo en vez de crear uno nuevo." }, { status: 400 });
  }

  const { rows } = await query(
    `INSERT INTO anuncios (user_id, titulo, descripcion, busco, island)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, titulo, descripcion, busco, island, created_at, expires_at`,
    [session.user.id, titulo, descripcion, busco, island]
  );

  return NextResponse.json({ anuncio: rows[0] });
}

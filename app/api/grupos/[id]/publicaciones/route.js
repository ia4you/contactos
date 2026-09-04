import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { contieneVulgaridad, MENSAJE_RECHAZO } from "@/lib/filtroVulgar";
import { moderarConGroqEnSegundoPlano } from "@/lib/moderacionIA";

const LIMITE = 20;

async function esMiembro(grupoId, userId) {
  const { rows } = await query(
    `SELECT 1 FROM grupo_miembros WHERE grupo_id = $1 AND user_id = $2`,
    [grupoId, userId]
  );
  return Boolean(rows[0]);
}

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const grupoId = Number(params.id);
  if (!Number.isInteger(grupoId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);

  const { rows } = await query(
    `SELECT p.id, p.titulo, p.tipo, p.contenido, p.created_at,
            u.id AS user_id, u.nick, u.profile_type, u.island, u.last_active, u.show_last_seen,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename,
            (SELECT count(*)::int FROM publicacion_likes pl WHERE pl.publicacion_id = p.id) AS likes_count,
            (SELECT count(*)::int FROM comentarios c WHERE c.publicacion_id = p.id AND c.deleted_at IS NULL) AS comentarios_count,
            EXISTS (SELECT 1 FROM publicacion_likes pl2 WHERE pl2.publicacion_id = p.id AND pl2.user_id = $1) AS me_gusta
       FROM publicaciones p
       JOIN users u ON u.id = p.user_id
      WHERE p.grupo_id = $2 AND p.deleted_at IS NULL AND u.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $3 OFFSET $4`,
    [session.user.id, grupoId, LIMITE + 1, offset]
  );
  const hasMore = rows.length > LIMITE;

  return NextResponse.json({ publicaciones: rows.slice(0, LIMITE), hasMore });
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const grupoId = Number(params.id);
  if (!Number.isInteger(grupoId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const contenido = typeof body?.contenido === "string" ? body.contenido.trim() : "";

  if (!titulo || titulo.length > 150) {
    return NextResponse.json({ error: "El título debe tener entre 1 y 150 caracteres." }, { status: 400 });
  }
  if (!contenido || contenido.length > 3000) {
    return NextResponse.json({ error: "El texto debe tener entre 1 y 3000 caracteres." }, { status: 400 });
  }
  if (contieneVulgaridad(titulo) || contieneVulgaridad(contenido)) {
    return NextResponse.json({ error: MENSAJE_RECHAZO }, { status: 400 });
  }

  if (!(await esMiembro(grupoId, session.user.id))) {
    return NextResponse.json({ error: "Solo los miembros pueden publicar en el grupo." }, { status: 403 });
  }

  const { rows } = await query(
    `INSERT INTO publicaciones (user_id, tipo, contenido, titulo, grupo_id) VALUES ($1, 'texto', $2, $3, $4)
     RETURNING id, titulo, tipo, contenido, created_at`,
    [session.user.id, contenido, titulo, grupoId]
  );
  const publicacion = rows[0];

  const { rows: autorRows } = await query(
    `SELECT island, last_active, show_last_seen,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM users u WHERE id = $1`,
    [session.user.id]
  );
  const autor = autorRows[0] || {};

  moderarConGroqEnSegundoPlano({
    texto: `${titulo}\n\n${contenido}`,
    tabla: "publicaciones",
    id: publicacion.id,
    endpoint: "/api/grupos/publicaciones:texto",
    userId: session.user.id,
  }).catch((err) => console.error("Error en moderarConGroqEnSegundoPlano:", err));

  return NextResponse.json({
    publicacion: {
      ...publicacion,
      user_id: Number(session.user.id),
      nick: session.user.nick,
      profile_type: session.user.profileType,
      island: autor.island,
      last_active: autor.last_active,
      show_last_seen: autor.show_last_seen,
      avatar_filename: autor.avatar_filename ?? null,
      likes_count: 0,
      comentarios_count: 0,
      me_gusta: false,
    },
  });
}

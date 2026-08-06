import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

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

  if (!(await esMiembro(grupoId, session.user.id))) {
    return NextResponse.json({ error: "Solo los miembros pueden ver los mensajes." }, { status: 403 });
  }

  const { rows } = await query(
    `SELECT gm.id, gm.user_id, gm.texto, gm.created_at, u.nick,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM grupo_mensajes gm
       JOIN users u ON u.id = gm.user_id
      WHERE gm.grupo_id = $1 AND gm.deleted_at IS NULL
      ORDER BY gm.created_at DESC
      LIMIT 50`,
    [grupoId]
  );

  return NextResponse.json({ mensajes: rows.reverse() });
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const grupoId = Number(params.id);
  const texto = (await req.json().catch(() => null))?.texto?.trim();
  if (!Number.isInteger(grupoId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  if (!texto || texto.length > 2000) {
    return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  }

  if (!(await esMiembro(grupoId, session.user.id))) {
    return NextResponse.json({ error: "Solo los miembros pueden escribir en el grupo." }, { status: 403 });
  }

  const { rows } = await query(
    `INSERT INTO grupo_mensajes (grupo_id, user_id, texto) VALUES ($1, $2, $3)
     RETURNING id, texto, created_at`,
    [grupoId, session.user.id, texto]
  );

  return NextResponse.json({
    mensaje: { ...rows[0], user_id: Number(session.user.id), nick: session.user.nick },
  });
}

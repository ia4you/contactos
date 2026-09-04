import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

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

  const { rows: grupoRows } = await query(
    `SELECT g.id, g.nombre, g.descripcion, g.normas, g.isla, g.creador_id,
            (SELECT count(*)::int FROM grupo_miembros WHERE grupo_id = g.id) AS miembros_count,
            EXISTS (SELECT 1 FROM grupo_miembros WHERE grupo_id = g.id AND user_id = $1) AS soy_miembro,
            COALESCE((SELECT rol FROM grupo_miembros WHERE grupo_id = g.id AND user_id = $1), null) AS mi_rol
       FROM grupos g WHERE g.id = $2`,
    [meId, id]
  );
  const grupo = grupoRows[0];
  if (!grupo) {
    return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
  }

  // Auto-unión al grupo de la propia isla la primera vez que se visita.
  if (!grupo.soy_miembro) {
    const { rows: userRows } = await query(`SELECT island FROM users WHERE id = $1`, [meId]);
    if (userRows[0]?.island === grupo.isla) {
      await query(
        `INSERT INTO grupo_miembros (grupo_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [id, meId]
      );
      grupo.soy_miembro = true;
      grupo.mi_rol = "miembro";
      grupo.miembros_count += 1;
    }
  }

  const { rows: miembros } = await query(
    `SELECT u.id, u.nick, u.profile_type, gm.rol,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM grupo_miembros gm
       JOIN users u ON u.id = gm.user_id
      WHERE gm.grupo_id = $1 AND u.deleted_at IS NULL
      ORDER BY gm.joined_at ASC`,
    [id]
  );

  return NextResponse.json({ grupo, miembros });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows } = await query(`SELECT creador_id FROM grupos WHERE id = $1`, [id]);
  const grupo = rows[0];
  if (!grupo) {
    return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
  }
  if (grupo.creador_id !== meId) {
    return NextResponse.json({ error: "Solo el creador puede eliminar el grupo." }, { status: 403 });
  }

  // El borrado es en cascada a nivel de BD (grupo_miembros, grupo_mensajes
  // y grupo_feed_eventos referencian grupos.id con ON DELETE CASCADE), así
  // que un solo DELETE limpia todo lo asociado sin queries adicionales.
  await query(`DELETE FROM grupos WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: rolRows } = await query(
    `SELECT rol FROM grupo_miembros WHERE grupo_id = $1 AND user_id = $2`,
    [id, meId]
  );
  if (rolRows[0]?.rol !== "admin") {
    return NextResponse.json({ error: "Solo los administradores pueden editar el grupo." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim() : "";
  const normas = typeof body?.normas === "string" ? body.normas.trim() : "";

  if (!nombre || nombre.length > 50) {
    return NextResponse.json({ error: "El nombre debe tener entre 1 y 50 caracteres." }, { status: 400 });
  }
  if (descripcion.length > 200) {
    return NextResponse.json({ error: "La descripción no puede superar los 200 caracteres." }, { status: 400 });
  }
  if (normas.length > 2000) {
    return NextResponse.json({ error: "Las normas no pueden superar los 2000 caracteres." }, { status: 400 });
  }

  const { rows } = await query(
    `UPDATE grupos SET nombre = $1, descripcion = $2, normas = $3 WHERE id = $4
     RETURNING id, nombre, descripcion, normas, isla, creador_id`,
    [nombre, descripcion || null, normas || null, id]
  );
  if (!rows[0]) {
    return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ grupo: rows[0] });
}

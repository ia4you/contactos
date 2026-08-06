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
    `SELECT g.id, g.nombre, g.descripcion, g.isla,
            (SELECT count(*)::int FROM grupo_miembros WHERE grupo_id = g.id) AS miembros_count,
            EXISTS (SELECT 1 FROM grupo_miembros WHERE grupo_id = g.id AND user_id = $1) AS soy_miembro
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

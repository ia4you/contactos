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

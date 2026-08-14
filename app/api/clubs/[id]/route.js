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

  // La carpeta se llama [id] porque comparte nivel de ruta con
  // /api/clubs/[id]/eventos/[eventoId]/asistir (Next.js exige el mismo
  // nombre de segmento dinámico ahí), pero el detalle de club se pide por
  // slug desde el cliente — se acepta cualquiera de los dos.
  const esNumerico = /^\d+$/.test(params.id);
  const { rows: clubRows } = await query(
    esNumerico
      ? `SELECT id, nombre, slug, isla, descripcion, direccion, horario, telefono, email, web, foto1, foto2, foto3, destacado
           FROM clubs WHERE id = $1 AND activo = true`
      : `SELECT id, nombre, slug, isla, descripcion, direccion, horario, telefono, email, web, foto1, foto2, foto3, destacado
           FROM clubs WHERE slug = $1 AND activo = true`,
    [params.id]
  );
  const club = clubRows[0];
  if (!club) {
    return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
  }

  const { rows: eventos } = await query(
    `SELECT ce.id, ce.titulo, ce.descripcion, ce.fecha_evento, ce.aforo, ce.precio, ce.foto,
            (SELECT count(*)::int FROM club_evento_asistentes WHERE club_evento_id = ce.id) AS apuntados_count,
            EXISTS (SELECT 1 FROM club_evento_asistentes WHERE club_evento_id = ce.id AND user_id = $2) AS mi_apuntado
       FROM club_eventos ce
      WHERE ce.club_id = $1 AND ce.fecha_evento > now()
      ORDER BY ce.fecha_evento ASC`,
    [club.id, meId]
  );

  return NextResponse.json({ club, eventos });
}

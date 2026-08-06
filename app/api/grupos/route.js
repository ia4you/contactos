import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { rows } = await query(
    `SELECT g.id, g.nombre, g.descripcion, g.isla, g.created_at,
            (SELECT count(*)::int FROM grupo_miembros WHERE grupo_id = g.id) AS miembros_count,
            (SELECT texto FROM grupo_mensajes WHERE grupo_id = g.id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) AS ultimo_mensaje,
            EXISTS (SELECT 1 FROM grupo_miembros WHERE grupo_id = g.id AND user_id = $1) AS soy_miembro
       FROM grupos g
      ORDER BY g.isla NULLS LAST, g.nombre`,
    [session.user.id]
  );

  return NextResponse.json({ grupos: rows });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

const LIMITE = 30;

const CATEGORIAS = {
  likes: ["like_perfil", "like_foto", "like_publicacion"],
  comentarios: ["comentario"],
  amistades: ["amistad_recibida", "amistad_aceptada"],
  visitas: ["visita"],
};

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);
  const limiteParam = Number(req.nextUrl.searchParams.get("limite"));
  const limite = Number.isInteger(limiteParam) && limiteParam > 0 && limiteParam <= 50 ? limiteParam : LIMITE;
  const categoria = req.nextUrl.searchParams.get("categoria");
  const tipos = CATEGORIAS[categoria] || null;

  const condiciones = ["n.user_id = $1"];
  const params = [meId];
  if (tipos) {
    params.push(tipos);
    condiciones.push(`n.tipo = ANY($${params.length})`);
  }
  params.push(limite + 1, offset);

  const { rows } = await query(
    `SELECT n.id, n.tipo, n.entity_id, n.leida, n.created_at,
            u.id AS from_id, u.nick, u.profile_type, u.is_demo, u.badge_especial, u.last_active, u.show_last_seen,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM notificaciones n
       LEFT JOIN users u ON u.id = n.from_user_id AND u.deleted_at IS NULL
      WHERE ${condiciones.join(" AND ")}
      ORDER BY n.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const hasMore = rows.length > limite;
  const notificaciones = rows.slice(0, limite);

  return NextResponse.json({ notificaciones, hasMore });
}

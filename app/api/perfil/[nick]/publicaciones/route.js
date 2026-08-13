import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { PUBLICACIONES_PERFIL_LIMITE as LIMITE } from "@/lib/constants";

// /perfil/[nick] ya exige sesión vía middleware (está en PROTECTED_ROUTES),
// pero las rutas /api/* quedan fuera de ese gate — cada endpoint valida su
// propia sesión, igual que el resto de la API (/api/feed/publicaciones,
// /api/notificaciones, etc.), para no depender de que solo se llame desde
// esa página.
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);

  const { rows: userRows } = await query(
    `SELECT id FROM users WHERE lower(nick) = lower($1) AND deleted_at IS NULL`,
    [params.nick]
  );
  const usuario = userRows[0];
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const { rows } = await query(
    `SELECT p.id, p.tipo, p.contenido, p.created_at, ph.filename AS photo_filename
       FROM publicaciones p
       LEFT JOIN photos ph ON ph.id = p.photo_id
      WHERE p.user_id = $1 AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
    [usuario.id, LIMITE + 1, offset]
  );

  const hasMore = rows.length > LIMITE;
  const publicaciones = rows.slice(0, LIMITE);

  return NextResponse.json({ publicaciones, hasMore });
}

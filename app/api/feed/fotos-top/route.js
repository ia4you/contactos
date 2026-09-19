import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

// El bloqueo entre usuarios es distinto para cada visitante, así que el
// resultado se cachea por usuario (igual que /api/recomendaciones), no de
// forma global.
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const cacheado = cache.get(meId);
  if (cacheado && cacheado.expiresAt > Date.now()) {
    return NextResponse.json({ fotos: cacheado.data, cache: true });
  }

  const { rows } = await query(
    `SELECT * FROM (
       SELECT p.id, p.filename, u.id AS user_id, u.nick,
              -- Una foto cuenta sus likes en foto_likes o en
              -- publicacion_likes, nunca en ambas a la vez (ver
              -- POST /api/likes/foto): si tiene wrapper en publicaciones,
              -- ese es el origen autoritativo, aunque foto_likes conserve
              -- alguna fila histórica de antes de unificar los likes (DIFF
              -- 2) — sumar las dos tablas duplicaría esos likes antiguos.
              (CASE WHEN pub.id IS NULL
                    THEN (SELECT count(*)::int FROM foto_likes fl
                           WHERE fl.photo_id = p.id AND fl.created_at > now() - interval '24 hours')
                    ELSE (SELECT count(*)::int FROM publicacion_likes pl
                           WHERE pl.publicacion_id = pub.id AND pl.created_at > now() - interval '24 hours')
               END) AS likes_count
         FROM photos p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN publicaciones pub ON pub.photo_id = p.id AND pub.tipo = 'foto' AND pub.deleted_at IS NULL
        WHERE p.status = 'approved'
          AND p.is_private = false
          AND u.deleted_at IS NULL
          AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
     ) sub
     WHERE likes_count > 0
     ORDER BY likes_count DESC
     LIMIT 3`,
    [meId]
  );

  cache.set(meId, { data: rows, expiresAt: Date.now() + CACHE_TTL_MS });

  return NextResponse.json({ fotos: rows });
}

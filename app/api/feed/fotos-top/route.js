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
    `SELECT p.id, p.filename, u.id AS user_id, u.nick,
            count(fl.user_id)::int AS likes_count
       FROM foto_likes fl
       JOIN photos p ON p.id = fl.photo_id
       JOIN users u ON u.id = p.user_id
      WHERE fl.created_at > now() - interval '24 hours'
        AND p.status = 'approved'
        AND p.is_private = false
        AND u.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      GROUP BY p.id, p.filename, u.id, u.nick
      ORDER BY likes_count DESC
      LIMIT 3`,
    [meId]
  );

  cache.set(meId, { data: rows, expiresAt: Date.now() + CACHE_TTL_MS });

  return NextResponse.json({ fotos: rows });
}

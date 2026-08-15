import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const LIMITE = 9;

// Pública: el listado de artículos no requiere sesión, igual que la propia
// página /blog (importante para SEO).
export async function GET(req) {
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);

  const { rows } = await query(
    `SELECT id, titulo, slug, extracto, foto, publicado_at
       FROM blog_posts
      WHERE publicado = true
      ORDER BY publicado_at DESC
      LIMIT $1 OFFSET $2`,
    [LIMITE + 1, offset]
  );

  const hasMore = rows.length > LIMITE;
  const posts = rows.slice(0, LIMITE);

  return NextResponse.json({ posts, hasMore });
}

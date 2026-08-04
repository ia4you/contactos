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
    `SELECT id, titulo, descripcion, busco, island, created_at, expires_at
       FROM anuncios
      WHERE user_id = $1 AND deleted_at IS NULL AND expires_at > now()
      ORDER BY created_at DESC
      LIMIT 1`,
    [session.user.id]
  );

  return NextResponse.json({ anuncio: rows[0] ?? null });
}

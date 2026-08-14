import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const { rows: fotos } = await query(
    `SELECT p.id, p.filename,
            (SELECT count(*)::int FROM foto_likes fl WHERE fl.photo_id = p.id) AS likes_count
       FROM photos p
      WHERE p.user_id = $1 AND p.status = 'approved'
      ORDER BY likes_count DESC, p.created_at DESC`,
    [meId]
  );

  return NextResponse.json({ fotos });
}

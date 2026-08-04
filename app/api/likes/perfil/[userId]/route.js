import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const userId = Number(params.userId);
  const meId = Number(session.user.id);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: likeRows } = await query(
    `SELECT 1 FROM likes WHERE from_id = $1 AND to_id = $2`,
    [meId, userId]
  );

  const user1 = Math.min(meId, userId);
  const user2 = Math.max(meId, userId);
  const { rows: matchRows } = await query(
    `SELECT 1 FROM matches WHERE user1_id = $1 AND user2_id = $2`,
    [user1, user2]
  );

  return NextResponse.json({ meGusta: Boolean(likeRows[0]), match: Boolean(matchRows[0]) });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  await query(`UPDATE users SET ultima_vista_likes = now() WHERE id = $1`, [session.user.id]);

  return NextResponse.json({ ok: true });
}

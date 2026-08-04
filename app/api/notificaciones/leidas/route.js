import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  await query(`UPDATE notificaciones SET leida = true WHERE user_id = $1 AND leida = false`, [session.user.id]);

  return NextResponse.json({ ok: true });
}

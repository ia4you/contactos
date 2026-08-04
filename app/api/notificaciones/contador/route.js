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
    `SELECT count(*)::int AS no_leidas FROM notificaciones WHERE user_id = $1 AND leida = false`,
    [session.user.id]
  );

  return NextResponse.json({ noLeidas: rows[0].no_leidas });
}

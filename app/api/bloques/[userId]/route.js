import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  await query(
    `DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2`,
    [session.user.id, params.userId]
  );

  return NextResponse.json({ ok: true });
}

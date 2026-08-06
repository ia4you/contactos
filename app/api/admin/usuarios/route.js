import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

const LIMITE = 50;

export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset")) || 0);

  const { rows } = await query(
    `SELECT u.id, u.nick, u.island, u.profile_type, u.created_at, u.last_active, u.deleted_at, u.role,
            (SELECT count(*)::int FROM photos WHERE user_id = u.id AND status = 'approved') AS fotos_count
       FROM users u
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2`,
    [LIMITE + 1, offset]
  );

  const hasMore = rows.length > LIMITE;
  const usuarios = rows.slice(0, LIMITE);

  return NextResponse.json({ usuarios, hasMore });
}

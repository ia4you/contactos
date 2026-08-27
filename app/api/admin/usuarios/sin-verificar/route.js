import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { rows } = await query(
    `SELECT id, nick, email, created_at
       FROM users
      WHERE email_verified_at IS NULL
        AND is_demo = false
        AND deleted_at IS NULL
      ORDER BY created_at DESC`
  );

  return NextResponse.json({ usuarios: rows });
}

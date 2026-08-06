import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { rows } = await query(
    `SELECT r.id, r.reason, r.status, r.created_at,
            reporter.nick AS reporter_nick,
            reported.nick AS reported_nick
       FROM reports r
       JOIN users reporter ON reporter.id = r.reporter_id
       JOIN users reported ON reported.id = r.reported_id
      WHERE r.status = 'open'
      ORDER BY r.created_at DESC`
  );

  return NextResponse.json({ denuncias: rows });
}

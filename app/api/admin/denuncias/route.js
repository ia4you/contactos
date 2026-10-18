import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { rows } = await query(
    `SELECT r.id, r.reported_id, r.reason, r.status, r.created_at,
            COALESCE(reporter.nick, 'Cuenta eliminada') AS reporter_nick,
            COALESCE(reported.nick, r.reported_constancia, 'Cuenta eliminada') AS reported_nick
       FROM reports r
       -- LEFT JOIN: las denuncias sobreviven al borrado definitivo de las cuentas.
       LEFT JOIN users reporter ON reporter.id = r.reporter_id
       LEFT JOIN users reported ON reported.id = r.reported_id
      WHERE r.status = 'open'
      ORDER BY r.created_at DESC`
  );

  return NextResponse.json({ denuncias: rows });
}

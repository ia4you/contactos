import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { rows } = await query(`
    SELECT
      (SELECT count(*)::int FROM users WHERE deleted_at IS NULL) AS total_usuarios,
      (SELECT count(*)::int FROM users WHERE deleted_at IS NULL AND created_at::date = now()::date) AS nuevos_hoy,
      (SELECT count(*)::int FROM photos WHERE status = 'pending') AS fotos_pendientes,
      (SELECT count(*)::int FROM reports WHERE status = 'open') AS denuncias_abiertas,
      (SELECT count(*)::int FROM mensajes WHERE created_at::date = now()::date AND deleted_at IS NULL) AS mensajes_hoy,
      (SELECT count(*)::int FROM groq_usage WHERE created_at::date = now()::date) AS llamadas_groq_hoy
  `);

  return NextResponse.json(rows[0]);
}

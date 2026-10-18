import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { suspenderCuenta } from "@/lib/adminCuentas";

export async function PATCH(req, { params }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const r = await suspenderCuenta(pool, { adminId: session.user.id, userId: Number(params.id), motivo: body?.motivo });
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { reactivarCuenta } from "@/lib/adminCuentas";

export async function PATCH(req, { params }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const r = await reactivarCuenta(pool, { adminId: session.user.id, userId: Number(params.id) });
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ ok: true });
}

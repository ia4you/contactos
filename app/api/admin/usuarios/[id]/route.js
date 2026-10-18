import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { eliminarCuentaDefinitivamente } from "@/lib/adminCuentas";

// Borrado definitivo (irreversible) de una cuenta suspendida o pendiente de
// borrado. El cuerpo debe traer { confirmacionNick } igual al nick.
export async function DELETE(req, { params }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const r = await eliminarCuentaDefinitivamente(pool, {
    adminId: session.user.id,
    userId: Number(params.id),
    confirmacionNick: body?.confirmacionNick,
  });
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ ok: true });
}

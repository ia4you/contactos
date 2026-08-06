import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rowCount } = await query(
    `UPDATE reports SET status = 'resolved' WHERE id = $1 AND status = 'open'`,
    [id]
  );
  if (!rowCount) {
    return NextResponse.json({ error: "Denuncia no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

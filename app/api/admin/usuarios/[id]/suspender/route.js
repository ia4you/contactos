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

  const { rows: targetRows } = await query(`SELECT role FROM users WHERE id = $1`, [id]);
  if (!targetRows[0]) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  if (targetRows[0].role === "admin") {
    return NextResponse.json({ error: "No se puede suspender a un administrador." }, { status: 400 });
  }

  await query(`UPDATE users SET deleted_at = now() WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}

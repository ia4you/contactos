import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

// Verificación manual de email (p.ej. cuando el correo de verificación no
// llega por el bloqueo conocido de Hotmail/Outlook). Solo marca
// email_verified_at; no envía ningún email ni realiza otra acción.
export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: targetRows } = await query(`SELECT email_verified_at FROM users WHERE id = $1`, [id]);
  if (!targetRows[0]) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }
  if (targetRows[0].email_verified_at) {
    return NextResponse.json({ error: "Este email ya estaba verificado." }, { status: 400 });
  }

  await query(`UPDATE users SET email_verified_at = now() WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}

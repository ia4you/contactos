import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: "Token no válido o contraseña demasiado corta." },
      { status: 400 }
    );
  }

  const { rows } = await query(
    `SELECT user_id, expires_at FROM email_tokens WHERE token = $1 AND purpose = 'reset_password'`,
    [token]
  );
  const fila = rows[0];

  if (!fila || new Date(fila.expires_at) < new Date()) {
    return NextResponse.json({ error: "El enlace no es válido o ha caducado." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, fila.user_id]);
  await query(`DELETE FROM email_tokens WHERE token = $1`, [token]);

  return NextResponse.json({ ok: true });
}

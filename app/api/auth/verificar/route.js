import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req) {
  const token = req.nextUrl.searchParams.get("token");
  const base = process.env.NEXTAUTH_URL;

  if (!token) {
    return NextResponse.redirect(new URL("/login?verificado=0", base));
  }

  const { rows } = await query(
    `SELECT user_id, expires_at FROM email_tokens WHERE token = $1 AND purpose = 'verify_email'`,
    [token]
  );
  const fila = rows[0];

  if (!fila || new Date(fila.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/login?verificado=0", base));
  }

  // Se comprueba antes de actualizar para no publicar de nuevo si el token
  // se reutilizara sobre una cuenta ya verificada.
  const { rows: usuarioRows } = await query(`SELECT email_verified_at FROM users WHERE id = $1`, [fila.user_id]);
  const yaVerificado = Boolean(usuarioRows[0]?.email_verified_at);

  await query(`UPDATE users SET email_verified_at = now() WHERE id = $1`, [fila.user_id]);
  await query(`DELETE FROM email_tokens WHERE token = $1`, [token]);

  if (!yaVerificado) {
    await query(
      `INSERT INTO publicaciones (user_id, tipo, contenido) VALUES ($1, 'texto', $2)`,
      [fila.user_id, "¡Acabo de unirme a Contactos! 👋"]
    );
  }

  return NextResponse.redirect(new URL("/login?verificado=1", base));
}

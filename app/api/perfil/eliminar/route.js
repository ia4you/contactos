import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const { rows } = await query(`SELECT password_hash FROM users WHERE id = $1`, [session.user.id]);
  const usuario = rows[0];
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const valido = await bcrypt.compare(password, usuario.password_hash);
  if (!valido) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  await query(`UPDATE users SET deleted_at = now() WHERE id = $1`, [session.user.id]);

  return NextResponse.json({ ok: true });
}

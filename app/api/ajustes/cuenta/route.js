import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { mailer } from "@/lib/mailer";
import { crearTokenVerificacionEmail } from "@/lib/tokens";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const accion = body?.accion;

  const { rows } = await query(`SELECT password_hash FROM users WHERE id = $1`, [session.user.id]);
  const usuario = rows[0];
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const passwordActualValida = await bcrypt.compare(body?.currentPassword || "", usuario.password_hash);
  if (!passwordActualValida) {
    return NextResponse.json({ error: "Contraseña actual incorrecta." }, { status: 401 });
  }

  if (accion === "email") {
    const nuevoEmail = typeof body?.newEmail === "string" ? body.newEmail.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(nuevoEmail)) {
      return NextResponse.json({ error: "Email no válido." }, { status: 400 });
    }

    try {
      await query(
        `UPDATE users SET email = $1, email_verified_at = NULL WHERE id = $2`,
        [nuevoEmail, session.user.id]
      );
    } catch (err) {
      if (err.code === "23505") {
        return NextResponse.json({ error: "Ese email ya está en uso." }, { status: 409 });
      }
      console.error("Error al cambiar email:", err);
      return NextResponse.json({ error: "No se pudo actualizar el email." }, { status: 500 });
    }

    const token = await crearTokenVerificacionEmail(session.user.id);
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verificar?token=${token}`;

    try {
      await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: nuevoEmail,
        subject: "Confirma tu cuenta en contactos.turel.es",
        text: [
          "Has solicitado cambiar el email de tu cuenta.",
          "",
          "Para confirmar esta nueva dirección, pulsa el siguiente enlace:",
          verifyUrl,
          "",
          "Hasta que lo confirmes, deberás usar tu email anterior para iniciar sesión.",
        ].join("\n"),
      });
    } catch (err) {
      console.error("Error al enviar email de verificación:", err);
    }

    return NextResponse.json({ ok: true });
  }

  if (accion === "password") {
    const nuevaPassword = body?.newPassword;
    const repetirPassword = body?.repeatPassword;

    if (typeof nuevaPassword !== "string" || nuevaPassword.length < 8) {
      return NextResponse.json({ error: "La contraseña nueva debe tener al menos 8 caracteres." }, { status: 400 });
    }
    if (nuevaPassword !== repetirPassword) {
      return NextResponse.json({ error: "Las contraseñas no coinciden." }, { status: 400 });
    }

    const nuevoHash = await bcrypt.hash(nuevaPassword, 12);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [nuevoHash, session.user.id]);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { mailer } from "@/lib/mailer";
import { crearTokenResetPassword } from "@/lib/tokens";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email no válido." }, { status: 400 });
  }

  const { rows } = await query(
    `SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );

  // Respuesta siempre genérica, exista o no la cuenta, para no filtrar qué
  // emails están registrados.
  if (rows[0]) {
    const token = await crearTokenResetPassword(rows[0].id);
    const resetUrl = `${process.env.NEXTAUTH_URL}/recuperar/${token}`;

    try {
      await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Restablece tu contraseña en contactos.turel.es",
        text: [
          "Has solicitado restablecer tu contraseña.",
          "",
          "Pulsa el siguiente enlace para elegir una nueva contraseña (válido durante 1 hora):",
          resetUrl,
          "",
          "Si no has sido tú, puedes ignorar este mensaje.",
        ].join("\n"),
      });
    } catch (err) {
      console.error("Error al enviar email de recuperación:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

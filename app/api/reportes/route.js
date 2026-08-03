import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { mailer } from "@/lib/mailer";
import { CATEGORIAS_DENUNCIA } from "@/lib/reportes";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { reportedUserId, categoria, detalle } = body ?? {};

  if (!Number.isInteger(reportedUserId)) {
    return NextResponse.json({ error: "Usuario denunciado no válido." }, { status: 400 });
  }
  if (!CATEGORIAS_DENUNCIA.includes(categoria)) {
    return NextResponse.json({ error: "Motivo no válido." }, { status: 400 });
  }
  if (categoria === "Otro" && (typeof detalle !== "string" || detalle.trim().length === 0)) {
    return NextResponse.json({ error: "Describe brevemente el motivo." }, { status: 400 });
  }
  if (String(reportedUserId) === session.user.id) {
    return NextResponse.json({ error: "No puedes denunciarte a ti mismo." }, { status: 400 });
  }

  const { rows } = await query(
    `SELECT nick FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [reportedUserId]
  );
  const denunciado = rows[0];
  if (!denunciado) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const motivo = categoria === "Otro" ? `Otro: ${detalle.trim().slice(0, 500)}` : categoria;

  await query(
    `INSERT INTO reports (reporter_id, reported_id, reason) VALUES ($1, $2, $3)`,
    [session.user.id, reportedUserId, motivo]
  );

  const urlPerfil = `${process.env.NEXTAUTH_URL}/perfil/${denunciado.nick}`;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM,
      to: "jose@turel.es",
      subject: "Nueva denuncia en contactos.turel.es",
      text: [
        `Perfil denunciado: ${denunciado.nick}`,
        `Motivo: ${motivo}`,
        `Denunciante: ${session.user.nick}`,
        `URL del perfil: ${urlPerfil}`,
      ].join("\n"),
    });
  } catch (err) {
    // La denuncia ya quedó registrada en la BD; el fallo de envío no debe
    // romper la respuesta al usuario.
    console.error("Error al enviar email de denuncia:", err);
  }

  return NextResponse.json({ ok: true });
}

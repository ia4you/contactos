import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { mailer } from "@/lib/mailer";
import { crearTokenVerificacionEmail } from "@/lib/tokens";
import {
  ISLANDS,
  PROFILE_TYPES,
  LOOKING_FOR_OPTIONS,
  GENERO_OPTIONS,
  GENERO_MAX,
  ORIENTACION_OPTIONS,
  ORIENTACION_MAX,
  ROL_OPTIONS,
  ROL_MAX,
  esMayorDeEdad,
} from "@/lib/constants";

const ISLAND_VALUES = ISLANDS.map((i) => i.value);
const PROFILE_TYPE_VALUES = PROFILE_TYPES.map((p) => p.value);
const LOOKING_FOR_VALUES = LOOKING_FOR_OPTIONS.map((l) => l.value);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarMultiSelect(valores, opciones, max) {
  return (
    Array.isArray(valores) &&
    valores.length <= max &&
    valores.every((v) => opciones.includes(v))
  );
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const {
    profileType,
    herBirthdate,
    hisBirthdate,
    nick,
    genero,
    orientacion,
    rol,
    email,
    password,
    island,
    lookingFor,
    acceptTerms,
    acceptGdpr,
  } = body;

  if (!PROFILE_TYPE_VALUES.includes(profileType)) {
    return NextResponse.json({ error: "Tipo de perfil no válido." }, { status: 400 });
  }
  if (!ISLAND_VALUES.includes(island)) {
    return NextResponse.json({ error: "Isla no válida." }, { status: 400 });
  }
  if (
    !Array.isArray(lookingFor) ||
    lookingFor.length === 0 ||
    !lookingFor.every((v) => LOOKING_FOR_VALUES.includes(v))
  ) {
    return NextResponse.json({ error: "Selecciona al menos una opción en \"qué buscas\"." }, { status: 400 });
  }
  if (!validarMultiSelect(genero, GENERO_OPTIONS, GENERO_MAX)) {
    return NextResponse.json({ error: `Selecciona como máximo ${GENERO_MAX} opciones de género.` }, { status: 400 });
  }
  if (!validarMultiSelect(orientacion, ORIENTACION_OPTIONS, ORIENTACION_MAX)) {
    return NextResponse.json({ error: `Selecciona como máximo ${ORIENTACION_MAX} opciones de orientación.` }, { status: 400 });
  }
  if (!validarMultiSelect(rol, ROL_OPTIONS, ROL_MAX)) {
    return NextResponse.json({ error: `Selecciona como máximo ${ROL_MAX} opciones de rol.` }, { status: 400 });
  }
  if (acceptTerms !== true || acceptGdpr !== true) {
    return NextResponse.json(
      { error: "Debes aceptar los términos y el consentimiento de datos." },
      { status: 400 }
    );
  }

  const nickLimpio = typeof nick === "string" ? nick.trim() : "";
  if (nickLimpio.length < 3 || nickLimpio.length > 24) {
    return NextResponse.json({ error: "El nick debe tener entre 3 y 24 caracteres." }, { status: 400 });
  }

  const emailLimpio = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(emailLimpio)) {
    return NextResponse.json({ error: "Email no válido." }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  // Edad mínima: validación siempre en servidor, nunca solo en cliente.
  let her = null;
  let his = null;
  if (profileType === "pareja") {
    if (!esMayorDeEdad(herBirthdate) || !esMayorDeEdad(hisBirthdate)) {
      return NextResponse.json(
        { error: "Ambos miembros de la pareja deben ser mayores de 18 años." },
        { status: 400 }
      );
    }
    her = herBirthdate;
    his = hisBirthdate;
  } else {
    if (!esMayorDeEdad(herBirthdate)) {
      return NextResponse.json({ error: "Debes ser mayor de 18 años." }, { status: 400 });
    }
    her = herBirthdate;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let userId;
  try {
    const { rows } = await query(
      `INSERT INTO users
         (email, password_hash, nick, profile_type, island, her_birthdate, his_birthdate,
          looking_for, genero, orientacion, rol, gdpr_consent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
       RETURNING id`,
      [
        emailLimpio,
        passwordHash,
        nickLimpio,
        profileType,
        island,
        her,
        his,
        lookingFor,
        genero || [],
        orientacion || [],
        rol || [],
      ]
    );
    userId = rows[0].id;
  } catch (err) {
    if (err.code === "23505") {
      const campo = err.constraint?.includes("nick") ? "nick" : "email";
      return NextResponse.json(
        { error: campo === "nick" ? "Ese nick ya está en uso." : "Ese email ya está registrado." },
        { status: 409 }
      );
    }
    console.error("Error al registrar usuario:", err);
    return NextResponse.json({ error: "No se pudo completar el registro." }, { status: 500 });
  }

  const token = await crearTokenVerificacionEmail(userId);
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verificar?token=${token}`;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM,
      to: emailLimpio,
      subject: "Confirma tu cuenta en contactos.turel.es",
      text: [
        "Gracias por registrarte.",
        "",
        "Para activar tu cuenta, confirma tu dirección de email pulsando el siguiente enlace:",
        verifyUrl,
        "",
        "Si no has solicitado este registro, puedes ignorar este mensaje.",
      ].join("\n"),
    });
  } catch (err) {
    // El usuario ya quedó registrado en la BD; el fallo de envío no debe
    // romper la respuesta, pero sí queda registrado para poder reenviar.
    console.error("Error al enviar email de verificación:", err);
  }

  return NextResponse.json({ ok: true });
}

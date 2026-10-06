import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import bcrypt from "bcryptjs";
import formidable from "formidable";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { pool } from "@/lib/db";
import { directorioSubidasUsuario, MAX_TAMANO_FOTO } from "@/lib/uploads";
import { auditarFoto } from "@/lib/auditoria";
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

export const runtime = "nodejs";

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

// En el registro solo se admiten jpg/png (más restrictivo que la galería,
// que también acepta webp). Se comprueba el formato real con sharp, no solo
// el MIME declarado por el navegador.
const MIME_FOTO_REGISTRO = ["image/jpeg", "image/png"];
const FORMATOS_FOTO_REGISTRO = ["jpeg", "png"];
const MAX_MB = MAX_TAMANO_FOTO / (1024 * 1024);

function errorJson(mensaje, status = 400) {
  return NextResponse.json({ error: mensaje }, { status });
}

// Los datos del formulario llegan como JSON en el campo "datos" (hay arrays
// que no encajan bien como campos multipart) y la foto en el campo "foto".
async function parseFormulario(req) {
  const nodeReq = Readable.fromWeb(req.body);
  nodeReq.headers = Object.fromEntries(req.headers);
  nodeReq.method = "POST";

  const form = formidable({
    uploadDir: os.tmpdir(),
    maxFiles: 1,
    maxFileSize: MAX_TAMANO_FOTO,
    maxFieldsSize: 64 * 1024,
  });

  return new Promise((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req) {
  if (!req.headers.get("content-type")?.startsWith("multipart/form-data")) {
    return errorJson("Debes subir una foto de perfil para registrarte.");
  }

  let fields;
  let files;
  try {
    ({ fields, files } = await parseFormulario(req));
  } catch (err) {
    if (err.httpCode === 413) {
      return errorJson(`La foto de perfil no puede superar ${MAX_MB} MB.`);
    }
    console.error("Error al procesar el formulario de registro:", err);
    return errorJson("Solicitud inválida.");
  }

  const archivo = Array.isArray(files.foto) ? files.foto[0] : files.foto;
  try {
    return await registrar(req, fields, archivo);
  } finally {
    if (archivo) await fs.unlink(archivo.filepath).catch(() => {});
  }
}

async function registrar(req, fields, archivo) {
  const datos = Array.isArray(fields.datos) ? fields.datos[0] : fields.datos;
  let body = null;
  try {
    body = JSON.parse(datos);
  } catch {}
  if (!body || typeof body !== "object") {
    return errorJson("Solicitud inválida.");
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
    acceptCapturas,
    certificoFoto,
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
  if (acceptTerms !== true || acceptGdpr !== true || acceptCapturas !== true) {
    return NextResponse.json(
      { error: "Debes aceptar los términos, el consentimiento de datos y el compromiso sobre capturas de contenido ajeno." },
      { status: 400 }
    );
  }

  const nickLimpio = typeof nick === "string" ? nick.trim() : "";
  if (nickLimpio.length < 3 || nickLimpio.length > 24) {
    return NextResponse.json({ error: "El nick debe tener entre 3 y 24 caracteres." }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(nickLimpio)) {
    return NextResponse.json({ error: "El nick solo puede contener letras, números, guiones y guion bajo (sin espacios)." }, { status: 400 });
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

  // Foto de perfil obligatoria: validación en servidor, no solo en cliente.
  if (!archivo || archivo.size === 0) {
    return errorJson("Debes subir una foto de perfil para registrarte.");
  }
  if (!MIME_FOTO_REGISTRO.includes(archivo.mimetype)) {
    return errorJson("La foto de perfil debe ser una imagen JPG o PNG.");
  }
  // Misma certificación que se exige en cualquier otra subida de fotos.
  if (certificoFoto !== true) {
    return errorJson("Debes certificar que todas las personas de la foto de perfil son mayores de edad y han consentido.");
  }

  // Se procesa la imagen ANTES de crear el usuario: si no es una imagen
  // válida, el registro se rechaza sin dejar nada a medias en la BD.
  let fotoWebp;
  try {
    const { format } = await sharp(archivo.filepath).metadata();
    if (!FORMATOS_FOTO_REGISTRO.includes(format)) {
      return errorJson("La foto de perfil debe ser una imagen JPG o PNG.");
    }
    // Mismo tratamiento que /api/perfil/fotos: WebP, máx. 1200px, calidad 80.
    fotoWebp = await sharp(archivo.filepath)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return errorJson("No se pudo procesar la foto de perfil. Prueba con otra imagen JPG o PNG.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Usuario + foto de perfil en una sola transacción: no puede quedar un
  // usuario registrado sin foto.
  let userId;
  let rutaFoto = null;
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    return errorJson("No se pudo completar el registro.", 500);
  }
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO users
         (email, password_hash, nick, profile_type, island, her_birthdate, his_birthdate,
          looking_for, genero, orientacion, rol, gdpr_consent_at, acepto_terminos_captura)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())
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

    const nombreFoto = `${uuidv4()}.webp`;
    const { rows: fotoRows } = await client.query(
      `INSERT INTO photos (user_id, filename, is_avatar, status)
       VALUES ($1, $2, true, 'approved')
       RETURNING id`,
      [userId, nombreFoto]
    );
    // Wrapper oculto en `publicaciones`, igual que en /api/perfil/fotos, para
    // que la foto pueda comentarse/dar like sin aparecer en el feed.
    await client.query(
      `INSERT INTO publicaciones (user_id, tipo, contenido, photo_id, visible_en_feed)
       VALUES ($1, 'foto', NULL, $2, false)`,
      [userId, fotoRows[0].id]
    );

    const dir = directorioSubidasUsuario(userId);
    await fs.mkdir(dir, { recursive: true });
    rutaFoto = path.join(dir, nombreFoto);
    await fs.writeFile(rutaFoto, fotoWebp);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    if (rutaFoto) await fs.unlink(rutaFoto).catch(() => {});
    if (err.code === "23505") {
      const campo = err.constraint?.includes("nick") ? "nick" : "email";
      return NextResponse.json(
        { error: campo === "nick" ? "Ese nick ya está en uso." : "Ese email ya está registrado." },
        { status: 409 }
      );
    }
    console.error("Error al registrar usuario:", err);
    return NextResponse.json({ error: "No se pudo completar el registro." }, { status: 500 });
  } finally {
    client.release();
  }

  auditarFoto(req, { userId, accion: "alta_avatar" });

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

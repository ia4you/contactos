import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Readable } from "node:stream";
import fs from "node:fs/promises";
import path from "node:path";
import formidable from "formidable";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { query, pool } from "@/lib/db";
import { auditarFoto } from "@/lib/auditoria";
import { borrarFoto, fijarAvatar } from "@/lib/fotosPerfil";
import { directorioSubidasUsuario, MIME_A_EXTENSION, MAX_TAMANO_FOTO } from "@/lib/uploads";

export const runtime = "nodejs";

async function parseFormulario(req, uploadDir) {
  const nodeReq = Readable.fromWeb(req.body);
  nodeReq.headers = Object.fromEntries(req.headers);
  nodeReq.method = "POST";

  const form = formidable({
    uploadDir,
    maxFileSize: MAX_TAMANO_FOTO,
    filter: ({ mimetype }) => Boolean(mimetype && MIME_A_EXTENSION[mimetype]),
  });

  return new Promise((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const userId = session.user.id;
  const uploadDir = directorioSubidasUsuario(userId);
  await fs.mkdir(uploadDir, { recursive: true });

  let files;
  let fields;
  try {
    ({ files, fields } = await parseFormulario(req, uploadDir));
  } catch (err) {
    console.error("Error al procesar la subida:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la imagen. Máximo 5MB, formatos jpg/png/webp." },
      { status: 400 }
    );
  }

  const archivo = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!archivo) {
    return NextResponse.json(
      { error: "Formato no admitido. Solo jpg, png o webp, hasta 5MB." },
      { status: 400 }
    );
  }

  const campo = (nombre) => {
    const v = fields[nombre];
    return Array.isArray(v) ? v[0] : v;
  };

  // La certificación de mayoría de edad y consentimiento es obligatoria y se
  // valida en el servidor, no solo deshabilitando el botón en el cliente.
  if (campo("certifico") !== "true") {
    await fs.unlink(archivo.filepath).catch(() => {});
    return NextResponse.json(
      { error: "Debes certificar que todas las personas de la foto son mayores de edad y han consentido." },
      { status: 400 }
    );
  }

  const caption = typeof campo("caption") === "string" ? campo("caption").trim().slice(0, 200) : null;

  // Se recomprime siempre a WebP (máx. 1200px de ancho, calidad 80): las
  // fotos originales del móvil suelen pesar 2-5MB y esto las deja en
  // 100-200KB sin pérdida visible, además de normalizar el formato de
  // almacenamiento pase lo que suba el usuario (jpg/png/webp).
  const nombreFinal = `${uuidv4()}.webp`;
  const rutaFinal = path.join(uploadDir, nombreFinal);
  try {
    await sharp(archivo.filepath)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(rutaFinal);
  } catch (err) {
    console.error("Error al procesar la imagen con sharp:", err);
    return NextResponse.json({ error: "No se pudo procesar la imagen." }, { status: 400 });
  } finally {
    await fs.unlink(archivo.filepath).catch(() => {});
  }

  // Sin moderación previa: la foto queda aprobada y visible de inmediato.
  // La certificación anterior traslada la responsabilidad legal a quien
  // sube la foto; "rechazada" sigue existiendo para que un admin pueda
  // retirarla a posteriori si hace falta.
  // Foto + wrapper oculto en `publicaciones` (visible_en_feed = false, para
  // que pueda comentarse/dar like sin aparecer en el feed) + cambio de avatar
  // opcional, todo en una transacción: si algo falla, el avatar anterior
  // sigue intacto. La foto anterior pasa a ser una foto normal (no se borra).
  const comoAvatar = campo("avatar") === "true";
  let foto;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO photos (user_id, filename, caption, status) VALUES ($1, $2, $3, 'approved')
       RETURNING id, filename, caption, is_private, is_avatar, status, created_at`,
      [userId, nombreFinal, caption || null]
    );
    foto = rows[0];
    await client.query(
      `INSERT INTO publicaciones (user_id, tipo, contenido, photo_id, visible_en_feed)
       VALUES ($1, 'foto', $2, $3, false)`,
      [userId, caption || null, foto.id]
    );
    if (comoAvatar) {
      if (!(await fijarAvatar(client, userId, foto.id))) throw new Error("avatar no fijado");
      foto.is_avatar = true;
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    await fs.unlink(rutaFinal).catch(() => {});
    auditarFoto(req, { userId, accion: comoAvatar ? "subir_avatar" : "subir", resultado: "error" });
    console.error("Error al guardar la foto:", err);
    return NextResponse.json({ error: "No se pudo guardar la foto." }, { status: 500 });
  } finally {
    client.release();
  }

  auditarFoto(req, { userId, photoId: foto.id, accion: comoAvatar ? "subir_avatar" : "subir" });
  return NextResponse.json({ foto });
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { photoId, isPrivate } = body ?? {};
  if (!photoId || typeof isPrivate !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { rowCount } = await query(
    `UPDATE photos SET is_private = $1 WHERE id = $2 AND user_id = $3`,
    [isPrivate, photoId, session.user.id]
  );
  if (!rowCount) {
    return NextResponse.json({ error: "Foto no encontrada." }, { status: 404 });
  }

  // Al hacer una foto privada, su wrapper OCULTO deja de ser alcanzable
  // (soft-delete) para que no quede comentable/likeable por quien ya tuviera
  // el publicacion_id. Solo toca wrappers ocultos (visible_en_feed = false):
  // si la foto además es un post real y visible del feed, ese post no se
  // toca aquí — es una inconsistencia ya existente hoy (la foto se puede
  // marcar privada sin retirarla del feed) y queda fuera de este cambio.
  if (isPrivate) {
    await query(
      `UPDATE publicaciones SET deleted_at = now()
        WHERE photo_id = $1 AND visible_en_feed = false AND deleted_at IS NULL`,
      [photoId]
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta el id de la foto." }, { status: 400 });
  }

  const res = await borrarFoto({ query }, session.user.id, id);
  if (res.error) {
    auditarFoto(req, { userId: session.user.id, photoId: id, accion: "borrar", resultado: `denegado_${res.status}` });
    return NextResponse.json({ error: res.error }, { status: res.status });
  }
  auditarFoto(req, { userId: session.user.id, photoId: id, accion: "borrar" });

  const ruta = path.join(directorioSubidasUsuario(session.user.id), res.filename);
  await fs.unlink(ruta).catch(() => {});

  return NextResponse.json({ ok: true });
}

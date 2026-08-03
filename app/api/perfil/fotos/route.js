import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Readable } from "node:stream";
import fs from "node:fs/promises";
import path from "node:path";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
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

  const extension = MIME_A_EXTENSION[archivo.mimetype];
  const nombreFinal = `${uuidv4()}.${extension}`;
  const rutaFinal = path.join(uploadDir, nombreFinal);
  await fs.rename(archivo.filepath, rutaFinal);

  // Sin moderación previa: la foto queda aprobada y visible de inmediato.
  // La certificación anterior traslada la responsabilidad legal a quien
  // sube la foto; "rechazada" sigue existiendo para que un admin pueda
  // retirarla a posteriori si hace falta.
  const { rows } = await query(
    `INSERT INTO photos (user_id, filename, caption, status) VALUES ($1, $2, $3, 'approved')
     RETURNING id, filename, caption, is_private, is_avatar, status, created_at`,
    [userId, nombreFinal, caption || null]
  );

  return NextResponse.json({ foto: rows[0] });
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

  const { rows } = await query(
    `SELECT filename FROM photos WHERE id = $1 AND user_id = $2`,
    [id, session.user.id]
  );
  const foto = rows[0];
  if (!foto) {
    return NextResponse.json({ error: "Foto no encontrada." }, { status: 404 });
  }

  await query(`DELETE FROM photos WHERE id = $1 AND user_id = $2`, [id, session.user.id]);

  const ruta = path.join(directorioSubidasUsuario(session.user.id), foto.filename);
  await fs.unlink(ruta).catch(() => {});

  return NextResponse.json({ ok: true });
}

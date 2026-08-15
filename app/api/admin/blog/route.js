import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import fs from "node:fs/promises";
import path from "node:path";
import formidable from "formidable";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "@/lib/adminAuth";
import { query } from "@/lib/db";
import { directorioSubidasBlog, MIME_A_EXTENSION, MAX_TAMANO_FOTO } from "@/lib/uploads";
import { slugify } from "@/lib/slug";

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

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { rows } = await query(
    `SELECT id, titulo, slug, extracto, contenido, foto, publicado, publicado_at, created_at, updated_at
       FROM blog_posts
      ORDER BY created_at DESC`
  );
  return NextResponse.json({ posts: rows });
}

export async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const uploadDir = directorioSubidasBlog();
  await fs.mkdir(uploadDir, { recursive: true });

  let fields;
  let files;
  try {
    ({ fields, files } = await parseFormulario(req, uploadDir));
  } catch (err) {
    console.error("Error al procesar el artículo:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la imagen. Máximo 5MB, formatos jpg/png/webp." },
      { status: 400 }
    );
  }

  const campo = (nombre) => {
    const v = fields[nombre];
    return Array.isArray(v) ? v[0] : v;
  };
  const archivo = Array.isArray(files.file) ? files.file[0] : files.file;

  const titulo = (campo("titulo") || "").trim().slice(0, 100);
  const slug = slugify(campo("slug") || titulo).slice(0, 100);
  const extracto = campo("extracto") ? campo("extracto").trim().slice(0, 300) : null;
  const contenido = (campo("contenido") || "").trim();
  const publicado = campo("publicado") === "true";

  if (!titulo || !slug || !contenido) {
    if (archivo) await fs.unlink(archivo.filepath).catch(() => {});
    return NextResponse.json({ error: "Título, slug y contenido son obligatorios." }, { status: 400 });
  }

  // Recomprime siempre a WebP (máx. 1600px de ancho), mismo criterio que el
  // resto de subidas de imagen de la app.
  let nombreFoto = null;
  if (archivo) {
    nombreFoto = `${uuidv4()}.webp`;
    const rutaFinal = path.join(uploadDir, nombreFoto);
    try {
      await sharp(archivo.filepath)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(rutaFinal);
    } catch (err) {
      console.error("Error al procesar la foto del artículo:", err);
      return NextResponse.json({ error: "No se pudo procesar la imagen." }, { status: 400 });
    } finally {
      await fs.unlink(archivo.filepath).catch(() => {});
    }
  }

  try {
    const { rows } = await query(
      `INSERT INTO blog_posts (titulo, slug, contenido, extracto, foto, publicado, publicado_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, titulo, slug, extracto, foto, publicado, publicado_at, created_at, updated_at`,
      [titulo, slug, contenido, extracto, nombreFoto, publicado, publicado ? new Date() : null]
    );
    return NextResponse.json({ post: rows[0] });
  } catch (err) {
    if (err.constraint?.includes("slug")) {
      return NextResponse.json({ error: "Ese slug ya está en uso." }, { status: 409 });
    }
    throw err;
  }
}

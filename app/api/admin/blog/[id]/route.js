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

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const uploadDir = directorioSubidasBlog();
  await fs.mkdir(uploadDir, { recursive: true });

  let fields;
  let files;
  try {
    ({ fields, files } = await parseFormulario(req, uploadDir));
  } catch (err) {
    console.error("Error al procesar la edición del artículo:", err);
    return NextResponse.json({ error: "No se pudo procesar la solicitud." }, { status: 400 });
  }

  const campo = (nombre) => {
    const v = fields[nombre];
    return Array.isArray(v) ? v[0] : v;
  };
  const archivo = Array.isArray(files.file) ? files.file[0] : files.file;

  const { rows: existentes } = await query(`SELECT foto FROM blog_posts WHERE id = $1`, [id]);
  const actual = existentes[0];
  if (!actual) {
    if (archivo) await fs.unlink(archivo.filepath).catch(() => {});
    return NextResponse.json({ error: "Artículo no encontrado." }, { status: 404 });
  }

  const columnas = [];
  const valores = [];
  function set(col, val) {
    valores.push(val);
    columnas.push(`${col} = $${valores.length}`);
  }

  if ("titulo" in fields) set("titulo", (campo("titulo") || "").trim().slice(0, 100));
  if ("slug" in fields) set("slug", slugify(campo("slug") || "").slice(0, 100));
  if ("extracto" in fields) set("extracto", campo("extracto") ? campo("extracto").trim().slice(0, 300) : null);
  if ("contenido" in fields) set("contenido", (campo("contenido") || "").trim());

  // "publicado" es una acción explícita (botón Publicar/Despublicar):
  // publicar fija publicado_at a ahora (spec: PUBLICAR → publicado=true,
  // publicado_at=now()); despublicar solo cambia el flag, sin borrar la
  // fecha de la última publicación.
  if ("publicado" in fields) {
    const publicado = campo("publicado") === "true";
    set("publicado", publicado);
    if (publicado) set("publicado_at", new Date());
  }

  let nombreFotoAnterior = null;
  if (archivo) {
    const nombreFoto = `${uuidv4()}.webp`;
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
    set("foto", nombreFoto);
    nombreFotoAnterior = actual.foto;
  }

  if (columnas.length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  valores.push(id);

  try {
    const { rows } = await query(
      `UPDATE blog_posts SET ${columnas.join(", ")}, updated_at = now()
        WHERE id = $${valores.length}
      RETURNING id, titulo, slug, extracto, foto, contenido, publicado, publicado_at, created_at, updated_at`,
      valores
    );
    if (nombreFotoAnterior) {
      await fs.unlink(path.join(uploadDir, nombreFotoAnterior)).catch(() => {});
    }
    return NextResponse.json({ post: rows[0] });
  } catch (err) {
    if (err.constraint?.includes("slug")) {
      return NextResponse.json({ error: "Ese slug ya está en uso." }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows } = await query(`SELECT foto FROM blog_posts WHERE id = $1`, [id]);
  const post = rows[0];
  if (!post) {
    return NextResponse.json({ error: "Artículo no encontrado." }, { status: 404 });
  }

  await query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
  if (post.foto) {
    await fs.unlink(path.join(directorioSubidasBlog(), post.foto)).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

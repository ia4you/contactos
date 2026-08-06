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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const { rows } = await query(
    `SELECT h.id, h.user_id, h.tipo, h.contenido, h.created_at,
            ph.filename AS photo_filename,
            u.nick, u.profile_type,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename,
            EXISTS (SELECT 1 FROM historia_vistas hv WHERE hv.historia_id = h.id AND hv.user_id = $1) AS vista,
            (SELECT count(*)::int FROM historia_vistas hv2 WHERE hv2.historia_id = h.id) AS vistas_count
       FROM historias h
       JOIN users u ON u.id = h.user_id
       LEFT JOIN photos ph ON ph.id = h.photo_id
      WHERE h.expires_at > now()
        AND u.deleted_at IS NULL
        AND (h.user_id = $1 OR NOT EXISTS (
          SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1)
        ))
      ORDER BY h.user_id = $1 DESC, h.user_id, h.created_at ASC`,
    [meId]
  );

  return NextResponse.json({ historias: rows });
}

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

  let fields;
  let files;
  try {
    ({ fields, files } = await parseFormulario(req, uploadDir));
  } catch (err) {
    console.error("Error al procesar la historia:", err);
    return NextResponse.json({ error: "No se pudo procesar la historia." }, { status: 400 });
  }

  const campo = (nombre) => {
    const v = fields[nombre];
    return Array.isArray(v) ? v[0] : v;
  };

  const tipo = campo("tipo") === "foto" ? "foto" : "texto";
  const contenido = typeof campo("contenido") === "string" ? campo("contenido").trim() : "";
  const archivo = Array.isArray(files.file) ? files.file[0] : files.file;

  if (tipo === "texto") {
    if (archivo) await fs.unlink(archivo.filepath).catch(() => {});
    if (!contenido || contenido.length > 200) {
      return NextResponse.json({ error: "El texto debe tener entre 1 y 200 caracteres." }, { status: 400 });
    }
    const { rows } = await query(
      `INSERT INTO historias (user_id, tipo, contenido) VALUES ($1, 'texto', $2)
       RETURNING id, tipo, contenido, created_at`,
      [userId, contenido]
    );
    return NextResponse.json({ historia: rows[0] });
  }

  if (!archivo) {
    return NextResponse.json({ error: "Formato no admitido. Solo jpg, png o webp, hasta 5MB." }, { status: 400 });
  }
  if (campo("certifico") !== "true") {
    await fs.unlink(archivo.filepath).catch(() => {});
    return NextResponse.json(
      { error: "Debes certificar que todas las personas de la foto son mayores de edad y han consentido." },
      { status: 400 }
    );
  }
  if (contenido.length > 200) {
    await fs.unlink(archivo.filepath).catch(() => {});
    return NextResponse.json({ error: "El texto no puede superar los 200 caracteres." }, { status: 400 });
  }

  const extension = MIME_A_EXTENSION[archivo.mimetype];
  const nombreFinal = `${uuidv4()}.${extension}`;
  const rutaFinal = path.join(uploadDir, nombreFinal);
  await fs.rename(archivo.filepath, rutaFinal);

  const { rows: fotoRows } = await query(
    `INSERT INTO photos (user_id, filename, status, is_private, is_avatar) VALUES ($1, $2, 'approved', false, false)
     RETURNING id, filename`,
    [userId, nombreFinal]
  );
  const foto = fotoRows[0];

  const { rows } = await query(
    `INSERT INTO historias (user_id, tipo, contenido, photo_id) VALUES ($1, 'foto', $2, $3)
     RETURNING id, tipo, contenido, created_at`,
    [userId, contenido || null, foto.id]
  );

  return NextResponse.json({ historia: { ...rows[0], photo_filename: foto.filename } });
}

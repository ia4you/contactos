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

const LIMITE = 20;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const tab = params.get("tab") === "siguiendo" ? "siguiendo" : "parati";
  const offset = Math.max(0, Number(params.get("offset")) || 0);

  const condiciones = [
    "p.deleted_at IS NULL",
    "u.deleted_at IS NULL",
    "NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))",
  ];

  if (tab === "siguiendo") {
    condiciones.push(
      "EXISTS (SELECT 1 FROM likes l1 WHERE l1.from_id = $1 AND l1.to_id = u.id)",
      "EXISTS (SELECT 1 FROM likes l2 WHERE l2.from_id = u.id AND l2.to_id = $1)"
    );
  }

  const sql = `
    SELECT
      p.id, p.tipo, p.contenido, p.created_at,
      u.id AS user_id, u.nick, u.profile_type, u.island,
      (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename,
      ph.filename AS photo_filename,
      (SELECT count(*)::int FROM publicacion_likes pl WHERE pl.publicacion_id = p.id) AS likes_count,
      (SELECT count(*)::int FROM comentarios c WHERE c.publicacion_id = p.id AND c.deleted_at IS NULL) AS comentarios_count,
      EXISTS (SELECT 1 FROM publicacion_likes pl2 WHERE pl2.publicacion_id = p.id AND pl2.user_id = $1) AS me_gusta
    FROM publicaciones p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN photos ph ON ph.id = p.photo_id
    WHERE ${condiciones.join(" AND ")}
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await query(sql, [session.user.id, LIMITE + 1, offset]);
  const hasMore = rows.length > LIMITE;
  const publicaciones = rows.slice(0, LIMITE).map((p) => ({ ...p, esAnuncio: false }));

  if (tab !== "parati" || publicaciones.length === 0) {
    return NextResponse.json({ publicaciones, hasMore });
  }

  // Intercalado de anuncios (Sprint 3, tarea 3d): 1 anuncio relevante cada 5
  // publicaciones normales, solo en la pestaña "Para ti". "Relevante" =
  // misma isla que el usuario o busco compatible con lo que busca el
  // usuario. Se excluyen los propios anuncios y usuarios bloqueados, igual
  // que en el resto del sitio.
  const { rows: viewerRows } = await query(
    `SELECT island, looking_for FROM users WHERE id = $1`,
    [session.user.id]
  );
  const viewer = viewerRows[0];

  const { rows: anuncios } = await query(
    `SELECT a.id, a.titulo, a.descripcion, a.busco, a.island,
            u.id AS user_id, u.nick, u.profile_type,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM anuncios a
       JOIN users u ON u.id = a.user_id
      WHERE a.deleted_at IS NULL
        AND a.expires_at > now()
        AND u.deleted_at IS NULL
        AND a.user_id != $1
        AND (a.island = $2 OR a.busco && $3::text[])
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY a.created_at DESC
      LIMIT 40`,
    [session.user.id, viewer.island, viewer.looking_for]
  );

  if (anuncios.length === 0) {
    return NextResponse.json({ publicaciones, hasMore });
  }

  const bloqueBase = Math.floor(offset / LIMITE) * 4;
  const conAnuncios = [];
  publicaciones.forEach((pub, i) => {
    conAnuncios.push(pub);
    if ((i + 1) % 5 === 0) {
      const slot = bloqueBase + Math.floor(i / 5);
      const anuncio = anuncios[slot % anuncios.length];
      conAnuncios.push({ ...anuncio, esAnuncio: true });
    }
  });

  return NextResponse.json({ publicaciones: conAnuncios, hasMore });
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
    console.error("Error al procesar la publicación:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la publicación. Máximo 5MB, formatos jpg/png/webp." },
      { status: 400 }
    );
  }

  const campo = (nombre) => {
    const v = fields[nombre];
    return Array.isArray(v) ? v[0] : v;
  };

  const tipo = campo("tipo") === "foto" ? "foto" : "texto";
  const contenidoBruto = typeof campo("contenido") === "string" ? campo("contenido").trim() : "";
  const archivo = Array.isArray(files.file) ? files.file[0] : files.file;

  if (tipo === "texto") {
    if (archivo) await fs.unlink(archivo.filepath).catch(() => {});
    if (!contenidoBruto || contenidoBruto.length > 500) {
      return NextResponse.json(
        { error: "El texto debe tener entre 1 y 500 caracteres." },
        { status: 400 }
      );
    }

    const { rows } = await query(
      `INSERT INTO publicaciones (user_id, tipo, contenido) VALUES ($1, 'texto', $2)
       RETURNING id, tipo, contenido, created_at`,
      [userId, contenidoBruto]
    );
    return NextResponse.json({ publicacion: rows[0] });
  }

  // tipo === "foto"
  if (!archivo) {
    return NextResponse.json(
      { error: "Formato no admitido. Solo jpg, png o webp, hasta 5MB." },
      { status: 400 }
    );
  }

  // La certificación de mayoría de edad y consentimiento es obligatoria y se
  // valida en el servidor, igual que en la subida de fotos de /mi-perfil.
  if (campo("certifico") !== "true") {
    await fs.unlink(archivo.filepath).catch(() => {});
    return NextResponse.json(
      { error: "Debes certificar que todas las personas de la foto son mayores de edad y han consentido." },
      { status: 400 }
    );
  }

  if (contenidoBruto.length > 500) {
    await fs.unlink(archivo.filepath).catch(() => {});
    return NextResponse.json({ error: "El pie de foto no puede superar los 500 caracteres." }, { status: 400 });
  }

  const extension = MIME_A_EXTENSION[archivo.mimetype];
  const nombreFinal = `${uuidv4()}.${extension}`;
  const rutaFinal = path.join(uploadDir, nombreFinal);
  await fs.rename(archivo.filepath, rutaFinal);

  // Sin moderación previa, igual que en /mi-perfil: la certificación
  // traslada la responsabilidad legal a quien sube la foto. La foto queda
  // también disponible en "Mis fotos" porque es la misma tabla `photos`.
  const { rows: fotoRows } = await query(
    `INSERT INTO photos (user_id, filename, caption, status, is_private, is_avatar)
     VALUES ($1, $2, $3, 'approved', false, false)
     RETURNING id, filename`,
    [userId, nombreFinal, contenidoBruto || null]
  );
  const foto = fotoRows[0];

  const { rows } = await query(
    `INSERT INTO publicaciones (user_id, tipo, contenido, photo_id) VALUES ($1, 'foto', $2, $3)
     RETURNING id, tipo, contenido, created_at`,
    [userId, contenidoBruto || null, foto.id]
  );

  return NextResponse.json({ publicacion: { ...rows[0], photo_filename: foto.filename } });
}

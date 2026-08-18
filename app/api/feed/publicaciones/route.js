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
import { contieneVulgaridad } from "@/lib/filtroVulgar";
import { moderarConGroqEnSegundoPlano } from "@/lib/moderacionIA";

export const runtime = "nodejs";

const LIMITE = 20;
const MENSAJE_TONO = "Este contenido no encaja con el tono de nuestra comunidad. ¿Puedes reformularlo?";

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
      u.id AS user_id, u.nick, u.profile_type, u.island, u.last_active, u.show_last_seen,
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
  const publicaciones = rows.slice(0, LIMITE).map((p) => ({ ...p, esAnuncio: false, esEvento: false }));

  // Los anuncios y eventos activos se mezclan por created_at solo en la
  // primera página: como se traen completos (sin paginar por su cuenta),
  // repetirlos en cada "ver más" los duplicaría en el feed.
  if (tab !== "parati" || offset > 0) {
    return NextResponse.json({ publicaciones, hasMore });
  }

  const { rows: viewerRows } = await query(`SELECT island FROM users WHERE id = $1`, [session.user.id]);
  const viewer = viewerRows[0];

  // Todos los anuncios y eventos activos (sin límite artificial de "1 cada
  // 5" ni exclusión de los propios — el usuario puede eliminar los suyos
  // directamente desde la tarjeta intercalada). Se ordenan priorizando la
  // isla del usuario, pero sin excluir el resto de islas.
  const { rows: anuncios } = await query(
    `SELECT a.id, a.titulo, a.descripcion, a.busco, a.island, a.created_at,
            u.id AS user_id, u.nick, u.profile_type,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM anuncios a
       JOIN users u ON u.id = a.user_id
      WHERE a.deleted_at IS NULL
        AND a.expires_at > now()
        AND u.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY (a.island = $2) DESC, a.created_at DESC
      LIMIT 200`,
    [session.user.id, viewer.island]
  );

  const { rows: eventos } = await query(
    `SELECT e.id, e.titulo, e.isla, e.lugar, e.fecha_evento, e.foto, e.tipo, e.created_at,
            u.id AS user_id, u.nick AS organizador_nick
       FROM eventos e
       JOIN users u ON u.id = e.user_id
      WHERE e.deleted_at IS NULL
        AND e.fecha_evento > now()
        AND u.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY (e.isla = $2) DESC, e.created_at DESC
      LIMIT 200`,
    [session.user.id, viewer.island]
  );

  // Eventos de clubs (Sprint Clubs): mismo criterio que anuncios/eventos —
  // activos, priorizando la isla del usuario, sin límite artificial. Sin
  // check de bloqueos (no hay user_id involucrado, es contenido de negocio,
  // no generado por usuarios) así que solo hace falta $1 para la isla.
  const { rows: clubEventos } = await query(
    `SELECT ce.id, ce.titulo, ce.fecha_evento, ce.precio, ce.foto, ce.created_at,
            c.id AS club_id, c.nombre AS club_nombre, c.slug AS club_slug, c.isla
       FROM club_eventos ce
       JOIN clubs c ON c.id = ce.club_id
      WHERE ce.fecha_evento > now() AND c.activo = true
      ORDER BY (c.isla = $1) DESC, ce.created_at DESC
      LIMIT 200`,
    [viewer.island]
  );

  // Artículos del blog: se inyectan igual que anuncios/eventos, pero sin
  // fecha de caducidad natural — para no acabar arrastrando el archivo
  // entero en cada carga del feed, solo se consideran los 20 más recientes.
  const { rows: blogPosts } = await query(
    `SELECT id, titulo, slug, extracto, foto, publicado_at AS created_at
       FROM blog_posts
      WHERE publicado = true
      ORDER BY publicado_at DESC
      LIMIT 20`
  );

  if (anuncios.length === 0 && eventos.length === 0 && clubEventos.length === 0 && blogPosts.length === 0) {
    return NextResponse.json({ publicaciones, hasMore });
  }

  const conPromos = [
    ...publicaciones,
    ...anuncios.map((a) => ({ ...a, esAnuncio: true, esEvento: false, esClubEvento: false, esBlogPost: false })),
    ...eventos.map((e) => ({ ...e, esEvento: true, esAnuncio: false, esClubEvento: false, esBlogPost: false })),
    ...clubEventos.map((ce) => ({ ...ce, esClubEvento: true, esEvento: false, esAnuncio: false, esBlogPost: false })),
    ...blogPosts.map((b) => ({ ...b, esBlogPost: true, esClubEvento: false, esEvento: false, esAnuncio: false })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return NextResponse.json({ publicaciones: conPromos, hasMore });
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
    if (contieneVulgaridad(contenidoBruto)) {
      return NextResponse.json({ error: MENSAJE_TONO }, { status: 400 });
    }

    const { rows } = await query(
      `INSERT INTO publicaciones (user_id, tipo, contenido) VALUES ($1, 'texto', $2)
       RETURNING id, tipo, contenido, created_at`,
      [userId, contenidoBruto]
    );
    const publicacion = rows[0];

    // Fire-and-forget: la publicación ya quedó guardada; si Groq la marca
    // como no aceptable, se oculta después vía revision_pendiente.
    moderarConGroqEnSegundoPlano({
      texto: contenidoBruto,
      tabla: "publicaciones",
      id: publicacion.id,
      endpoint: "/api/feed/publicaciones:texto",
      userId,
    }).catch((err) => console.error("Error en moderarConGroqEnSegundoPlano:", err));

    return NextResponse.json({ publicacion });
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

  if (contieneVulgaridad(contenidoBruto)) {
    await fs.unlink(archivo.filepath).catch(() => {});
    return NextResponse.json({ error: MENSAJE_TONO }, { status: 400 });
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
  const publicacion = rows[0];

  if (contenidoBruto) {
    // Fire-and-forget: solo tiene sentido moderar si hay pie de foto.
    moderarConGroqEnSegundoPlano({
      texto: contenidoBruto,
      tabla: "publicaciones",
      id: publicacion.id,
      endpoint: "/api/feed/publicaciones:foto",
      userId,
    }).catch((err) => console.error("Error en moderarConGroqEnSegundoPlano:", err));
  }

  return NextResponse.json({ publicacion: { ...publicacion, photo_filename: foto.filename } });
}

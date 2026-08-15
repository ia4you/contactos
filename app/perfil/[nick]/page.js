import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { AVATAR_PLACEHOLDER, avatarSrc as resolverAvatarSrc, PUBLICACIONES_PERFIL_LIMITE } from "@/lib/constants";
import { crearNotificacion } from "@/lib/notificaciones";
import { PerfilCabecera } from "./PerfilCabecera";
import { DemoBanner } from "./DemoBanner";
import { FotosGridPublico } from "./FotosGridPublico";
import { PorQueConectais } from "./PorQueConectais";
import { PublicacionesPerfil } from "./PublicacionesPerfil";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default async function PerfilPublico({ params }) {
  const session = await getServerSession(authOptions);

  const { rows: userRows } = await query(
    `SELECT id, nick, profile_type, island, bio, her_bio, his_bio, genero, orientacion, rol, verified, created_at,
            last_active, show_last_seen, is_demo, badge_especial
       FROM users WHERE lower(nick) = lower($1) AND deleted_at IS NULL`,
    [params.nick]
  );
  const usuario = userRows[0];
  if (!usuario) notFound();

  const esPropio = session?.user?.id === String(usuario.id);

  if (session && !esPropio) {
    const { rows: bloqueoRows } = await query(
      `SELECT 1 FROM blocks
        WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
      [session.user.id, usuario.id]
    );
    if (bloqueoRows[0]) {
      return (
        <main style={{ display: "flex", minHeight: "60vh", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
            Este perfil no está disponible.
          </p>
        </main>
      );
    }
  }

  // Estado de interacción inicial (like/match/amistad), solo si hay sesión y
  // no es el propio perfil — se pasa como valor inicial al componente
  // cliente, que luego gestiona sus propias actualizaciones optimistas.
  let estadoInicial = { meGusta: false, match: false, amistad: null };
  if (session && !esPropio) {
    const meId = Number(session.user.id);
    const { rows: likeRows } = await query(
      `SELECT 1 FROM likes WHERE from_id = $1 AND to_id = $2`,
      [meId, usuario.id]
    );
    const user1 = Math.min(meId, usuario.id);
    const user2 = Math.max(meId, usuario.id);
    const { rows: matchRows } = await query(
      `SELECT 1 FROM matches WHERE user1_id = $1 AND user2_id = $2`,
      [user1, user2]
    );
    const { rows: amistadRows } = await query(
      `SELECT from_id, status FROM amistades
        WHERE (from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1)`,
      [meId, usuario.id]
    );
    const amistadRow = amistadRows[0];
    let amistad = null;
    if (amistadRow?.status === "accepted") amistad = "amigos";
    else if (amistadRow?.status === "pending") amistad = amistadRow.from_id === meId ? "enviada" : "recibida";

    estadoInicial = { meGusta: Boolean(likeRows[0]), match: Boolean(matchRows[0]), amistad };

    // Registrar visita (upsert) + notificación, máximo una cada 24h por
    // visitante para no saturar al dueño del perfil.
    await query(
      `INSERT INTO visits (visitor_id, visited_id, visited_at) VALUES ($1, $2, now())
       ON CONFLICT (visitor_id, visited_id) DO UPDATE SET visited_at = now()`,
      [meId, usuario.id]
    );
    const { rows: notifRecientes } = await query(
      `SELECT 1 FROM notificaciones
        WHERE user_id = $1 AND from_user_id = $2 AND tipo = 'visita' AND created_at > now() - interval '24 hours'`,
      [usuario.id, meId]
    );
    if (!notifRecientes[0]) {
      await crearNotificacion(usuario.id, "visita", meId);
    }
  }

  // Compatibilidad de gustos (Sprint 5): % = gustos en común / total de
  // gustos del VISITANTE (no del dueño del perfil), redondeado. Si el
  // visitante no tiene gustos guardados, no se muestra nada.
  let compatibilidad = null;
  if (session && !esPropio) {
    const meId = Number(session.user.id);
    const { rows: totalRows } = await query(
      `SELECT count(*)::int AS total FROM user_fetiches WHERE user_id = $1`,
      [meId]
    );
    if (totalRows[0].total > 0) {
      const { rows: comunRows } = await query(
        `SELECT count(*)::int AS comun
           FROM user_fetiches uf1
           JOIN user_fetiches uf2 ON uf1.fetiche_id = uf2.fetiche_id
          WHERE uf1.user_id = $1 AND uf2.user_id = $2`,
        [meId, usuario.id]
      );
      compatibilidad = {
        pct: Math.round((comunRows[0].comun / totalRows[0].total) * 100),
      };
    }
  }

  const { rows: fotosRows } = await query(
    `SELECT p.id, p.filename,
            (SELECT count(*)::int FROM foto_likes fl WHERE fl.photo_id = p.id) AS likes_count,
            ${session ? "EXISTS (SELECT 1 FROM foto_likes fl2 WHERE fl2.photo_id = p.id AND fl2.user_id = $2)" : "false"} AS me_gusta
       FROM photos p
      WHERE p.user_id = $1 AND p.status = 'approved' AND p.is_private = false
      ORDER BY p.created_at DESC`,
    session ? [usuario.id, session.user.id] : [usuario.id]
  );
  const fotos = fotosRows.map((f) => ({ id: f.id, filename: f.filename, likesCount: f.likes_count, meGusta: f.me_gusta }));

  const { rows: gustosRows } = await query(
    `SELECT f.nombre, f.categoria FROM user_fetiches uf
       JOIN fetiches f ON f.id = uf.fetiche_id
      WHERE uf.user_id = $1
      ORDER BY f.categoria, f.id`,
    [usuario.id]
  );
  const gustosPorCategoria = {};
  for (const g of gustosRows) {
    if (!gustosPorCategoria[g.categoria]) gustosPorCategoria[g.categoria] = [];
    gustosPorCategoria[g.categoria].push(g.nombre);
  }

  const { rows: publicacionesRows } = await query(
    `SELECT p.id, p.tipo, p.contenido, p.created_at, ph.filename AS photo_filename
       FROM publicaciones p
       LEFT JOIN photos ph ON ph.id = p.photo_id
      WHERE p.user_id = $1 AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $2`,
    [usuario.id, PUBLICACIONES_PERFIL_LIMITE + 1]
  );
  const hasMorePublicacionesInicial = publicacionesRows.length > PUBLICACIONES_PERFIL_LIMITE;
  const publicacionesIniciales = publicacionesRows.slice(0, PUBLICACIONES_PERFIL_LIMITE);

  const avatarFoto = fotos[0];
  const avatarSrc = resolverAvatarSrc(usuario.id, avatarFoto?.filename, usuario.profile_type);

  const fecha = new Date(usuario.created_at);
  const miembroDesde = `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;

  return (
    <main>
      <PerfilCabecera
        usuario={usuario}
        avatarSrc={avatarSrc}
        miembroDesde={miembroDesde}
        esPropio={esPropio}
        estadoInicial={estadoInicial}
        compatibilidad={compatibilidad}
      />

      {usuario.is_demo && <DemoBanner />}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {fotos.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", textAlign: "center" }}>
            <div style={{ position: "relative", width: 220, height: 220, opacity: 0.6 }}>
              <Image src={AVATAR_PLACEHOLDER[usuario.profile_type]} alt="" fill unoptimized={false} style={{ objectFit: "contain" }} />
            </div>
            <p style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
              Este perfil aún no tiene fotos públicas.
            </p>
          </div>
        ) : (
          <FotosGridPublico usuarioId={usuario.id} fotos={fotos} esPropio={esPropio} />
        )}

        {gustosRows.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
              Sus gustos
            </h2>
            {Object.entries(gustosPorCategoria).map(([categoria, nombres]) => (
              <div key={categoria} style={{ marginTop: 24 }}>
                <p className="kicker" style={{ letterSpacing: 3 }}>
                  {categoria}
                </p>
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {nombres.map((nombre) => (
                    <span key={nombre} className="fetiche-chip active" style={{ cursor: "default" }}>
                      {nombre}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!esPropio && <PorQueConectais nick={usuario.nick} />}

        {publicacionesIniciales.length > 0 && (
          <PublicacionesPerfil
            nick={usuario.nick}
            usuario={usuario}
            avatarFilename={avatarFoto?.filename}
            publicacionesIniciales={publicacionesIniciales}
            hasMoreInicial={hasMorePublicacionesInicial}
          />
        )}
      </div>
    </main>
  );
}

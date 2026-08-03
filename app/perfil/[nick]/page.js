import Image from "next/image";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { query } from "@/lib/db";
import { ISLANDS, PROFILE_TYPES, AVATAR_PLACEHOLDER } from "@/lib/constants";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default async function PerfilPublico({ params }) {
  const { rows: userRows } = await query(
    `SELECT id, nick, profile_type, island, bio, genero, orientacion, rol, verified, created_at
       FROM users WHERE lower(nick) = lower($1) AND deleted_at IS NULL`,
    [params.nick]
  );
  const usuario = userRows[0];
  if (!usuario) notFound();

  const { rows: fotos } = await query(
    `SELECT id, filename FROM photos
      WHERE user_id = $1 AND status = 'approved' AND is_private = false
      ORDER BY created_at DESC`,
    [usuario.id]
  );

  const { rows: gustos } = await query(
    `SELECT f.nombre FROM user_fetiches uf
       JOIN fetiches f ON f.id = uf.fetiche_id
      WHERE uf.user_id = $1
      ORDER BY f.categoria, f.id`,
    [usuario.id]
  );

  const avatarFoto = fotos[0];
  const avatarSrc = avatarFoto
    ? `/uploads/${usuario.id}/${avatarFoto.filename}`
    : AVATAR_PLACEHOLDER[usuario.profile_type];

  const fecha = new Date(usuario.created_at);
  const miembroDesde = `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;

  return (
    <main>
      {/* Cabecera */}
      <div
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid rgba(201,161,90,0.18)",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 28,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div
              style={{
                position: "relative",
                width: 100,
                height: 100,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--gold)",
                flexShrink: 0,
              }}
            >
              <Image src={avatarSrc} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
            </div>

            <div style={{ maxWidth: 480 }}>
              <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
                {usuario.nick}
              </h1>

              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span className="badge-gold">{ISLAND_LABEL[usuario.island]}</span>
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-body)",
                    background: "var(--surface)",
                    border: "1px solid var(--border-gold)",
                    color: "var(--text)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    padding: "4px 10px",
                  }}
                >
                  {PROFILE_TYPE_LABEL[usuario.profile_type]}
                </span>
                {usuario.verified && (
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-body)",
                      background: "var(--gold)",
                      color: "var(--bg)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      padding: "4px 10px",
                    }}
                  >
                    Verificado
                  </span>
                )}
              </div>

              <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
                Miembro desde {miembroDesde}
              </p>

              {usuario.bio && (
                <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
                  {usuario.bio}
                </p>
              )}

              <GrupoChips titulo="Género" valores={usuario.genero} />
              <GrupoChips titulo="Orientación" valores={usuario.orientacion} />
              <GrupoChips titulo="Rol" valores={usuario.rol} />
            </div>
          </div>

          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              alignSelf: "flex-start",
              border: "1px solid var(--gold)",
              color: "var(--gold)",
              background: "transparent",
              padding: "11px 22px",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 2,
              cursor: "pointer",
            }}
          >
            <Heart size={15} />
            Dar like
          </button>
        </div>
      </div>

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
          <div className="fotos-grid-2a">
            {fotos.map((foto) => (
              <div
                key={foto.id}
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  border: "1px solid rgba(201,161,90,0.2)",
                }}
              >
                <Image
                  src={`/uploads/${usuario.id}/${foto.filename}`}
                  alt=""
                  fill
                  unoptimized={false}
                  className="foto-discreta"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}

        {gustos.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <p className="kicker" style={{ letterSpacing: 3 }}>
              Sus gustos
            </p>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {gustos.map((g) => (
                <span key={g.nombre} className="fetiche-chip active" style={{ cursor: "default" }}>
                  {g.nombre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function GrupoChips({ titulo, valores }) {
  if (!valores || valores.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "var(--text-muted)",
          marginRight: 8,
        }}
      >
        {titulo}:
      </span>
      <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
        {valores.map((v) => (
          <span key={v} className="badge-gold">
            {v}
          </span>
        ))}
      </span>
    </div>
  );
}

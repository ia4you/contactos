import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Heart } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { ISLANDS, PROFILE_TYPES, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { ReportButton } from "../../components/ReportButton";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default async function PerfilPublico({ params }) {
  const session = await getServerSession(authOptions);

  const { rows: userRows } = await query(
    `SELECT id, nick, profile_type, island, bio, genero, orientacion, rol, verified, created_at
       FROM users WHERE lower(nick) = lower($1) AND deleted_at IS NULL`,
    [params.nick]
  );
  const usuario = userRows[0];
  if (!usuario) notFound();

  const esPropio = session?.user?.id === String(usuario.id);

  const { rows: fotos } = await query(
    `SELECT id, filename FROM photos
      WHERE user_id = $1 AND status = 'approved' AND is_private = false
      ORDER BY created_at DESC`,
    [usuario.id]
  );

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

          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignSelf: "flex-start" }}>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
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

            {!esPropio && (
              <ReportButton
                reportedUserId={usuario.id}
                label="Denunciar perfil"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  border: "1px solid rgba(154,58,58,0.5)",
                  color: "#e07a7a",
                  background: "transparent",
                  padding: "11px 22px",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  cursor: "pointer",
                }}
              />
            )}
          </div>
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
                className="group"
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
                {!esPropio && (
                  <div
                    className="fotos-grid__overlay"
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      padding: 8,
                      pointerEvents: "none",
                    }}
                  >
                    <ReportButton
                      reportedUserId={usuario.id}
                      label="Denunciar"
                      className="foto-overlay-btn"
                      style={{
                        pointerEvents: "auto",
                        width: "auto",
                        borderColor: "rgba(154,58,58,0.5)",
                        color: "#e07a7a",
                        background: "rgba(14,10,11,0.75)",
                        padding: "6px 12px",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
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

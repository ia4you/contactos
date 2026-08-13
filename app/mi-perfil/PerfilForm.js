"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ISLANDS, PROFILE_TYPES, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { TabDatos } from "./TabDatos";
import { TabFotos } from "./TabFotos";
import { TabGustos } from "./TabGustos";
import { BarraCompletitud } from "./BarraCompletitud";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function PerfilForm({ usuario, fotosIniciales, fetichesCountInicial }) {
  const searchParams = useSearchParams();
  // Deep link desde una notificación de like a una foto
  // ("/mi-perfil?tab=fotos#foto-123"): abre directamente el tab de fotos.
  const [seccion, setSeccion] = useState(() => (searchParams.get("tab") === "fotos" ? "fotos" : "datos"));
  const [fotos, setFotos] = useState(fotosIniciales);
  const [fetichesCount, setFetichesCount] = useState(fetichesCountInicial);
  const [bioExpandida, setBioExpandida] = useState(false);

  const avatarFoto = fotos.find((f) => f.is_avatar && f.status === "approved");
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
                <p
                  style={{
                    marginTop: 10,
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    ...(bioExpandida
                      ? {}
                      : {
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }),
                  }}
                >
                  {usuario.bio}{" "}
                  {!bioExpandida && (
                    <button
                      type="button"
                      onClick={() => setBioExpandida(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--gold)",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        padding: 0,
                      }}
                    >
                      ver más
                    </button>
                  )}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ textAlign: "center" }}>
              <p className="heading" style={{ fontSize: 32, color: "var(--gold)" }}>
                {fotos.length}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
                Fotos
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p className="heading" style={{ fontSize: 32, color: "var(--gold)" }}>
                {fetichesCount}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
                Gustos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <BarraCompletitud usuario={usuario} fotos={fotos} gustosCount={fetichesCount} />
      </div>

      {/* Tabs horizontales */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <nav className="tab-nav">
          <button
            type="button"
            onClick={() => setSeccion("datos")}
            className={`tab-nav-item ${seccion === "datos" ? "active" : ""}`}
          >
            Mis datos
          </button>
          <button
            type="button"
            onClick={() => setSeccion("fotos")}
            className={`tab-nav-item ${seccion === "fotos" ? "active" : ""}`}
          >
            Mis fotos
          </button>
          <button
            type="button"
            onClick={() => setSeccion("gustos")}
            className={`tab-nav-item ${seccion === "gustos" ? "active" : ""}`}
          >
            Mis gustos
          </button>
          <Link href="/mi-perfil/eliminar" className="tab-nav-item" style={{ color: "#9a3a3a" }}>
            Eliminar cuenta
          </Link>
        </nav>

        <div style={{ padding: "40px 0" }}>
          {seccion === "datos" && <TabDatos usuario={usuario} />}
          {seccion === "fotos" && <TabFotos usuarioId={usuario.id} fotos={fotos} setFotos={setFotos} />}
          {seccion === "gustos" && <TabGustos setFetichesCount={setFetichesCount} />}
        </div>
      </div>
    </main>
  );
}

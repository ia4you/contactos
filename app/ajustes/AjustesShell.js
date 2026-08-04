"use client";

import { useState } from "react";
import Image from "next/image";
import { ISLANDS, PROFILE_TYPES, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { TabPerfil } from "./TabPerfil";
import { TabCuenta } from "./TabCuenta";
import { TabPrivacidad } from "./TabPrivacidad";
import { TabNotificaciones } from "./TabNotificaciones";
import { TabBloqueados } from "./TabBloqueados";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const TABS = [
  { id: "perfil", label: "Perfil" },
  { id: "cuenta", label: "Cuenta" },
  { id: "privacidad", label: "Privacidad" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "bloqueados", label: "Bloqueados" },
];

export function AjustesShell({ usuario, avatarFilename }) {
  const [seccion, setSeccion] = useState("perfil");

  const avatarSrc = avatarFilename
    ? `/uploads/${usuario.id}/${avatarFilename}`
    : AVATAR_PLACEHOLDER[usuario.profile_type];

  const fecha = new Date(usuario.created_at);
  const miembroDesde = `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;

  return (
    <main>
      <div
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid rgba(201,161,90,0.18)",
          padding: "40px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24, flexWrap: "wrap" }}>
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

          <div>
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
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <nav className="tab-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSeccion(t.id)}
              className={`tab-nav-item ${seccion === t.id ? "active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "40px 0" }}>
          {seccion === "perfil" && <TabPerfil usuario={usuario} />}
          {seccion === "cuenta" && <TabCuenta usuario={usuario} />}
          {seccion === "privacidad" && <TabPrivacidad usuario={usuario} />}
          {seccion === "notificaciones" && <TabNotificaciones />}
          {seccion === "bloqueados" && <TabBloqueados />}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ISLANDS, avatarSrc } from "@/lib/constants";
import { PuntoOnline } from "../components/PuntoOnline";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

export function AhoraOnlineCarrusel() {
  const [usuarios, setUsuarios] = useState(null);

  useEffect(() => {
    fetch("/api/usuarios/online")
      .then((r) => r.json())
      .then((d) => setUsuarios(d.usuarios || []))
      .catch(() => setUsuarios([]));
  }, []);

  if (usuarios === null) return null;

  if (usuarios.length === 0) {
    return (
      <p style={{ marginBottom: 24, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
        Sé el primero en conectar hoy:{" "}
        <Link href="/mi-perfil" className="enlace">
          completa tu perfil
        </Link>
      </p>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="punto-pulso" />
        <h3 className="widget-titulo">Ahora online</h3>
      </div>

      <div className="scroll-sin-barra" style={{ marginTop: 14, display: "flex", gap: 16, overflowX: "auto" }}>
        {usuarios.map((u) => {
          const src = avatarSrc(u.id, u.avatar_filename, u.profile_type);
          return (
            <Link
              key={u.id}
              href={`/perfil/${u.nick}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 68, flexShrink: 0, textDecoration: "none" }}
            >
              <div style={{ position: "relative", width: 56, height: 56 }}>
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border-gold)" }}>
                  <Image sizes="56px" src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                </div>
                <PuntoOnline />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {u.nick}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                {ISLAND_LABEL[u.island]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

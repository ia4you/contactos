"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ISLANDS, AVATAR_PLACEHOLDER } from "@/lib/constants";
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

  if (usuarios.length < 10) {
    return (
      <div style={{ marginBottom: 24, background: "#1c1416", border: "1px solid rgba(201,161,90,0.18)", padding: 24, textAlign: "center" }}>
        <h3 className="heading" style={{ fontSize: 20, color: "var(--gold)" }}>
          Sé el primero en conectar hoy
        </h3>
        <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
          Completa tu perfil y aparece aquí cuando otros estén online
        </p>
        <Link href="/mi-perfil" className="btn-outline-gold" style={{ marginTop: 16, display: "inline-block" }}>
          Completar perfil
        </Link>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="punto-pulso" />
        <p className="kicker" style={{ letterSpacing: 3 }}>Ahora online</p>
      </div>

      <div className="scroll-sin-barra" style={{ marginTop: 14, display: "flex", gap: 16, overflowX: "auto" }}>
        {usuarios.map((u) => {
          const src = u.avatar_filename ? `/uploads/${u.id}/${u.avatar_filename}` : AVATAR_PLACEHOLDER[u.profile_type];
          return (
            <Link
              key={u.id}
              href={`/perfil/${u.nick}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 68, flexShrink: 0, textDecoration: "none" }}
            >
              <div style={{ position: "relative", width: 56, height: 56 }}>
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border-gold)" }}>
                  <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
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
              <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-muted)" }}>
                {ISLAND_LABEL[u.island]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

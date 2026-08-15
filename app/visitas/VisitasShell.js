"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ISLANDS, PROFILE_TYPES, avatarSrc } from "@/lib/constants";
import { mostrarPuntoOnline } from "@/lib/online";
import { tiempoRelativo } from "@/lib/tiempo";
import { EmptyState } from "../components/EmptyState";
import { PuntoOnline } from "../components/PuntoOnline";
import { UsuarioBadge } from "../components/UsuarioBadge";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const LIMITE = 30;

export function VisitasShell() {
  const [visitas, setVisitas] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function cargar(offsetActual, append) {
    setCargando(true);
    const res = await fetch(`/api/visitas?offset=${offsetActual}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;

    setVisitas((prev) => (append ? [...(prev || []), ...data.visitas] : data.visitas));
    setHasMore(data.hasMore);
    setOffset(offsetActual + LIMITE);
  }

  useEffect(() => {
    cargar(0, false);
    fetch("/api/visitas", { method: "PATCH" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 0 80px" }}>
      <div style={{ padding: "0 24px" }}>
        <h1 className="heading" style={{ fontSize: 32, color: "var(--text)" }}>
          Quién ha visitado mi perfil
        </h1>
        <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
          Las últimas 500 visitas de los últimos 30 días
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        {visitas === null ? (
          <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 24px" }}>
            Cargando…
          </p>
        ) : visitas.length === 0 ? (
          <div style={{ padding: "0 24px" }}>
            <EmptyState texto="Aún no has recibido visitas" />
          </div>
        ) : (
          <>
            {visitas.map((v) => {
              const src = avatarSrc(v.id, v.avatar_filename, v.profile_type);
              return (
                <Link
                  key={`${v.id}-${v.visited_at}`}
                  href={`/perfil/${v.nick}`}
                  className="visita-fila"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 24px",
                    borderBottom: "1px solid #2a2a2a",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                      <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                    </div>
                    {mostrarPuntoOnline(v) && <PuntoOnline />}
                    <UsuarioBadge badgeEspecial={v.badge_especial} isDemo={v.is_demo} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span className="heading" style={{ fontSize: 15, color: "var(--text)" }}>
                        {v.nick}
                      </span>
                      <span className="badge-gold" style={{ fontSize: 9 }}>{ISLAND_LABEL[v.island]}</span>
                      <span className="badge-gold" style={{ fontSize: 9 }}>{PROFILE_TYPE_LABEL[v.profile_type]}</span>
                    </div>
                  </div>
                  <span style={{ flexShrink: 0, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
                    {tiempoRelativo(v.visited_at)}
                  </span>
                </Link>
              );
            })}

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button type="button" onClick={() => cargar(offset, true)} disabled={cargando} className="btn-outline-gold">
                  {cargando ? "Cargando…" : "Ver más"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

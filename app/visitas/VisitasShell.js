"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ISLANDS, PROFILE_TYPES, avatarSrc } from "@/lib/constants";
import { mostrarPuntoOnline } from "@/lib/online";
import { tiempoRelativo } from "@/lib/tiempo";
import { EmptyState } from "../components/EmptyState";
import { PuntoOnline } from "../components/PuntoOnline";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const LIMITE = 20;

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
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="kicker">Actividad</p>
      <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
        Quién te ha visitado
      </h1>

      <div style={{ marginTop: 32 }}>
        {visitas === null ? (
          <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 0" }}>
            Cargando…
          </p>
        ) : visitas.length === 0 ? (
          <EmptyState texto="Aún no has recibido visitas" />
        ) : (
          <>
            {visitas.map((v) => {
              const src = avatarSrc(v.id, v.avatar_filename, v.profile_type);
              return (
                <div
                  key={`${v.id}-${v.visited_at}`}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(201,161,90,0.12)" }}
                >
                  <Link href={`/perfil/${v.nick}`} style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                      <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                    </div>
                    {mostrarPuntoOnline(v) && <PuntoOnline />}
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Link href={`/perfil/${v.nick}`} className="heading" style={{ fontSize: 15, color: "var(--text)", textDecoration: "none" }}>
                        {v.nick}
                      </Link>
                      <span className="badge-gold" style={{ fontSize: 9 }}>{ISLAND_LABEL[v.island]}</span>
                      <span className="badge-gold" style={{ fontSize: 9 }}>{PROFILE_TYPE_LABEL[v.profile_type]}</span>
                    </div>
                    <p style={{ marginTop: 3, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
                      {tiempoRelativo(v.visited_at)}
                    </p>
                  </div>
                </div>
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

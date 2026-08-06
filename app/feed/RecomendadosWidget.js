"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { ISLANDS, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { mostrarPuntoOnline } from "@/lib/online";
import { PuntoOnline } from "../components/PuntoOnline";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

function estiloScore(score) {
  if (score > 70) return { color: "var(--gold)", icono: true };
  if (score > 40) return { color: "var(--gold-light)", icono: false };
  return { color: "var(--text-muted)", icono: false };
}

function TarjetaSkeleton() {
  return (
    <div style={{ width: 148, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#2a2a2a" }} />
      <div style={{ width: 70, height: 12, background: "#2a2a2a" }} />
      <div style={{ width: 50, height: 10, background: "#2a2a2a" }} />
    </div>
  );
}

function TarjetaRecomendacion({ r }) {
  const src = r.avatar_filename ? `/uploads/${r.user_id}/${r.avatar_filename}` : AVATAR_PLACEHOLDER[r.profile_type];
  const score = estiloScore(r.score ?? 0);

  return (
    <div
      style={{
        width: 148,
        flexShrink: 0,
        background: "#141414",
        border: "1px solid #2a2a2a",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 6,
      }}
    >
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
          <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
        {mostrarPuntoOnline(r) && <PuntoOnline />}
      </div>

      <span className="heading" style={{ fontSize: 15, color: "var(--text)" }}>{r.nick}</span>
      <span className="badge-gold" style={{ fontSize: 9 }}>{ISLAND_LABEL[r.island]}</span>

      {r.score != null && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-body)", fontSize: 11, color: score.color }}>
          {score.icono && <Flame size={11} fill={score.color} />}
          {r.score}% compatible
        </span>
      )}

      {r.razon_corta && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.3 }}>
          {r.razon_corta}
        </p>
      )}

      <Link href={`/perfil/${r.nick}`} className="btn-outline-gold" style={{ marginTop: 4, fontSize: 10, padding: "6px 16px" }}>
        Ver
      </Link>
    </div>
  );
}

export function RecomendadosWidget() {
  const [estado, setEstado] = useState({ cargando: true, recomendaciones: [], sinGustos: false });
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch("/api/recomendaciones")
      .then((r) => r.json())
      .then((d) =>
        setEstado({ cargando: false, recomendaciones: d.recomendaciones || [], sinGustos: Boolean(d.sinGustos) })
      )
      .catch(() => setEstado({ cargando: false, recomendaciones: [], sinGustos: false }));
  }, []);

  function desplazar(direccion) {
    scrollRef.current?.scrollBy({ left: direccion * 320, behavior: "smooth" });
  }

  if (!estado.cargando && !estado.sinGustos && estado.recomendaciones.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <p className="kicker" style={{ letterSpacing: 3 }}>Recomendados para ti</p>
          <p style={{ marginTop: 2, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>
            Seleccionados por IA según tus gustos
          </p>
        </div>
        {!estado.cargando && estado.recomendaciones.length > 0 && (
          <div className="recomendados-flechas" style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={() => desplazar(-1)} aria-label="Anterior" className="icon-btn">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => desplazar(1)} aria-label="Siguiente" className="icon-btn">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {estado.cargando ? (
        <div style={{ marginTop: 14, display: "flex", gap: 12, overflowX: "hidden" }}>
          {[1, 2, 3, 4].map((i) => (
            <TarjetaSkeleton key={i} />
          ))}
        </div>
      ) : estado.sinGustos ? (
        <div style={{ marginTop: 14, background: "#1c1416", border: "1px solid rgba(201,161,90,0.18)", padding: 20, textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
            Añade tus gustos para recibir recomendaciones personalizadas
          </p>
          <Link href="/mi-perfil#gustos" className="btn-outline-gold" style={{ marginTop: 12, display: "inline-block", fontSize: 11 }}>
            Añadir gustos
          </Link>
        </div>
      ) : (
        <div ref={scrollRef} style={{ marginTop: 14, display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          {estado.recomendaciones.map((r) => (
            <TarjetaRecomendacion key={r.user_id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { ISLANDS, avatarSrc } from "@/lib/constants";
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
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--bg-deep)" }} />
      <div style={{ width: 70, height: 12, background: "var(--bg-deep)" }} />
      <div style={{ width: 50, height: 10, background: "var(--bg-deep)" }} />
    </div>
  );
}

function TarjetaRecomendacion({ r }) {
  const src = avatarSrc(r.user_id, r.avatar_filename, r.profile_type);
  const score = estiloScore(r.score ?? 0);

  return (
    <div
      style={{
        width: 148,
        flexShrink: 0,
        padding: "14px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 6,
      }}
    >
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
          <Image sizes="64px" src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
        {mostrarPuntoOnline(r) && <PuntoOnline />}
      </div>

      <span className="heading" style={{ fontSize: 16, color: "var(--text)" }}>{r.nick}</span>
      <span className="badge-gold" style={{ fontSize: 12 }}>{ISLAND_LABEL[r.island]}</span>

      {r.score != null && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-body)", fontSize: 12, color: score.color }}>
          {score.icono && <Flame size={11} fill={score.color} />}
          {r.score}% compatible
        </span>
      )}

      {r.razon_corta && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.3 }}>
          {r.razon_corta}
        </p>
      )}

      <Link href={`/perfil/${r.nick}`} className="enlace-flecha" aria-label={`Ver perfil de ${r.nick}`}>
        Ver
      </Link>
    </div>
  );
}

function FilaRecomendacionCompacta({ r }) {
  const src = avatarSrc(r.user_id, r.avatar_filename, r.profile_type);
  const score = estiloScore(r.score ?? 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--rule)" }}>
      <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
          <Image sizes="40px" src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
        {mostrarPuntoOnline(r) && <PuntoOnline />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="heading" style={{ fontSize: 14, color: "var(--text)", display: "block" }}>{r.nick}</span>
        {r.score != null ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-body)", fontSize: 12, color: score.color }}>
            {score.icono && <Flame size={10} fill={score.color} />}
            {r.score}% compatible
          </span>
        ) : (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{ISLAND_LABEL[r.island]}</span>
        )}
      </div>
      <Link href={`/perfil/${r.nick}`} className="enlace-flecha" style={{ flexShrink: 0 }} aria-label={`Ver perfil de ${r.nick}`}>
        Ver
      </Link>
    </div>
  );
}

export function RecomendadosWidget({ compacto = false }) {
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
          <h3 className="widget-titulo">Recomendados para ti</h3>
          <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
            Seleccionados por IA según tus gustos
          </p>
        </div>
        {!compacto && !estado.cargando && estado.recomendaciones.length > 0 && (
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
        compacto ? (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-deep)" }} />
                <div style={{ flex: 1, height: 12, background: "var(--bg-deep)" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "flex", gap: 12, overflowX: "hidden" }}>
            {[1, 2, 3, 4].map((i) => (
              <TarjetaSkeleton key={i} />
            ))}
          </div>
        )
      ) : estado.sinGustos ? (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
            Añade tus gustos para recibir recomendaciones personalizadas
          </p>
          <Link href="/mi-perfil#gustos" className="enlace-flecha">
            Añadir gustos
          </Link>
        </div>
      ) : compacto ? (
        <div style={{ marginTop: 10 }}>
          {estado.recomendaciones.map((r) => (
            <FilaRecomendacionCompacta key={r.user_id} r={r} />
          ))}
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

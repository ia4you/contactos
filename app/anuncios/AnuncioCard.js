"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ISLANDS, PROFILE_TYPES, LOOKING_FOR_OPTIONS, avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));
const BUSCO_LABEL = Object.fromEntries(LOOKING_FOR_OPTIONS.map((l) => [l.value, l.label]));

export function AnuncioCard({ anuncio, esPropio, onEditar, onEliminar }) {
  const [expandido, setExpandido] = useState(false);
  const src = avatarSrc(anuncio.user_id, anuncio.avatar_filename, anuncio.profile_type);

  const descripcionLarga = anuncio.descripcion.length > 140;

  return (
    <div style={{ background: "#141414", border: "1px solid #2a2a2a", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/perfil/${anuncio.nick}`} className="heading" style={{ fontSize: 15, color: "var(--text)", textDecoration: "none" }}>
              {anuncio.nick}
            </Link>
            <span className="badge-gold" style={{ fontSize: 9, padding: "2px 7px" }}>{ISLAND_LABEL[anuncio.island]}</span>
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>
            {tiempoRelativo(anuncio.created_at)}
          </span>
        </div>
      </div>

      <span className="badge-gold" style={{ marginTop: 12, display: "inline-block" }}>
        {PROFILE_TYPE_LABEL[anuncio.profile_type]}
      </span>

      <h3 className="heading" style={{ marginTop: 10, fontSize: 18, color: "var(--text)" }}>
        {anuncio.titulo}
      </h3>
      <p
        style={{
          marginTop: 6,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--text-secondary)",
          ...(expandido
            ? {}
            : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }),
        }}
      >
        {anuncio.descripcion}
      </p>
      {descripcionLarga && (
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          style={{
            marginTop: 4,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--gold)",
          }}
        >
          {expandido ? "ver menos" : "ver más"}
        </button>
      )}

      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {anuncio.busco.map((b) => (
            <span key={b} className="badge-gold" style={{ fontSize: 9 }}>
              {BUSCO_LABEL[b] ?? b}
            </span>
          ))}
        </div>

        {esPropio ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => onEditar(anuncio)} className="btn-outline-gold" style={{ padding: "8px 16px", fontSize: 11 }}>
              Editar
            </button>
            <button
              type="button"
              onClick={() => onEliminar(anuncio.id)}
              className="btn-outline-gold"
              style={{ padding: "8px 16px", fontSize: 11, borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}
            >
              Eliminar
            </button>
          </div>
        ) : (
          <Link href={`/perfil/${anuncio.nick}`} className="btn-outline-gold" style={{ padding: "8px 16px", fontSize: 11 }}>
            Ver perfil
          </Link>
        )}
      </div>
    </div>
  );
}

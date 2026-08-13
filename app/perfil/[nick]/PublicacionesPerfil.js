"use client";

import { useState } from "react";
import Image from "next/image";
import { ISLANDS, avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { mostrarPuntoOnline } from "@/lib/online";
import { PuntoOnline } from "../../components/PuntoOnline";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

function CabeceraTarjeta({ usuario, avatarFilename, tiempo }) {
  const src = avatarSrc(usuario.id, avatarFilename, usuario.profile_type);
  const online = mostrarPuntoOnline(usuario);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
          <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
        {online && <PuntoOnline />}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="heading" style={{ fontSize: 16, color: "var(--text)" }}>
            {usuario.nick}
          </span>
          <span className="badge-gold" style={{ fontSize: 9, padding: "2px 7px" }}>
            {ISLAND_LABEL[usuario.island]}
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>{tiempo}</span>
      </div>
    </div>
  );
}

function TarjetaPublicacion({ publicacion, usuario, avatarFilename }) {
  const p = publicacion;
  return (
    <div style={{ background: "#141414", border: "1px solid #2a2a2a", padding: 20, marginBottom: 16 }}>
      <CabeceraTarjeta usuario={usuario} avatarFilename={avatarFilename} tiempo={tiempoRelativo(p.created_at)} />

      <div style={{ marginTop: 16 }}>
        {p.tipo === "texto" ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text)", whiteSpace: "pre-wrap" }}>
            {p.contenido}
          </p>
        ) : (
          <>
            <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", overflow: "hidden" }}>
              <Image
                src={`/uploads/${usuario.id}/${p.photo_filename}`}
                alt=""
                fill
                unoptimized={false}
                style={{ objectFit: "cover" }}
              />
            </div>
            {p.contenido && (
              <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
                {p.contenido}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function PublicacionesPerfil({ nick, usuario, avatarFilename, publicacionesIniciales, hasMoreInicial }) {
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales);
  const [hasMore, setHasMore] = useState(hasMoreInicial);
  const [cargando, setCargando] = useState(false);

  async function verMas() {
    setCargando(true);
    const res = await fetch(`/api/perfil/${nick}/publicaciones?offset=${publicaciones.length}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;
    setPublicaciones((prev) => [...prev, ...data.publicaciones]);
    setHasMore(data.hasMore);
  }

  return (
    <div style={{ marginTop: 56 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Publicaciones de {usuario.nick}
      </h2>

      <div style={{ marginTop: 24 }}>
        {publicaciones.map((p) => (
          <TarjetaPublicacion key={p.id} publicacion={p} usuario={usuario} avatarFilename={avatarFilename} />
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center" }}>
          <button type="button" onClick={verMas} disabled={cargando} className="btn-outline-gold">
            {cargando ? "Cargando…" : "Ver más"}
          </button>
        </div>
      )}
    </div>
  );
}

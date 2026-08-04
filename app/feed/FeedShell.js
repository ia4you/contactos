"use client";

import { useCallback, useEffect, useState } from "react";
import { Composer } from "./Composer";
import { PublicacionCard, AnuncioCardFeed } from "./PublicacionCard";
import { EmptyState } from "../components/EmptyState";

const LIMITE = 20;

export function FeedShell({ usuario, avatarFilename }) {
  const [tab, setTab] = useState("parati");
  const [publicaciones, setPublicaciones] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(true);

  const avatarUrl = avatarFilename ? `/uploads/${usuario.id}/${avatarFilename}` : null;

  const cargar = useCallback(async (tabActual, offsetActual, append) => {
    setCargando(true);
    const res = await fetch(`/api/feed/publicaciones?tab=${tabActual}&offset=${offsetActual}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;

    setPublicaciones((prev) => (append ? [...prev, ...data.publicaciones] : data.publicaciones));
    setHasMore(data.hasMore);
    setOffset(offsetActual + LIMITE);
  }, []);

  useEffect(() => {
    cargar(tab, 0, false);
  }, [tab, cargar]);

  function cambiarTab(nuevoTab) {
    if (nuevoTab === tab) return;
    setTab(nuevoTab);
    setOffset(0);
  }

  function onPublicado(nueva) {
    setPublicaciones((prev) => [nueva, ...prev]);
  }

  function onEliminar(id) {
    setPublicaciones((prev) => prev.filter((p) => p.esAnuncio || p.id !== id));
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px", background: "var(--bg)" }}>
      {tab === "parati" && (
        <div style={{ marginBottom: 24 }}>
          <Composer usuario={usuario} avatarUrl={avatarUrl} onPublicado={onPublicado} />
        </div>
      )}

      <div className="tab-nav" style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => cambiarTab("parati")}
          className={`tab-nav-item ${tab === "parati" ? "active" : ""}`}
        >
          Para ti
        </button>
        <button
          type="button"
          onClick={() => cambiarTab("siguiendo")}
          className={`tab-nav-item ${tab === "siguiendo" ? "active" : ""}`}
        >
          Siguiendo
        </button>
      </div>

      {cargando && publicaciones.length === 0 ? (
        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 0" }}>
          Cargando…
        </p>
      ) : publicaciones.length === 0 ? (
        tab === "siguiendo" ? (
          <EmptyState texto="Cuando conectes con alguien verás su actividad aquí" />
        ) : (
          <EmptyState texto="Aún no hay publicaciones. ¡Sé el primero en compartir algo!" />
        )
      ) : (
        <>
          {publicaciones.map((p) =>
            p.esAnuncio ? (
              <AnuncioCardFeed key={`anuncio-${p.id}`} anuncio={p} />
            ) : (
              <PublicacionCard key={p.id} publicacion={p} usuarioActualId={usuario.id} onEliminar={onEliminar} />
            )
          )}

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => cargar(tab, offset, true)}
                disabled={cargando}
                className="btn-outline-gold"
              >
                {cargando ? "Cargando…" : "Ver más"}
              </button>
            </div>
          )}
        </>
      )}

      {/* eslint-disable-next-line no-unused-expressions */}
      {false && publicacionesNormales}
    </div>
  );
}

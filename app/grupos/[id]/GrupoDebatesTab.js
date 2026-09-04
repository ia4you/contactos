"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicacionCard } from "@/app/feed/PublicacionCard";
import { EmptyState } from "@/app/components/EmptyState";

const LIMITE = 20;

function NuevoDebateModal({ grupoId, onClose, onCreado }) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    setError("");
    if (!titulo.trim() || !contenido.trim()) {
      setError("El título y el texto son obligatorios.");
      return;
    }
    setEnviando(true);
    const res = await fetch(`/api/grupos/${grupoId}/publicaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: titulo.trim(), contenido: contenido.trim() }),
    });
    const data = await res.json().catch(() => null);
    setEnviando(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo crear el debate.");
      return;
    }
    onCreado(data.publicacion);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(14,10,11,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 480, background: "var(--surface)", border: "1px solid var(--border-gold)", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
          Nuevo debate
        </h3>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">
            Título <span style={{ opacity: 0.6 }}>({titulo.length}/150)</span>
          </span>
          <input type="text" maxLength={150} value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input-field" />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">
            Texto <span style={{ opacity: 0.6 }}>({contenido.length}/3000)</span>
          </span>
          <textarea rows={6} maxLength={3000} value={contenido} onChange={(e) => setContenido(e.target.value)} className="input-field" />
        </label>

        {error && <p style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button type="button" onClick={onClose} disabled={enviando} className="btn-outline-gold" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={enviando} className="btn-gold" style={{ flex: 1 }}>
            {enviando ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GrupoDebatesTab({ grupoId, usuarioId, soyMiembro }) {
  const [publicaciones, setPublicaciones] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargar = useCallback(async (offsetActual, append) => {
    setCargando(true);
    const res = await fetch(`/api/grupos/${grupoId}/publicaciones?offset=${offsetActual}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;

    setPublicaciones((prev) => (append ? [...(prev || []), ...data.publicaciones] : data.publicaciones));
    setHasMore(data.hasMore);
    setOffset(offsetActual + LIMITE);
  }, [grupoId]);

  useEffect(() => {
    cargar(0, false);
  }, [cargar]);

  function onCreado(publicacion) {
    setPublicaciones((prev) => [publicacion, ...(prev || [])]);
    setModalAbierto(false);
  }

  function onEliminar(id) {
    setPublicaciones((prev) => (prev || []).filter((p) => p.id !== id));
  }

  return (
    <div style={{ padding: "24px 0" }}>
      {soyMiembro && (
        <div style={{ marginBottom: 20, textAlign: "right" }}>
          <button type="button" onClick={() => setModalAbierto(true)} className="btn-gold">
            Nuevo debate
          </button>
        </div>
      )}

      {cargando && !publicaciones ? (
        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 0" }}>
          Cargando…
        </p>
      ) : !publicaciones || publicaciones.length === 0 ? (
        <EmptyState texto="Aún no hay debates en este grupo. ¡Sé el primero en abrir uno!" />
      ) : (
        <>
          {publicaciones.map((p) => (
            <PublicacionCard key={p.id} publicacion={p} usuarioActualId={usuarioId} onEliminar={onEliminar} />
          ))}

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button type="button" onClick={() => cargar(offset, true)} disabled={cargando} className="btn-outline-gold">
                {cargando ? "Cargando…" : "Ver más"}
              </button>
            </div>
          )}
        </>
      )}

      {modalAbierto && <NuevoDebateModal grupoId={grupoId} onClose={() => setModalAbierto(false)} onCreado={onCreado} />}
    </div>
  );
}

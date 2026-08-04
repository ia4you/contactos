"use client";

import { useState } from "react";
import { ISLANDS, LOOKING_FOR_OPTIONS } from "@/lib/constants";

export function AnuncioModal({ anuncioExistente, islaPorDefecto, onClose, onGuardado }) {
  const esEdicion = Boolean(anuncioExistente);
  const [titulo, setTitulo] = useState(anuncioExistente?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(anuncioExistente?.descripcion ?? "");
  const [busco, setBusco] = useState(anuncioExistente?.busco ?? []);
  const [island, setIsland] = useState(anuncioExistente?.island ?? islaPorDefecto);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  function toggleBusco(valor) {
    setBusco((b) => (b.includes(valor) ? b.filter((v) => v !== valor) : [...b, valor]));
  }

  async function guardar() {
    setError("");
    if (!titulo.trim() || titulo.length > 80) {
      setError("El título debe tener entre 1 y 80 caracteres.");
      return;
    }
    if (!descripcion.trim() || descripcion.length > 300) {
      setError("La descripción debe tener entre 1 y 300 caracteres.");
      return;
    }
    if (!busco.length) {
      setError("Selecciona al menos qué buscas.");
      return;
    }

    setEnviando(true);
    const url = esEdicion ? `/api/anuncios/${anuncioExistente.id}` : "/api/anuncios";
    const res = await fetch(url, {
      method: esEdicion ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: titulo.trim(), descripcion: descripcion.trim(), busco, island }),
    });
    const data = await res.json().catch(() => null);
    setEnviando(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo guardar el anuncio.");
      return;
    }
    onGuardado(data.anuncio);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(14,10,11,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 480, background: "var(--surface)", border: "1px solid var(--border-gold)", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
          {esEdicion ? "Editar anuncio" : "Crear anuncio"}
        </h3>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">Título</span>
          <input
            type="text"
            maxLength={80}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="input-field"
            placeholder="Título de tu anuncio"
          />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">
            Descripción <span style={{ opacity: 0.6 }}>({descripcion.length}/300)</span>
          </span>
          <textarea
            rows={4}
            maxLength={300}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="input-field"
            placeholder="Cuéntanos qué buscas…"
          />
        </label>

        <div style={{ marginTop: 18 }}>
          <span className="label-field">Qué busco</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LOOKING_FOR_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => toggleBusco(o.value)}
                className={`fetiche-chip ${busco.includes(o.value) ? "active" : ""}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">Isla</span>
          <select value={island} onChange={(e) => setIsland(e.target.value)} className="input-field">
            {ISLANDS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button type="button" onClick={onClose} disabled={enviando} className="btn-outline-gold" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={enviando} className="btn-gold" style={{ flex: 1 }}>
            {enviando ? "Guardando…" : "Publicar anuncio"}
          </button>
        </div>
      </div>
    </div>
  );
}

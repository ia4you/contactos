"use client";

import { useState } from "react";
import { ISLANDS } from "@/lib/constants";

export function CrearGrupoModal({ onClose, onCreado }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isla, setIsla] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    setError("");
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setEnviando(true);
    const res = await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim(), isla: isla || null }),
    });
    const data = await res.json().catch(() => null);
    setEnviando(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo crear el grupo.");
      return;
    }
    onCreado(data.grupo);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(14,10,11,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 420, background: "var(--surface)", border: "1px solid var(--border-gold)", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
          Crear grupo
        </h3>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">
            Nombre <span style={{ opacity: 0.6 }}>({nombre.length}/50)</span>
          </span>
          <input type="text" maxLength={50} value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-field" />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">
            Descripción <span style={{ opacity: 0.6 }}>({descripcion.length}/200)</span>
          </span>
          <textarea rows={3} maxLength={200} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="input-field" />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">Isla (opcional)</span>
          <select value={isla} onChange={(e) => setIsla(e.target.value)} className="input-field">
            <option value="">Sin isla específica</option>
            {ISLANDS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </label>

        {error && <p style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button type="button" onClick={onClose} disabled={enviando} className="btn-outline-gold" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={enviando} className="btn-gold" style={{ flex: 1 }}>
            {enviando ? "Creando…" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}

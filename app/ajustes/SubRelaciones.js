"use client";

import { useState } from "react";

export function SubRelaciones({ usuario }) {
  const [estadoRelacion, setEstadoRelacion] = useState(usuario.estado_relacion || "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    setError("");
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estadoRelacion }),
    });
    const data = await res.json().catch(() => null);
    setGuardando(false);
    if (res.ok) {
      setGuardado(true);
      return;
    }
    setError(data?.error || "No se pudieron guardar los cambios.");
  }

  return (
    <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Relaciones
      </h2>

      <label>
        <span className="label-field">Estado de relación</span>
        <input
          type="text"
          maxLength={200}
          placeholder="Ej: En pareja abierta, Soltero/a…"
          value={estadoRelacion}
          onChange={(e) => setEstadoRelacion(e.target.value)}
          className="input-field"
        />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button type="submit" disabled={guardando} className="btn-outline-gold">
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        {guardado && <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>Guardado.</span>}
      </div>
      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}
    </form>
  );
}

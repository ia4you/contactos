"use client";

import { useState } from "react";
import { ISLANDS } from "@/lib/constants";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

export function GrupoAcercaDeTab({ grupoId, grupo, soyAdmin, onGrupoActualizado }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(grupo.nombre);
  const [descripcion, setDescripcion] = useState(grupo.descripcion || "");
  const [normas, setNormas] = useState(grupo.normas || "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    setError("");
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setGuardando(true);
    const res = await fetch(`/api/grupos/${grupoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim(), normas: normas.trim() }),
    });
    const data = await res.json().catch(() => null);
    setGuardando(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo guardar el grupo.");
      return;
    }
    onGrupoActualizado(data.grupo);
    setEditando(false);
  }

  function cancelar() {
    setNombre(grupo.nombre);
    setDescripcion(grupo.descripcion || "");
    setNormas(grupo.normas || "");
    setError("");
    setEditando(false);
  }

  if (soyAdmin && editando) {
    return (
      <div style={{ padding: "24px 0", maxWidth: 560 }}>
        <label style={{ display: "block" }}>
          <span className="label-field">
            Nombre <span style={{ opacity: 0.6 }}>({nombre.length}/50)</span>
          </span>
          <input type="text" maxLength={50} value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-field" />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">
            Acerca de <span style={{ opacity: 0.6 }}>({descripcion.length}/200)</span>
          </span>
          <textarea rows={3} maxLength={200} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="input-field" />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">
            Normas <span style={{ opacity: 0.6 }}>({normas.length}/2000)</span>
          </span>
          <textarea rows={8} maxLength={2000} value={normas} onChange={(e) => setNormas(e.target.value)} className="input-field" />
        </label>

        {error && <p style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button type="button" onClick={cancelar} disabled={guardando} className="btn-outline-gold" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={guardando} className="btn-gold" style={{ flex: 1 }}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0", maxWidth: 560 }}>
      {grupo.isla && (
        <span className="badge-gold" style={{ marginBottom: 16, display: "inline-block" }}>
          {ISLAND_LABEL[grupo.isla]}
        </span>
      )}

      <p className="kicker" style={{ letterSpacing: 2 }}>Acerca de</p>
      <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
        {grupo.descripcion || "Este grupo no tiene descripción."}
      </p>

      <p className="kicker" style={{ marginTop: 28, letterSpacing: 2 }}>Normas</p>
      <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
        {grupo.normas || "Este grupo aún no tiene normas publicadas."}
      </p>

      {soyAdmin && (
        <button type="button" onClick={() => setEditando(true)} className="btn-outline-gold" style={{ marginTop: 24 }}>
          Editar
        </button>
      )}
    </div>
  );
}

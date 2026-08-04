"use client";

import { useState } from "react";
import {
  ISLANDS,
  LOOKING_FOR_OPTIONS,
  GENERO_OPTIONS,
  GENERO_MAX,
  ORIENTACION_OPTIONS,
  ORIENTACION_MAX,
  ROL_OPTIONS,
  ROL_MAX,
} from "@/lib/constants";
import { MultiSelectChips } from "../components/MultiSelectChips";

function isoDate(valor) {
  if (!valor) return "";
  const d = new Date(valor);
  if (isNaN(d)) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function SubInfoGeneral({ usuario }) {
  const [genero, setGenero] = useState(usuario.genero || []);
  const [orientacion, setOrientacion] = useState(usuario.orientacion || []);
  const [rol, setRol] = useState(usuario.rol || []);
  const [island, setIsland] = useState(usuario.island);
  const [lookingFor, setLookingFor] = useState(usuario.looking_for || []);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  function toggleLookingFor(valor) {
    setLookingFor((lf) => (lf.includes(valor) ? lf.filter((v) => v !== valor) : [...lf, valor]));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ genero, orientacion, rol, island, lookingFor }),
    });
    setGuardando(false);
    if (res.ok) setGuardado(true);
  }

  return (
    <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Información general
      </h2>

      <MultiSelectChips label="Género" options={GENERO_OPTIONS} selected={genero} onChange={setGenero} max={GENERO_MAX} />
      <MultiSelectChips
        label="Orientación"
        options={ORIENTACION_OPTIONS}
        selected={orientacion}
        onChange={setOrientacion}
        max={ORIENTACION_MAX}
      />
      <MultiSelectChips label="Rol" options={ROL_OPTIONS} selected={rol} onChange={setRol} max={ROL_MAX} />

      {usuario.profile_type === "pareja" ? (
        <div className="grid-2-responsive" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            <span className="label-field">Fecha de nacimiento (ella)</span>
            <input
              type="date"
              value={isoDate(usuario.her_birthdate)}
              readOnly
              disabled
              className="input-field"
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </label>
          <label>
            <span className="label-field">Fecha de nacimiento (él)</span>
            <input
              type="date"
              value={isoDate(usuario.his_birthdate)}
              readOnly
              disabled
              className="input-field"
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </label>
        </div>
      ) : (
        <label>
          <span className="label-field">Fecha de nacimiento</span>
          <input
            type="date"
            value={isoDate(usuario.her_birthdate)}
            readOnly
            disabled
            className="input-field"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          />
        </label>
      )}

      <label>
        <span className="label-field">Isla</span>
        <select value={island} onChange={(e) => setIsland(e.target.value)} className="input-field">
          {ISLANDS.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="label-field">¿Qué buscas?</span>
        <div className="grid-2-responsive" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {LOOKING_FOR_OPTIONS.map((o) => (
            <label
              key={o.value}
              style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}
            >
              <input
                type="checkbox"
                checked={lookingFor.includes(o.value)}
                onChange={() => toggleLookingFor(o.value)}
                className="checkbox-gold"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button type="submit" disabled={guardando} className="btn-outline-gold">
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        {guardado && <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>Guardado.</span>}
      </div>
    </form>
  );
}

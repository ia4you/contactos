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

export function TabDatos({ usuario }) {
  const [bio, setBio] = useState(usuario.bio || "");
  const [herBio, setHerBio] = useState(usuario.her_bio || "");
  const [hisBio, setHisBio] = useState(usuario.his_bio || "");
  const [island, setIsland] = useState(usuario.island);
  const [lookingFor, setLookingFor] = useState(usuario.looking_for || []);
  const [genero, setGenero] = useState(usuario.genero || []);
  const [orientacion, setOrientacion] = useState(usuario.orientacion || []);
  const [rol, setRol] = useState(usuario.rol || []);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  function toggleLookingFor(valor) {
    setLookingFor((lf) => (lf.includes(valor) ? lf.filter((v) => v !== valor) : [...lf, valor]));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    setError("");
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, herBio, hisBio, island, lookingFor, genero, orientacion, rol }),
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
    <form onSubmit={guardar} style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 24 }}>
      {usuario.profile_type === "pareja" ? (
        <>
          <label>
            <span className="label-field">Biografía de ella</span>
            <textarea
              rows={4}
              maxLength={2000}
              value={herBio}
              onChange={(e) => setHerBio(e.target.value)}
              className="input-field"
              style={{ resize: "none" }}
            />
          </label>
          <label>
            <span className="label-field">Biografía de él</span>
            <textarea
              rows={4}
              maxLength={2000}
              value={hisBio}
              onChange={(e) => setHisBio(e.target.value)}
              className="input-field"
              style={{ resize: "none" }}
            />
          </label>
        </>
      ) : (
        <label>
          <span className="label-field">Biografía</span>
          <textarea
            rows={4}
            maxLength={2000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-field"
            style={{ resize: "none" }}
          />
        </label>
      )}

      <MultiSelectChips
        label="Género"
        options={GENERO_OPTIONS}
        selected={genero}
        onChange={setGenero}
        max={GENERO_MAX}
      />
      <MultiSelectChips
        label="Orientación"
        options={ORIENTACION_OPTIONS}
        selected={orientacion}
        onChange={setOrientacion}
        max={ORIENTACION_MAX}
      />
      <MultiSelectChips
        label="Rol"
        options={ROL_OPTIONS}
        selected={rol}
        onChange={setRol}
        max={ROL_MAX}
      />

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
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        {guardado && <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>Guardado.</span>}
      </div>
      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}
    </form>
  );
}

"use client";

import { useState } from "react";

export function SubAcercaDe({ usuario }) {
  const [bio, setBio] = useState(usuario.bio || "");
  const [herBio, setHerBio] = useState(usuario.her_bio || "");
  const [hisBio, setHisBio] = useState(usuario.his_bio || "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    setError("");
    const body = usuario.profile_type === "pareja" ? { herBio, hisBio } : { bio };
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
        Acerca de
      </h2>

      {usuario.profile_type === "pareja" ? (
        <>
          <label>
            <span className="label-field">Sobre ella</span>
            <textarea
              rows={6}
              maxLength={2000}
              value={herBio}
              onChange={(e) => setHerBio(e.target.value)}
              className="input-field"
              style={{ resize: "none" }}
            />
          </label>
          <label>
            <span className="label-field">Sobre él</span>
            <textarea
              rows={6}
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
          <span className="label-field">Cuéntanos sobre ti</span>
          <textarea
            rows={8}
            maxLength={2000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-field"
            style={{ resize: "none" }}
          />
        </label>
      )}

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

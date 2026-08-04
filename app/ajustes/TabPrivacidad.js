"use client";

import { useState } from "react";
import { Toggle } from "../components/Toggle";

export function TabPrivacidad({ usuario }) {
  const [showInSearch, setShowInSearch] = useState(usuario.show_in_search);
  const [showLastSeen, setShowLastSeen] = useState(usuario.show_last_seen);
  const [onlyVerified, setOnlyVerified] = useState(usuario.only_verified);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function guardar() {
    setGuardando(true);
    setGuardado(false);
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showInSearch, showLastSeen, onlyVerified }),
    });
    setGuardando(false);
    if (res.ok) setGuardado(true);
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Privacidad
      </h2>

      <div style={{ marginTop: 16, borderTop: "1px solid rgba(201,161,90,0.12)" }}>
        <div style={{ borderBottom: "1px solid rgba(201,161,90,0.12)" }}>
          <Toggle
            checked={showInSearch}
            onChange={setShowInSearch}
            label="Mostrar mi perfil en búsquedas"
            descripcion="Si lo desactivas, no aparecerás en los resultados de /buscar."
          />
        </div>
        <div style={{ borderBottom: "1px solid rgba(201,161,90,0.12)" }}>
          <Toggle
            checked={showLastSeen}
            onChange={setShowLastSeen}
            label="Mostrar mi última conexión"
          />
        </div>
        <div style={{ borderBottom: "1px solid rgba(201,161,90,0.12)" }}>
          <Toggle
            checked={onlyVerified}
            onChange={setOnlyVerified}
            label="Solo miembros verificados pueden contactarme"
          />
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <button type="button" onClick={guardar} disabled={guardando} className="btn-outline-gold">
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        {guardado && <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>Guardado.</span>}
      </div>
    </div>
  );
}

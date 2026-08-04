"use client";

import { useState } from "react";

function conTresSlots(lista) {
  const copia = [...(lista || [])];
  while (copia.length < 3) copia.push("");
  return copia.slice(0, 3);
}

export function SubSitiosWeb({ usuario }) {
  const [sitios, setSitios] = useState(conTresSlots(usuario.sitios_web));
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  function actualizar(i, valor) {
    setSitios((s) => s.map((v, idx) => (idx === i ? valor : v)));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sitiosWeb: sitios }),
    });
    setGuardando(false);
    if (res.ok) setGuardado(true);
  }

  return (
    <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Sitios web
      </h2>

      {sitios.map((valor, i) => (
        <label key={i}>
          <span className="label-field">Sitio {i + 1}</span>
          <input
            type="text"
            maxLength={300}
            placeholder="https://…"
            value={valor}
            onChange={(e) => actualizar(i, e.target.value)}
            className="input-field"
          />
        </label>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button type="submit" disabled={guardando} className="btn-outline-gold">
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        {guardado && <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>Guardado.</span>}
      </div>
    </form>
  );
}

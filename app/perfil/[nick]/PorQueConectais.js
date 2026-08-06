"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export function PorQueConectais({ nick }) {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    fetch(`/api/perfil/${nick}/compatibilidad`)
      .then((r) => r.json())
      .then(setDatos)
      .catch(() => setDatos(null));
  }, [nick]);

  if (!datos) return null;
  const { gustosCompartidos = [], gustosComplementarios = [], explicacion } = datos;
  if (gustosCompartidos.length === 0 && gustosComplementarios.length === 0 && !explicacion) return null;

  return (
    <div style={{ marginTop: 56, background: "#1c1416", border: "1px solid rgba(201,161,90,0.18)", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Heart size={18} color="var(--gold)" fill="var(--gold)" />
        <h2 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>
          Por qué conectáis
        </h2>
      </div>

      <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
        {gustosCompartidos.length > 0 &&
          `Compartís ${gustosCompartidos.length} gusto${gustosCompartidos.length === 1 ? "" : "s"} en común. `}
        {explicacion}
      </p>

      {(gustosCompartidos.length > 0 || gustosComplementarios.length > 0) && (
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {gustosCompartidos.map((g) => (
            <span key={`c-${g}`} className="fetiche-chip active" style={{ cursor: "default" }}>
              {g}
            </span>
          ))}
          {gustosComplementarios.map(([a, b]) => (
            <span
              key={`x-${a}-${b}`}
              style={{
                display: "inline-block",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                padding: "8px 16px",
                border: "1px solid var(--burdeos)",
                background: "var(--burdeos)",
                color: "var(--text)",
              }}
            >
              {a} / {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

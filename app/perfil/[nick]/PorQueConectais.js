"use client";

import { useEffect, useState } from "react";

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
    <div style={{ marginTop: 56 }}>
      <h2 className="widget-titulo">Por qué conectáis</h2>

      <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
        {gustosCompartidos.length > 0 &&
          `Compartís ${gustosCompartidos.length} gusto${gustosCompartidos.length === 1 ? "" : "s"} en común. `}
        {explicacion}
      </p>

      {(gustosCompartidos.length > 0 || gustosComplementarios.length > 0) && (
        <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--gold)", lineHeight: 1.7 }}>
          {[...gustosCompartidos, ...gustosComplementarios.map(([a, b]) => `${a} / ${b}`)].join(" · ")}
        </p>
      )}
    </div>
  );
}

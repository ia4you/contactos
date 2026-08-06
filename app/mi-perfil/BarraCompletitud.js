"use client";

import { calcularCompletitud } from "@/lib/completitud";

export function BarraCompletitud({ usuario, fotos, gustosCount }) {
  const { pct, siguientePaso } = calcularCompletitud(usuario, fotos, gustosCount);

  return (
    <div style={{ background: "#1c1416", border: "1px solid rgba(201,161,90,0.18)", padding: "16px 20px", marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>
          Perfil al {pct}%{siguientePaso && ` · Siguiente paso: ${siguientePaso}`}
        </p>
      </div>

      <div style={{ marginTop: 10, height: 6, background: "#2a2a2a" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold)", transition: "width 0.3s ease" }} />
      </div>

      {pct < 50 && (
        <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12, color: "#e07a7a" }}>
          Tu perfil no aparece en búsquedas hasta completar al menos el 50%
        </p>
      )}
    </div>
  );
}

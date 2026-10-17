"use client";

import { calcularCompletitud, UMBRAL_BUSQUEDA } from "@/lib/completitud";

export function BarraCompletitud({ usuario, fotos, gustosCount }) {
  const { pct, siguientePaso } = calcularCompletitud(usuario, fotos, gustosCount);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--rule)", padding: "16px 20px", marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)" }}>
          Perfil al {pct}%{siguientePaso && ` · Siguiente paso: ${siguientePaso}`}
        </p>
      </div>

      <div style={{ marginTop: 10, height: 6, background: "var(--bg-deep)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold)", transition: "width 0.3s ease" }} />
      </div>

      {pct < UMBRAL_BUSQUEDA && (
        <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--danger)" }}>
          Tu perfil no aparece en búsquedas hasta subir tu foto de avatar
        </p>
      )}
    </div>
  );
}

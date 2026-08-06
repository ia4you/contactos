"use client";

import { useEffect, useState } from "react";

const TARJETAS = [
  { key: "total_usuarios", label: "Usuarios totales" },
  { key: "nuevos_hoy", label: "Nuevos hoy" },
  { key: "fotos_pendientes", label: "Fotos pendientes" },
  { key: "denuncias_abiertas", label: "Denuncias abiertas" },
  { key: "mensajes_hoy", label: "Mensajes hoy" },
  { key: "llamadas_groq_hoy", label: "Llamadas a Groq hoy" },
];

export function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  if (!stats) {
    return <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
      {TARJETAS.map((t) => (
        <div key={t.key} style={{ background: "#141414", border: "1px solid #2a2a2a", padding: 20, textAlign: "center" }}>
          <p className="heading" style={{ fontSize: 36, color: "var(--gold)" }}>{stats[t.key]}</p>
          <p style={{ marginTop: 6, fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
            {t.label}
          </p>
        </div>
      ))}
    </div>
  );
}

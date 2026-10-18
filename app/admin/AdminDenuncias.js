"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tiempoRelativo } from "@/lib/tiempo";
import { EmptyState } from "../components/EmptyState";

export function AdminDenuncias() {
  const [denuncias, setDenuncias] = useState(null);

  function cargar() {
    fetch("/api/admin/denuncias")
      .then((r) => r.json())
      .then((d) => setDenuncias(d.denuncias || []))
      .catch(() => setDenuncias([]));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function resolver(id) {
    setDenuncias((prev) => prev.filter((d) => d.id !== id));
    await fetch(`/api/admin/denuncias/${id}/resolver`, { method: "PATCH" });
  }

  if (denuncias === null) {
    return <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>;
  }
  if (denuncias.length === 0) {
    return <EmptyState texto="No hay denuncias abiertas" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {denuncias.map((d) => (
        <div key={d.id} style={{ background: "var(--surface)", border: "1px solid var(--rule)", padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)" }}>
              <strong>{d.reporter_nick}</strong> denunció a <strong>{d.reported_nick}</strong>
            </p>
            {d.reason && (
              <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>{d.reason}</p>
            )}
            <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{tiempoRelativo(d.created_at)}</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {d.reported_id && (
              <Link href={`/perfil/${d.reported_nick}`} className="btn-outline-gold" style={{ fontSize: 12, padding: "8px 14px" }}>
                Ver perfil denunciado
              </Link>
            )}
            <button type="button" onClick={() => resolver(d.id)} className="btn-gold" style={{ fontSize: 12, padding: "8px 14px" }}>
              Resolver
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

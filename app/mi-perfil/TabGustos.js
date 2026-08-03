"use client";

import { useEffect, useState } from "react";

export function TabGustos({ setFetichesCount }) {
  const [categorias, setCategorias] = useState(null);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch("/api/perfil/fetiches")
      .then((r) => r.json())
      .then((d) => {
        setCategorias(d.categorias);
        setSeleccionados(new Set(d.seleccionados));
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  function toggle(id) {
    setGuardado(false);
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function guardar() {
    setGuardando(true);
    setGuardado(false);
    const res = await fetch("/api/perfil/fetiches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fetiche_ids: [...seleccionados] }),
    });
    setGuardando(false);
    if (res.ok) {
      setGuardado(true);
      setFetichesCount(seleccionados.size);
    }
  }

  if (cargando) {
    return (
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>Cargando…</p>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 className="heading" style={{ fontSize: 24, color: "var(--text)" }}>
        Mis gustos
      </h2>
      <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
        Selecciona tus gustos e intereses. Aparecerán en tu perfil público.
      </p>

      {Object.entries(categorias || {}).map(([categoria, fetiches], i) => (
        <div key={categoria} style={{ marginTop: i === 0 ? 32 : 32 }}>
          <p className="kicker" style={{ letterSpacing: 3 }}>
            {categoria}
          </p>
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {fetiches.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                className={`fetiche-chip ${seleccionados.has(f.id) ? "active" : ""}`}
              >
                {f.nombre}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 16 }}>
        <button type="button" onClick={guardar} disabled={guardando} className="btn-gold">
          {guardando ? "Guardando…" : "Guardar mis gustos"}
        </button>
        {guardado && <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>Guardado.</span>}
      </div>
    </div>
  );
}

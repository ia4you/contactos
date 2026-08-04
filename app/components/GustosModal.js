"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

// Modal reutilizable: en /mi-perfil persiste la selección del usuario, en
// /buscar solo alimenta el filtro de búsqueda. El propio componente decide
// cuándo cerrarse (tras un onGuardar resuelto con éxito), así cada sitio que
// lo usa no tiene que duplicar esa lógica.
export function GustosModal({ seleccionInicial, onCerrar, onGuardar }) {
  const [categorias, setCategorias] = useState(null);
  const [seleccion, setSeleccion] = useState(new Set(seleccionInicial ?? []));
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetch("/api/perfil/fetiches")
      .then((r) => r.json())
      .then((d) => setCategorias(d.categorias))
      .catch(() => setCategorias({}));
  }, []);

  function toggle(id) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function guardar() {
    setGuardando(true);
    await onGuardar(seleccion);
    setGuardando(false);
    onCerrar();
  }

  const termino = busqueda.trim().toLowerCase();
  const categoriasFiltradas = Object.entries(categorias || {})
    .map(([categoria, items]) => [
      categoria,
      termino ? items.filter((f) => f.nombre.toLowerCase().includes(termino)) : items,
    ])
    .filter(([, items]) => items.length > 0);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(201,161,90,0.18)",
          flexShrink: 0,
        }}
      >
        <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
          Mis gustos
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            padding: 4,
          }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <div style={{ position: "relative", maxWidth: 420 }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar gustos…"
            className="input-field"
            style={{ paddingLeft: 38 }}
          />
        </div>

        {categorias === null ? (
          <p style={{ marginTop: 32, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
            Cargando…
          </p>
        ) : categoriasFiltradas.length === 0 ? (
          <p style={{ marginTop: 32, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
            No se encontraron gustos.
          </p>
        ) : (
          categoriasFiltradas.map(([categoria, items]) => (
            <div key={categoria} style={{ marginTop: 32 }}>
              <p className="kicker" style={{ letterSpacing: 3 }}>
                {categoria}
              </p>
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
                {items.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggle(f.id)}
                    className={`fetiche-chip ${seleccion.has(f.id) ? "active" : ""}`}
                  >
                    {f.nombre}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          padding: "16px 24px 20px",
          borderTop: "1px solid rgba(201,161,90,0.18)",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 12,
          }}
        >
          {seleccion.size} {seleccion.size === 1 ? "gusto seleccionado" : "gustos seleccionados"}
        </p>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="btn-gold"
          style={{ width: "100%", opacity: guardando ? 0.6 : 1 }}
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

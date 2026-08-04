"use client";

import { useEffect, useMemo, useState } from "react";
import { GustosModal } from "../components/GustosModal";

export function TabGustos({ setFetichesCount }) {
  const [categorias, setCategorias] = useState(null);
  const [guardados, setGuardados] = useState(new Set());
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    fetch("/api/perfil/fetiches")
      .then((r) => r.json())
      .then((d) => {
        setCategorias(d.categorias);
        setGuardados(new Set(d.seleccionados));
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const nombrePorId = useMemo(() => {
    const mapa = {};
    Object.values(categorias || {}).forEach((items) => {
      items.forEach((f) => {
        mapa[f.id] = f.nombre;
      });
    });
    return mapa;
  }, [categorias]);

  async function guardarEnServidor(seleccion) {
    const res = await fetch("/api/perfil/fetiches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fetiche_ids: [...seleccion] }),
    });
    if (res.ok) {
      setGuardados(seleccion);
      setFetichesCount(seleccion.size);
    }
  }

  if (cargando) {
    return (
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>Cargando…</p>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <h2 className="heading" style={{ fontSize: 24, color: "var(--text)" }}>
          Mis gustos
        </h2>
        {guardados.size > 0 && (
          <button type="button" onClick={() => setModalAbierto(true)} className="btn-outline-gold">
            Editar mis gustos
          </button>
        )}
      </div>

      {guardados.size === 0 ? (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
            Aún no has añadido tus gustos
          </p>
          <button type="button" onClick={() => setModalAbierto(true)} className="btn-gold" style={{ marginTop: 16 }}>
            Añadir gustos
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[...guardados].map((id) => (
            <span key={id} className="fetiche-chip active" style={{ cursor: "default" }}>
              {nombrePorId[id]}
            </span>
          ))}
        </div>
      )}

      {modalAbierto && (
        <GustosModal
          seleccionInicial={guardados}
          onCerrar={() => setModalAbierto(false)}
          onGuardar={guardarEnServidor}
        />
      )}
    </div>
  );
}

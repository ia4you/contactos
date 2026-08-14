"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { ISLANDS, LOOKING_FOR_OPTIONS } from "@/lib/constants";
import { MultiSelectChips } from "../components/MultiSelectChips";
import { EmptyState } from "../components/EmptyState";
import { AnuncioCard } from "./AnuncioCard";
import { AnuncioModal } from "./AnuncioModal";

const LIMITE = 20;
const ESTADO_INICIAL = { islas: [], busco: [] };

export function AnunciosShell({ usuario }) {
  const searchParams = useSearchParams();
  const [filtros, setFiltros] = useState(ESTADO_INICIAL);
  const [anuncios, setAnuncios] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [filtrosAbiertosMovil, setFiltrosAbiertosMovil] = useState(false);
  const [anuncioPropio, setAnuncioPropio] = useState(undefined);
  // Deep link desde el menú "+" del navbar ("/anuncios?crear=1").
  const [modalAbierto, setModalAbierto] = useState(() => searchParams.get("crear") === "1");
  const [anuncioEnEdicion, setAnuncioEnEdicion] = useState(null);

  const cargar = useCallback(async (filtrosActuales, offsetActual, append) => {
    setCargando(true);
    const params = new URLSearchParams();
    filtrosActuales.islas.forEach((v) => params.append("islas", v));
    filtrosActuales.busco.forEach((v) => params.append("busco", v));
    params.set("offset", String(offsetActual));

    const res = await fetch(`/api/anuncios?${params.toString()}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;

    setAnuncios((prev) => (append ? [...prev, ...data.anuncios] : data.anuncios));
    setHasMore(data.hasMore);
    setOffset(offsetActual + LIMITE);
  }, []);

  useEffect(() => {
    cargar(ESTADO_INICIAL, 0, false);
    fetch("/api/anuncios/mio")
      .then((r) => r.json())
      .then((d) => setAnuncioPropio(d.anuncio))
      .catch(() => setAnuncioPropio(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function filtrar() {
    setFiltrosAbiertosMovil(false);
    cargar(filtros, 0, false);
  }

  function limpiar() {
    setFiltros(ESTADO_INICIAL);
    cargar(ESTADO_INICIAL, 0, false);
  }

  function cargarMas() {
    cargar(filtros, offset, true);
  }

  function abrirCrear() {
    setAnuncioEnEdicion(null);
    setModalAbierto(true);
  }

  function abrirEditar(anuncio) {
    setAnuncioEnEdicion(anuncio);
    setModalAbierto(true);
  }

  function onGuardado(anuncio) {
    setAnuncioPropio(anuncio);
    setModalAbierto(false);
    if (anuncioEnEdicion) {
      setAnuncios((prev) => prev.map((a) => (a.id === anuncio.id ? { ...a, ...anuncio } : a)));
    } else {
      cargar(filtros, 0, false);
    }
  }

  async function eliminarAnuncio(id) {
    if (!window.confirm("¿Eliminar tu anuncio?")) return;
    setAnuncios((prev) => prev.filter((a) => a.id !== id));
    setAnuncioPropio(null);
    await fetch(`/api/anuncios/${id}`, { method: "DELETE" });
  }

  return (
    <div style={{ background: "var(--bg)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="kicker">Comunidad</p>
          <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
            Anuncios
          </h1>
        </div>
        <button type="button" onClick={anuncioPropio ? () => abrirEditar(anuncioPropio) : abrirCrear} className="btn-gold">
          {anuncioPropio ? "Editar mi anuncio" : "Crear anuncio"}
        </button>
      </div>

      <button
        type="button"
        className="anuncios-filtros-toggle"
        onClick={() => setFiltrosAbiertosMovil((v) => !v)}
        style={{
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "16px 24px",
          background: "var(--bg-secondary)",
          border: "none",
          borderTop: "1px solid rgba(201,161,90,0.18)",
          borderBottom: "1px solid rgba(201,161,90,0.18)",
          color: "var(--gold)",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          cursor: "pointer",
        }}
      >
        <Filter size={16} />
        Filtros
      </button>

      <div className="anuncios-layout" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <aside className={`anuncios-sidebar ${filtrosAbiertosMovil ? "" : "anuncios-sidebar--cerrado"}`} style={{ paddingTop: 24 }}>
          <p className="kicker">Filtrar anuncios</p>

          <div style={{ marginTop: 20 }}>
            <MultiSelectChips
              label="Isla"
              options={ISLANDS}
              selected={filtros.islas}
              onChange={(v) => setFiltros((f) => ({ ...f, islas: v }))}
              modo="resumen"
              textoVacio="Todas las islas"
              textoResumen={(n) => `${n} isla${n === 1 ? "" : "s"} seleccionada${n === 1 ? "" : "s"}`}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <span className="label-field">Qué buscan</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LOOKING_FOR_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() =>
                    setFiltros((f) => ({
                      ...f,
                      busco: f.busco.includes(o.value) ? f.busco.filter((v) => v !== o.value) : [...f.busco, o.value],
                    }))
                  }
                  className={`fetiche-chip ${filtros.busco.includes(o.value) ? "active" : ""}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
            <button type="button" onClick={filtrar} className="btn-gold" style={{ flex: 1 }}>
              Filtrar
            </button>
            <button type="button" onClick={limpiar} className="btn-outline-gold" style={{ flex: 1 }}>
              Limpiar
            </button>
          </div>
        </aside>

        <section style={{ paddingTop: 24 }}>
          {cargando && anuncios.length === 0 ? (
            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "60px 0" }}>
              Cargando…
            </p>
          ) : anuncios.length === 0 ? (
            <EmptyState texto="No hay anuncios que coincidan con tu búsqueda" />
          ) : (
            <>
              <div className="anuncios-grid">
                {anuncios.map((a) => (
                  <AnuncioCard
                    key={a.id}
                    anuncio={a}
                    esPropio={String(a.user_id) === String(usuario.id)}
                    onEditar={abrirEditar}
                    onEliminar={eliminarAnuncio}
                  />
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button type="button" onClick={cargarMas} disabled={cargando} className="btn-outline-gold">
                    {cargando ? "Cargando…" : "Ver más"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {modalAbierto && (
        <AnuncioModal
          anuncioExistente={anuncioEnEdicion}
          islaPorDefecto={usuario.island}
          onClose={() => setModalAbierto(false)}
          onGuardado={onGuardado}
        />
      )}
    </div>
  );
}

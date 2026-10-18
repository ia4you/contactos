"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Filter, X } from "lucide-react";
import { Dialogo } from "../components/Dialogo";
import { UsuarioBadge } from "../components/UsuarioBadge";
import {
  ISLANDS,
  PROFILE_TYPES,
  LOOKING_FOR_OPTIONS,
  ORIENTACION_OPTIONS,
  avatarSrc,
} from "@/lib/constants";
import { GustosModal } from "../components/GustosModal";
import { MultiSelectChips } from "../components/MultiSelectChips";
import { mostrarPuntoOnline } from "@/lib/online";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const ESTADO_INICIAL = {
  tipos: [],
  islas: [],
  edadMin: "",
  edadMax: "",
  orientaciones: [],
  lookingFor: [],
  feticheIds: new Set(),
};

function toggleEnArray(lista, valor) {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

export default function Buscar() {
  const [filtros, setFiltros] = useState(ESTADO_INICIAL);
  const [perfiles, setPerfiles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [gustosModalAbierto, setGustosModalAbierto] = useState(false);
  const [filtrosAbiertosMovil, setFiltrosAbiertosMovil] = useState(false);

  const ejecutarBusqueda = useCallback(async (filtrosActuales, pageNum, append) => {
    setCargando(true);
    const params = new URLSearchParams();
    filtrosActuales.tipos.forEach((v) => params.append("tipos", v));
    filtrosActuales.islas.forEach((v) => params.append("islas", v));
    filtrosActuales.orientaciones.forEach((v) => params.append("orientaciones", v));
    filtrosActuales.lookingFor.forEach((v) => params.append("looking_for", v));
    [...filtrosActuales.feticheIds].forEach((id) => params.append("fetiche_ids", String(id)));
    if (filtrosActuales.edadMin) params.set("edad_min", filtrosActuales.edadMin);
    if (filtrosActuales.edadMax) params.set("edad_max", filtrosActuales.edadMax);
    params.set("page", String(pageNum));

    const res = await fetch(`/api/buscar?${params.toString()}`);
    const data = await res.json();
    setCargando(false);

    if (!res.ok) return;

    setPerfiles((prev) => (append ? [...prev, ...data.perfiles] : data.perfiles));
    setHasMore(data.hasMore);
    setPage(pageNum);
  }, []);

  useEffect(() => {
    ejecutarBusqueda(ESTADO_INICIAL, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function actualizar(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
  }

  function buscar() {
    setFiltrosAbiertosMovil(false);
    ejecutarBusqueda(filtros, 1, false);
  }

  function limpiarFiltros() {
    setFiltros(ESTADO_INICIAL);
    ejecutarBusqueda(ESTADO_INICIAL, 1, false);
  }

  function cargarMas() {
    ejecutarBusqueda(filtros, page + 1, true);
  }

  async function onGuardarGustos(seleccion) {
    setFiltros((f) => ({ ...f, feticheIds: seleccion }));
  }

  const panelFiltros = (
    <>
      <Bloque titulo="Tipo de perfil">
        <div style={{ display: "flex", gap: 8 }}>
          {PROFILE_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => actualizar("tipos", toggleEnArray(filtros.tipos, p.value))}
              aria-pressed={filtros.tipos.includes(p.value)}
              className={`pill-select ${filtros.tipos.includes(p.value) ? "active" : ""}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Bloque>

      <div className="filtro-bloque">
        <MultiSelectChips
          label="Isla"
          options={ISLANDS}
          selected={filtros.islas}
          onChange={(v) => actualizar("islas", v)}
          modo="resumen"
          textoVacio="Todas las islas"
          textoResumen={(n) => `${n} isla${n === 1 ? "" : "s"} seleccionada${n === 1 ? "" : "s"}`}
        />
      </div>

      <Bloque titulo="Edad">
        <div style={{ display: "flex", gap: 10 }}>
          <label style={{ flex: 1 }}>
            <span className="label-field">De</span>
            <input
              type="number"
              min={18}
              max={99}
              value={filtros.edadMin}
              onChange={(e) => actualizar("edadMin", e.target.value)}
              className="input-field"
              placeholder="18"
            />
          </label>
          <label style={{ flex: 1 }}>
            <span className="label-field">Hasta</span>
            <input
              type="number"
              min={18}
              max={99}
              value={filtros.edadMax}
              onChange={(e) => actualizar("edadMax", e.target.value)}
              className="input-field"
              placeholder="99"
            />
          </label>
        </div>
      </Bloque>

      <Bloque titulo="Orientación">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ORIENTACION_OPTIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => actualizar("orientaciones", toggleEnArray(filtros.orientaciones, o))}
              aria-pressed={filtros.orientaciones.includes(o)}
              className={`fetiche-chip ${filtros.orientaciones.includes(o) ? "active" : ""}`}
            >
              {o}
            </button>
          ))}
        </div>
      </Bloque>

      <Bloque titulo="Qué buscan">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {LOOKING_FOR_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => actualizar("lookingFor", toggleEnArray(filtros.lookingFor, o.value))}
              aria-pressed={filtros.lookingFor.includes(o.value)}
              className={`fetiche-chip ${filtros.lookingFor.includes(o.value) ? "active" : ""}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Bloque>

      <Bloque titulo="Gustos en común">
        <button type="button" onClick={() => setGustosModalAbierto(true)} className="btn-outline-gold" style={{ width: "100%" }}>
          Seleccionar gustos
        </button>
        {filtros.feticheIds.size > 0 && (
          <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--gold)" }}>
            {filtros.feticheIds.size} gustos seleccionados
          </p>
        )}
      </Bloque>

      <button type="button" onClick={buscar} className="btn-gold" style={{ width: "100%", marginTop: 28 }}>
        Buscar
      </button>
      <button
        type="button"
        onClick={limpiarFiltros}
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          marginTop: 14,
          background: "none",
          border: "none",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--text-muted)",
          cursor: "pointer",
        }}
      >
        Limpiar filtros
      </button>
    </>
  );

  return (
    <main>
      <button
        type="button"
        className="buscar-filtros-toggle"
        onClick={() => setFiltrosAbiertosMovil(true)}
        aria-haspopup="dialog"
      >
        <Filter size={16} aria-hidden="true" />
        Filtros
      </button>

      {filtrosAbiertosMovil && (
        <Dialogo onCerrar={() => setFiltrosAbiertosMovil(false)} idTitulo="filtros-titulo" variante="hoja">
          <div className="buscar-hoja">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 id="filtros-titulo" className="widget-titulo">
                Filtros
              </h2>
              <button type="button" onClick={() => setFiltrosAbiertosMovil(false)} aria-label="Cerrar filtros" className="icon-btn">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {panelFiltros}
          </div>
        </Dialogo>
      )}

      <div className="buscar-layout">
        <aside className="buscar-sidebar" aria-label="Filtros">
          <h2 className="widget-titulo">Buscar perfiles</h2>
          {panelFiltros}
        </aside>

        <section style={{ padding: "24px" }}>
          {perfiles.length === 0 && !cargando ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", textAlign: "center", padding: "60px 0" }}>
              No se encontraron perfiles con estos filtros.
            </p>
          ) : (
            <div className="resultados-grid">
              {perfiles.map((p) => (
                <TarjetaPerfil key={p.id} perfil={p} />
              ))}
            </div>
          )}

          {cargando && (
            <p style={{ marginTop: 24, textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
              Cargando…
            </p>
          )}

          {!cargando && hasMore && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <button type="button" onClick={cargarMas} className="btn-outline-gold">
                Cargar más
              </button>
            </div>
          )}
        </section>
      </div>

      {gustosModalAbierto && (
        <GustosModal
          seleccionInicial={filtros.feticheIds}
          onCerrar={() => setGustosModalAbierto(false)}
          onGuardar={onGuardarGustos}
        />
      )}
    </main>
  );
}

function Bloque({ titulo, children }) {
  return (
    <div className="filtro-bloque">
      <p className="filtro-bloque__titulo">{titulo}</p>
      {children}
    </div>
  );
}

function TarjetaPerfil({ perfil }) {
  const src = avatarSrc(perfil.id, perfil.filename, perfil.profile_type);

  return (
    <Link
      href={`/perfil/${perfil.nick}`}
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "3 / 4",
        overflow: "hidden",
        border: "1px solid var(--rule)",
        textDecoration: "none",
      }}
    >
      <Image sizes="(max-width: 639px) 50vw, (max-width: 999px) 33vw, 25vw"
        src={src}
        alt=""
        fill
        unoptimized={false}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{ objectFit: "cover" }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, transparent 50%, var(--veil-solid) 100%)",
          pointerEvents: "none",
        }}
      />

      {(mostrarPuntoOnline(perfil) || perfil.badge_especial || perfil.is_demo) && (
        <div className="tarjeta-perfil__marcas">
          {mostrarPuntoOnline(perfil) && <span className="tarjeta-perfil__online" aria-label="En línea" />}
          <UsuarioBadge
            badgeEspecial={perfil.badge_especial}
            isDemo={perfil.is_demo}
            style={{ position: "static", border: "none" }}
          />
        </div>
      )}

      {perfil.verified && <span className="tarjeta-perfil__verificado">Verificado</span>}

      <div className="tarjeta-perfil__pie">
        <p className="tarjeta-perfil__nick">{perfil.nick}</p>
        <p className="tarjeta-perfil__meta">
          {[PROFILE_TYPE_LABEL[perfil.profile_type], ISLAND_LABEL[perfil.island]].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}

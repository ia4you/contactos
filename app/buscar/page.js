"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Filter } from "lucide-react";
import { DemoBadge } from "../components/DemoBadge";
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

  return (
    <main>
      <button
        type="button"
        className="buscar-filtros-toggle"
        onClick={() => setFiltrosAbiertosMovil((v) => !v)}
        style={{
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "16px 24px",
          background: "var(--bg-secondary)",
          border: "none",
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

      <div className="buscar-layout">
        <aside
          className={`buscar-sidebar ${filtrosAbiertosMovil ? "" : "buscar-sidebar--cerrado"}`}
          style={{
            background: "var(--bg-secondary)",
            borderRight: "1px solid rgba(201,161,90,0.18)",
            padding: "24px",
          }}
        >
          <p className="kicker">Buscar perfiles</p>

          <Bloque titulo="Tipo de perfil">
            <div style={{ display: "flex", gap: 8 }}>
              {PROFILE_TYPES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => actualizar("tipos", toggleEnArray(filtros.tipos, p.value))}
                  className={`pill-select ${filtros.tipos.includes(p.value) ? "active" : ""}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Bloque>

          <div style={{ marginTop: 28 }}>
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
              <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--gold)" }}>
                {filtros.feticheIds.size} gustos seleccionados
              </p>
            )}
          </Bloque>

          <button type="button" onClick={buscar} className="btn-gold" style={{ width: "100%", marginTop: 32 }}>
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
              fontSize: 12.5,
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            Limpiar filtros
          </button>
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
    <div style={{ marginTop: 28 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: "var(--text-secondary)",
          marginBottom: 12,
        }}
      >
        {titulo}
      </p>
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
        border: "1px solid rgba(201,161,90,0.2)",
        textDecoration: "none",
      }}
    >
      <Image
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
          background: "linear-gradient(180deg, transparent 50%, rgba(14,10,11,0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      {perfil.is_demo && <DemoBadge style={{ bottom: 8, right: 8, fontSize: 9 }} />}

      {mostrarPuntoOnline(perfil) && (
        <span
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#4ade80",
            border: "2px solid var(--bg)",
          }}
        />
      )}

      {perfil.verified && (
        <span
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            fontFamily: "var(--font-body)",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: 1,
            padding: "3px 7px",
            background: "var(--gold)",
            color: "var(--bg)",
          }}
        >
          Verificado
        </span>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px" }}>
        <p className="heading" style={{ fontSize: 18, color: "var(--text)" }}>
          {perfil.nick}
        </p>
        <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1,
              padding: "2px 6px",
              border: "1px solid var(--gold)",
              color: "var(--gold)",
            }}
          >
            {ISLAND_LABEL[perfil.island]}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1,
              padding: "2px 6px",
              border: "1px solid rgba(244,234,217,0.3)",
              color: "var(--text)",
            }}
          >
            {PROFILE_TYPE_LABEL[perfil.profile_type]}
          </span>
        </div>
      </div>
    </Link>
  );
}

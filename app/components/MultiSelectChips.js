"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

function normalizar(opcion) {
  return typeof opcion === "object" && opcion !== null
    ? { value: opcion.value, label: opcion.label }
    : { value: opcion, label: opcion };
}

// modo "chips" (por defecto): control cerrado muestra cada seleccionado como
// chip individual con X, y respeta un máximo de selecciones (usado en
// género/orientación/rol, con opciones como strings planos).
// modo "resumen": control cerrado muestra un texto resumen ("Todas las
// islas" / "N islas seleccionadas") en vez de chips, sin límite salvo que
// se pase `max` explícitamente. Acepta opciones como strings o como
// {value, label}.
export function MultiSelectChips({
  label,
  options,
  selected,
  onChange,
  max,
  modo = "chips",
  textoVacio = "Selecciona…",
  textoResumen,
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const opcionesNormalizadas = options.map(normalizar);

  useEffect(() => {
    function onClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  function toggle(valor) {
    if (selected.includes(valor)) {
      onChange(selected.filter((v) => v !== valor));
    } else if (!max || selected.length < max) {
      onChange([...selected, valor]);
    }
  }

  function quitar(valor) {
    onChange(selected.filter((v) => v !== valor));
  }

  const etiquetaPorValor = Object.fromEntries(opcionesNormalizadas.map((o) => [o.value, o.label]));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <span className="label-field">
        {label} {modo === "chips" && max && <span style={{ opacity: 0.6 }}>(máx. {max})</span>}
      </span>

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="input-field"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minHeight: 48,
          height: "auto",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {modo === "resumen" ? (
          <span style={{ color: selected.length === 0 ? "var(--text-muted)" : "var(--text)" }}>
            {selected.length === 0
              ? textoVacio
              : textoResumen
                ? textoResumen(selected.length)
                : `${selected.length} seleccionados`}
          </span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
            {selected.length === 0 ? (
              <span style={{ color: "var(--text-muted)" }}>{textoVacio}</span>
            ) : (
              selected.map((valor) => (
                <span
                  key={valor}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--gold)",
                    color: "var(--bg)",
                    fontSize: 12,
                    padding: "4px 8px",
                  }}
                >
                  {etiquetaPorValor[valor] ?? valor}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      quitar(valor);
                    }}
                    style={{ display: "flex", cursor: "pointer" }}
                  >
                    <X size={12} />
                  </span>
                </span>
              ))
            )}
          </div>
        )}
        <ChevronDown size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
      </button>

      {abierto && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 30,
            background: "var(--surface)",
            border: "1px solid var(--border-gold)",
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {opcionesNormalizadas.map(({ value, label: etiqueta }) => {
            const marcado = selected.includes(value);
            const deshabilitado = !marcado && !!max && selected.length >= max;
            return (
              <button
                key={value}
                type="button"
                onClick={() => !deshabilitado && toggle(value)}
                disabled={deshabilitado}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  background: marcado ? "rgba(201,161,90,0.15)" : "transparent",
                  color: deshabilitado ? "var(--text-muted)" : marcado ? "var(--gold)" : "var(--text)",
                  border: "none",
                  cursor: deshabilitado ? "not-allowed" : "pointer",
                  opacity: deshabilitado ? 0.5 : 1,
                }}
              >
                {marcado ? "✓ " : ""}
                {etiqueta}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

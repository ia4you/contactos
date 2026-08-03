"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export function MultiSelectChips({ label, options, selected, onChange, max }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  function toggle(opcion) {
    if (selected.includes(opcion)) {
      onChange(selected.filter((o) => o !== opcion));
    } else if (selected.length < max) {
      onChange([...selected, opcion]);
    }
  }

  function quitar(opcion) {
    onChange(selected.filter((o) => o !== opcion));
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <span className="label-field">
        {label} <span style={{ opacity: 0.6 }}>(máx. {max})</span>
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
          {selected.length === 0 ? (
            <span style={{ color: "var(--text-muted)" }}>Selecciona…</span>
          ) : (
            selected.map((opcion) => (
              <span
                key={opcion}
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
                {opcion}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    quitar(opcion);
                  }}
                  style={{ display: "flex", cursor: "pointer" }}
                >
                  <X size={12} />
                </span>
              </span>
            ))
          )}
        </div>
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
          {options.map((opcion) => {
            const marcado = selected.includes(opcion);
            const deshabilitado = !marcado && selected.length >= max;
            return (
              <button
                key={opcion}
                type="button"
                onClick={() => !deshabilitado && toggle(opcion)}
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
                {opcion}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

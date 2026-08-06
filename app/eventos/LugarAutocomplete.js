"use client";

import { useEffect, useRef, useState } from "react";

export function LugarAutocomplete({ value, onChange }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const debounceRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    function onClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function onInputChange(e) {
    const texto = e.target.value;
    onChange(texto);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Sin key configurada en el servidor, o texto insuficiente: input
    // normal, sin intentar autocompletar.
    if (!disponible || texto.trim().length < 3) {
      setSugerencias([]);
      setAbierto(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/lugares?q=${encodeURIComponent(texto.trim())}`);
      const data = await res.json().catch(() => null);
      if (!data) return;

      if (!data.disponible) {
        // Fallback silencioso: dejamos de intentarlo el resto de la sesión.
        setDisponible(false);
        setSugerencias([]);
        setAbierto(false);
        return;
      }

      setSugerencias(data.sugerencias || []);
      setAbierto((data.sugerencias || []).length > 0);
    }, 300);
  }

  function seleccionar(sug) {
    onChange(sug.descripcion);
    setSugerencias([]);
    setAbierto(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={onInputChange}
        className="input-field"
        placeholder="Opcional"
        autoComplete="off"
      />

      {abierto && sugerencias.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 30,
            background: "var(--surface)",
            border: "1px solid var(--border-gold)",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {sugerencias.map((s) => (
            <button
              key={s.placeId}
              type="button"
              onClick={() => seleccionar(s)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                background: "transparent",
                color: "var(--text)",
                border: "none",
                borderBottom: "1px solid rgba(201,161,90,0.1)",
                cursor: "pointer",
              }}
            >
              {s.descripcion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

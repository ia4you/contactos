"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Diálogo modal accesible: role="dialog" + aria-modal, foco atrapado dentro,
// Escape y clic en el fondo cierran, y al cerrar el foco vuelve a donde
// estaba. variante="hoja" lo ancla abajo a todo el ancho (hoja inferior).
// Se pinta en <body> (portal) para que ningún contexto de apilamiento del
// padre (menús desplegables, cabeceras sticky) lo deje por debajo. Solo se
// monta tras una interacción o un efecto, nunca en el SSR.
export function Dialogo({ onCerrar, etiqueta, idTitulo, variante, className = "", children }) {
  const ref = useRef(null);
  const onCerrarRef = useRef(onCerrar);
  onCerrarRef.current = onCerrar;

  useEffect(() => {
    const previo = document.activeElement;
    const nodo = ref.current;
    (nodo.querySelector("[autofocus]") || nodo.querySelector(ENFOCABLES) || nodo).focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e) {
      // Con diálogos anidados (p. ej. gustos sobre la hoja de filtros) solo
      // responde el de encima, que es el último portal añadido a <body>.
      const fondos = document.querySelectorAll(".dialogo-fondo");
      if (fondos[fondos.length - 1] !== nodo.parentElement) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onCerrarRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const lista = [...nodo.querySelectorAll(ENFOCABLES)].filter((el) => el.offsetParent !== null);
      if (lista.length === 0) {
        e.preventDefault();
        return;
      }
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
      if (previo && typeof previo.focus === "function") previo.focus();
    };
  }, []);

  const hoja = variante === "hoja";
  return createPortal(
    <div
      className={`dialogo-fondo${hoja ? " dialogo-fondo--hoja" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={idTitulo ? undefined : etiqueta}
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={`dialogo${hoja ? " dialogo--hoja" : ""} ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

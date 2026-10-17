"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Dialogo } from "./Dialogo";

const ConfirmarContext = createContext(null);

// Sustituye a window.confirm por un diálogo propio y accesible:
//   const confirmar = useConfirmar();
//   if (!(await confirmar({ mensaje: "¿Eliminar…?", accion: "Eliminar" }))) return;
export function ConfirmarProvider({ children }) {
  const [peticion, setPeticion] = useState(null);

  const confirmar = useCallback(
    (opciones) =>
      new Promise((resolve) => {
        setPeticion({ accion: "Aceptar", peligro: true, ...opciones, resolve });
      }),
    []
  );

  function responder(valor) {
    peticion.resolve(valor);
    setPeticion(null);
  }

  return (
    <ConfirmarContext.Provider value={confirmar}>
      {children}
      {peticion && (
        <Dialogo onCerrar={() => responder(false)} idTitulo="confirmar-titulo">
          <p id="confirmar-titulo" className="heading" style={{ fontSize: 22 }}>
            {peticion.mensaje}
          </p>
          {peticion.detalle && (
            <p style={{ marginTop: 10, fontSize: 14, color: "var(--text-secondary)" }}>{peticion.detalle}</p>
          )}
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 10 }}>
            <button type="button" className="btn-outline-gold" onClick={() => responder(false)} autoFocus>
              Cancelar
            </button>
            <button
              type="button"
              className={`btn-outline-gold${peticion.peligro ? " btn-peligro" : ""}`}
              onClick={() => responder(true)}
            >
              {peticion.accion}
            </button>
          </div>
        </Dialogo>
      )}
    </ConfirmarContext.Provider>
  );
}

export function useConfirmar() {
  const confirmar = useContext(ConfirmarContext);
  // Fuera del provider (no debería ocurrir) se cae al confirm nativo.
  return confirmar || ((o) => Promise.resolve(window.confirm(o.mensaje)));
}

"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Dialogo } from "./Dialogo";

const TEXTO_MODAL =
  "Tu privacidad y seguridad son una prioridad para nosotros. Te recomendamos no compartir datos " +
  "personales, bancarios ni de contacto (teléfono, dirección, cuentas de pago) con otros miembros " +
  "hasta que exista una confianza mutua establecida. Ninguna solicitud de dinero, transferencia o dato " +
  "bancario es legítima dentro de esta comunidad. Si algún miembro te lo solicita, repórtalo de inmediato.";

function claveVisto(usuarioId) {
  return `aviso-seguridad-mensajes:${usuarioId}`;
}

// Banner discreto y permanente en la cabecera de /mensajes.
export function AvisoSeguridadBanner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 20px",
        background: "rgba(122, 46, 63, 0.14)",
        borderBottom: "1px solid var(--rule)",
        flexShrink: 0,
      }}
    >
      <Lock size={14} aria-hidden="true" style={{ flexShrink: 0, color: "var(--gold)" }} />
      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)", margin: 0 }}>
        Por tu seguridad: nunca compartas datos personales, bancarios ni de pago con otros miembros.
        Ninguna solicitud de dinero es legítima dentro de esta comunidad.
      </p>
    </div>
  );
}

// Modal que se muestra solo la primera vez que el usuario entra a /mensajes
// en este navegador; el aviso ya visto se recuerda en localStorage por
// usuarioId, sin necesidad de tocar la BD.
export function AvisoSeguridadModal({ usuarioId }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!usuarioId) return;
    try {
      if (!localStorage.getItem(claveVisto(usuarioId))) setVisible(true);
    } catch {
      // localStorage no disponible (modo privado, etc.): no mostramos el
      // modal para no bloquear la vista.
    }
  }, [usuarioId]);

  function cerrar() {
    setVisible(false);
    try {
      localStorage.setItem(claveVisto(usuarioId), "1");
    } catch {
      // Si no se puede persistir, el modal podría repetirse en la próxima
      // visita; preferible a romper el cierre del aviso.
    }
  }

  if (!visible) return null;

  return (
    <Dialogo onCerrar={cerrar} idTitulo="aviso-seguridad-titulo" className="dialogo--aviso">
        <h3 id="aviso-seguridad-titulo" className="heading" style={{ fontSize: 22, color: "var(--text)", marginBottom: 14 }}>
          Tu seguridad, primero
        </h3>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          {TEXTO_MODAL}
        </p>
        <button type="button" onClick={cerrar} className="btn-gold" style={{ marginTop: 20, width: "100%" }}>
          Entendido
        </button>
    </Dialogo>
  );
}

"use client";

import { useState } from "react";
import { Toggle } from "../components/Toggle";

const OPCIONES = [
  { id: "visitas", label: "Notificarme cuando alguien visita mi perfil" },
  { id: "likes", label: "Notificarme cuando recibo un like" },
  { id: "matches", label: "Notificarme cuando hay un match" },
  { id: "mensajes", label: "Notificarme cuando recibo un mensaje" },
];

export function TabNotificaciones() {
  const [valores, setValores] = useState({ visitas: true, likes: true, matches: true, mensajes: true });

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Notificaciones
      </h2>

      <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
        Las notificaciones por email se activarán próximamente.
      </p>

      <div style={{ marginTop: 16, borderTop: "1px solid rgba(201,161,90,0.12)" }}>
        {OPCIONES.map((o) => (
          <div key={o.id} style={{ borderBottom: "1px solid rgba(201,161,90,0.12)" }}>
            <Toggle
              checked={valores[o.id]}
              onChange={(v) => setValores((prev) => ({ ...prev, [o.id]: v }))}
              label={o.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

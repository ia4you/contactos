"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function MensajesIcono() {
  const [contador, setContador] = useState(0);

  useEffect(() => {
    function cargar() {
      fetch("/api/mensajes/contador")
        .then((r) => r.json())
        .then((d) => setContador(d.noLeidos || 0))
        .catch(() => {});
    }
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <Link href="/mensajes" aria-label="Mensajes" className="icon-btn" style={{ position: "relative" }}>
      <MessageCircle size={20} />
      {contador > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 15,
            height: 15,
            borderRadius: 8,
            background: "#c94b4b",
            color: "#fff",
            fontSize: 9,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
          }}
        >
          {contador > 9 ? "9+" : contador}
        </span>
      )}
    </Link>
  );
}

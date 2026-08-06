"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

export function VisitasIcono() {
  const [contador, setContador] = useState(0);

  useEffect(() => {
    function cargar() {
      fetch("/api/visitas/contador")
        .then((r) => r.json())
        .then((d) => setContador(d.nuevas || 0))
        .catch(() => {});
    }
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <Link href="/visitas" aria-label="Visitas" className="icon-btn" style={{ position: "relative" }}>
      <Eye size={20} />
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

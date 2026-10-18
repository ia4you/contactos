"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirmar } from "./Confirmar";

export function BlockButton({ blockedId, label, className, style }) {
  const confirmar = useConfirmar();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function bloquear() {
    const confirmado = await confirmar({
      mensaje: "¿Bloquear a este usuario?",
      detalle: "No podréis veros los perfiles ni aparecer en las búsquedas del otro.",
      accion: "Bloquear",
    });
    if (!confirmado) return;

    setEnviando(true);
    const res = await fetch("/api/bloques", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked_id: blockedId }),
    });
    setEnviando(false);

    if (res.ok) router.push("/buscar");
  }

  return (
    <button type="button" onClick={bloquear} disabled={enviando} className={className} style={style}>
      {enviando ? "Bloqueando…" : label}
    </button>
  );
}

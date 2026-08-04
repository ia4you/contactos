"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BlockButton({ blockedId, label, className, style }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  async function bloquear() {
    const confirmado = window.confirm(
      "¿Seguro que quieres bloquear a este usuario? No podréis veros los perfiles ni aparecer en las búsquedas del otro."
    );
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

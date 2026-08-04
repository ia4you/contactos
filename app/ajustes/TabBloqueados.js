"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AVATAR_PLACEHOLDER } from "@/lib/constants";

export function TabBloqueados() {
  const [bloqueados, setBloqueados] = useState(null);

  useEffect(() => {
    fetch("/api/bloques")
      .then((r) => r.json())
      .then((d) => setBloqueados(d.bloqueados))
      .catch(() => setBloqueados([]));
  }, []);

  async function desbloquear(id) {
    setBloqueados((lista) => lista.filter((u) => u.id !== id));
    await fetch(`/api/bloques/${id}`, { method: "DELETE" });
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Bloqueados
      </h2>

      {bloqueados === null ? (
        <p style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          Cargando…
        </p>
      ) : bloqueados.length === 0 ? (
        <p style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          No has bloqueado a ningún usuario.
        </p>
      ) : (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {bloqueados.map((u) => {
            const src = u.filename ? `/uploads/${u.id}/${u.filename}` : AVATAR_PLACEHOLDER[u.profile_type];
            return (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 14px",
                  border: "1px solid rgba(201,161,90,0.18)",
                }}
              >
                <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                </div>
                <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)" }}>
                  {u.nick}
                </span>
                <button
                  type="button"
                  onClick={() => desbloquear(u.id)}
                  className="btn-outline-gold"
                  style={{ padding: "8px 16px", fontSize: 11 }}
                >
                  Desbloquear
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

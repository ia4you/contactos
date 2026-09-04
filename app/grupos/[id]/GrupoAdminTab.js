"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { avatarSrc } from "@/lib/constants";

export function GrupoAdminTab({ grupoId, usuarioId, miembros, onMiembroExpulsado }) {
  const [expulsando, setExpulsando] = useState(null);
  const [error, setError] = useState("");

  async function expulsar(m) {
    if (!window.confirm(`¿Expulsar a ${m.nick} del grupo?`)) return;
    setError("");
    setExpulsando(m.id);
    const res = await fetch(`/api/grupos/${grupoId}/miembros/${m.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setExpulsando(null);
    if (!res.ok) {
      setError(data?.error || "No se pudo expulsar al miembro.");
      return;
    }
    onMiembroExpulsado(m.id);
  }

  return (
    <div style={{ padding: "24px 0" }}>
      <p className="kicker" style={{ letterSpacing: 2, marginBottom: 16 }}>Gestión de miembros</p>

      {error && <p style={{ marginBottom: 14, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {miembros.map((m) => {
          const src = avatarSrc(m.id, m.avatar_filename, m.profile_type);
          return (
            <div
              key={m.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid rgba(201,161,90,0.15)" }}
            >
              <Link href={`/perfil/${m.nick}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <div style={{ position: "relative", width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text)" }}>{m.nick}</span>
                {m.rol === "admin" && (
                  <span className="badge-gold" style={{ fontSize: 9, padding: "2px 7px" }}>Admin</span>
                )}
              </Link>

              {String(m.id) !== String(usuarioId) && (
                <button
                  type="button"
                  onClick={() => expulsar(m)}
                  disabled={expulsando === m.id}
                  className="btn-outline-gold"
                  style={{ borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a", fontSize: 11, padding: "6px 12px", flexShrink: 0 }}
                >
                  {expulsando === m.id ? "Expulsando…" : "Expulsar"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

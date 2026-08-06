"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ISLANDS } from "@/lib/constants";
import { Users } from "lucide-react";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

export function GruposShell() {
  const router = useRouter();
  const [grupos, setGrupos] = useState(null);
  const [uniendose, setUniendose] = useState(null);

  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((d) => setGrupos(d.grupos || []))
      .catch(() => setGrupos([]));
  }, []);

  async function unirse(id) {
    setUniendose(id);
    const res = await fetch(`/api/grupos/${id}/unirse`, { method: "POST" });
    setUniendose(null);
    if (res.ok) router.push(`/grupos/${id}`);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="kicker">Comunidad</p>
      <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
        Grupos
      </h1>

      <div style={{ marginTop: 32 }}>
        {grupos === null ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
        ) : (
          grupos.map((g) => (
            <div
              key={g.id}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid rgba(201,161,90,0.12)" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: "var(--surface)",
                  border: "1px solid var(--border-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gold)",
                }}
              >
                <Users size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="heading" style={{ fontSize: 17, color: "var(--text)" }}>{g.nombre}</span>
                  {g.isla && <span className="badge-gold" style={{ fontSize: 9 }}>{ISLAND_LABEL[g.isla]}</span>}
                </div>
                <p style={{ marginTop: 3, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
                  {g.miembros_count} miembro{g.miembros_count === 1 ? "" : "s"}
                  {g.ultimo_mensaje && ` · ${g.ultimo_mensaje}`}
                </p>
              </div>
              {g.soy_miembro ? (
                <Link href={`/grupos/${g.id}`} className="btn-outline-gold" style={{ fontSize: 11, padding: "8px 16px", flexShrink: 0 }}>
                  Entrar
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => unirse(g.id)}
                  disabled={uniendose === g.id}
                  className="btn-gold"
                  style={{ fontSize: 11, padding: "8px 16px", flexShrink: 0 }}
                >
                  {uniendose === g.id ? "Uniéndome…" : "Unirme"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

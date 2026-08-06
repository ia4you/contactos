"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { CrearGrupoModal } from "./CrearGrupoModal";

export function MisGruposSidebar() {
  const [grupos, setGrupos] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((d) => setGrupos((d.grupos || []).filter((g) => g.soy_miembro)))
      .catch(() => setGrupos([]));
  }, []);

  function onCreado(grupo) {
    setModalAbierto(false);
    setGrupos((prev) => [{ ...grupo, miembros_count: 1, soy_miembro: true }, ...(prev || [])]);
  }

  return (
    <div>
      <p className="kicker" style={{ letterSpacing: 3 }}>Mis grupos</p>

      <div style={{ marginTop: 14 }}>
        {grupos === null ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>Cargando…</p>
        ) : grupos.length === 0 ? (
          <>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>Únete a un grupo</p>
            <Link href="/grupos" className="btn-outline-gold" style={{ marginTop: 10, display: "inline-block", fontSize: 11, padding: "7px 14px" }}>
              Ver grupos
            </Link>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {grupos.map((g) => (
              <Link
                key={g.id}
                href={`/grupos/${g.id}`}
                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
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
                  <Users size={14} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-body)",
                      fontSize: 12.5,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.nombre}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-muted)" }}>
                    {g.miembros_count} miembro{g.miembros_count === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href="/grupos" className="btn-outline-gold" style={{ fontSize: 11, padding: "7px 14px", textAlign: "center" }}>
          Ver todos
        </Link>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="btn-outline-gold"
          style={{ fontSize: 11, padding: "7px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Plus size={13} />
          Crear grupo
        </button>
      </div>

      {modalAbierto && <CrearGrupoModal onClose={() => setModalAbierto(false)} onCreado={onCreado} />}
    </div>
  );
}

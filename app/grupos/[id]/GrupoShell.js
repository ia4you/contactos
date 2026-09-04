"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GrupoAcercaDeTab } from "./GrupoAcercaDeTab";
import { GrupoDebatesTab } from "./GrupoDebatesTab";
import { GrupoMiembrosTab } from "./GrupoMiembrosTab";
import { GrupoAdminTab } from "./GrupoAdminTab";

export function GrupoShell({ grupoId, usuarioId }) {
  const router = useRouter();
  const [grupo, setGrupo] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [tab, setTab] = useState("acerca");
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    fetch(`/api/grupos/${grupoId}`)
      .then((r) => r.json())
      .then((d) => {
        setGrupo(d.grupo);
        setMiembros(d.miembros || []);
      })
      .catch(() => {});
  }, [grupoId]);

  async function eliminarGrupo() {
    if (!window.confirm("¿Eliminar este grupo? Se borrarán también sus debates y la lista de miembros. Esta acción no se puede deshacer.")) return;
    setEliminando(true);
    const res = await fetch(`/api/grupos/${grupoId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/grupos");
      return;
    }
    setEliminando(false);
  }

  function onGrupoActualizado(nuevo) {
    setGrupo((g) => ({ ...g, ...nuevo }));
  }

  function onMiembroExpulsado(userId) {
    setMiembros((prev) => prev.filter((m) => String(m.id) !== String(userId)));
    setGrupo((g) => (g ? { ...g, miembros_count: g.miembros_count - 1 } : g));
  }

  if (!grupo) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
      </div>
    );
  }

  const soyAdmin = grupo.mi_rol === "admin";

  const tabs = [
    { id: "acerca", label: "Acerca de y normas" },
    { id: "debates", label: "Debates" },
    { id: "miembros", label: "Miembros" },
    ...(soyAdmin ? [{ id: "admin", label: "Admin" }] : []),
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
      <div
        style={{
          padding: "24px 0 18px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1 className="heading" style={{ fontSize: 24, color: "var(--text)" }}>{grupo.nombre}</h1>
          <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
            {grupo.miembros_count} miembros
          </p>
        </div>
        {String(grupo.creador_id) === String(usuarioId) && (
          <button
            type="button"
            onClick={eliminarGrupo}
            disabled={eliminando}
            className="btn-outline-gold"
            style={{ borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a", fontSize: 11, padding: "8px 14px", flexShrink: 0 }}
          >
            {eliminando ? "Eliminando…" : "Eliminar grupo"}
          </button>
        )}
      </div>

      <div className="tab-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`tab-nav-item ${tab === t.id ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "acerca" && (
        <GrupoAcercaDeTab grupoId={grupoId} grupo={grupo} soyAdmin={soyAdmin} onGrupoActualizado={onGrupoActualizado} />
      )}
      {tab === "debates" && (
        <GrupoDebatesTab grupoId={grupoId} usuarioId={usuarioId} soyMiembro={grupo.soy_miembro} />
      )}
      {tab === "miembros" && <GrupoMiembrosTab miembros={miembros} />}
      {tab === "admin" && soyAdmin && (
        <GrupoAdminTab grupoId={grupoId} usuarioId={usuarioId} miembros={miembros} onMiembroExpulsado={onMiembroExpulsado} />
      )}
    </div>
  );
}

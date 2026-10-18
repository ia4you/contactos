"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ISLANDS, PROFILE_TYPES } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { useConfirmar } from "../components/Confirmar";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

export function AdminUsuarios() {
  const confirmar = useConfirmar();
  const [usuarios, setUsuarios] = useState(null);

  function cargar() {
    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((d) => setUsuarios(d.usuarios || []))
      .catch(() => setUsuarios([]));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function suspender(id, nick) {
    if (!(await confirmar({ mensaje: `¿Suspender la cuenta de ${nick}?`, detalle: "Esto es un soft-delete (deleted_at).", accion: "Suspender" }))) return;
    const res = await fetch(`/api/admin/usuarios/${id}/suspender`, { method: "PATCH" });
    if (res.ok) cargar();
    else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "No se pudo suspender.");
    }
  }

  if (usuarios === null) {
    return <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rule)" }}>
            {["Nick", "Isla", "Tipo", "Alta", "Última act.", "Fotos", "Estado", ""].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid var(--rule)" }}>
              <td style={{ padding: "10px 12px", color: "var(--text)" }}>{u.nick}</td>
              <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{ISLAND_LABEL[u.island]}</td>
              <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{PROFILE_TYPE_LABEL[u.profile_type]}</td>
              <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{tiempoRelativo(u.created_at)}</td>
              <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{u.last_active ? tiempoRelativo(u.last_active) : "—"}</td>
              <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{u.fotos_count}</td>
              <td style={{ padding: "10px 12px" }}>
                {u.deleted_at ? (
                  <span style={{ color: "var(--danger)" }}>Suspendida</span>
                ) : u.role === "admin" ? (
                  <span style={{ color: "var(--gold)" }}>Admin</span>
                ) : (
                  <span style={{ color: "var(--online)" }}>Activa</span>
                )}
              </td>
              <td style={{ padding: "10px 12px", display: "flex", gap: 8 }}>
                <Link href={`/perfil/${u.nick}`} className="btn-outline-gold" style={{ fontSize: 12, padding: "5px 10px" }}>
                  Ver perfil
                </Link>
                {!u.deleted_at && u.role !== "admin" && (
                  <button
                    type="button"
                    onClick={() => suspender(u.id, u.nick)}
                    className="btn-outline-gold"
                    style={{ fontSize: 12, padding: "5px 10px", borderColor: "var(--danger-border)", color: "var(--danger)" }}
                  >
                    Suspender
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { tiempoRelativo } from "@/lib/tiempo";

export function AdminVerificacionEmail() {
  const [usuarios, setUsuarios] = useState(null);
  const [procesando, setProcesando] = useState(null);

  function cargar() {
    fetch("/api/admin/usuarios/sin-verificar")
      .then((r) => r.json())
      .then((d) => setUsuarios(d.usuarios || []))
      .catch(() => setUsuarios([]));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function verificar(id, nick) {
    if (!window.confirm(`¿Marcar el email de ${nick} como verificado manualmente?`)) return;
    setProcesando(id);
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/verificar-email`, { method: "PATCH" });
      if (res.ok) cargar();
      else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "No se pudo verificar.");
      }
    } finally {
      setProcesando(null);
    }
  }

  if (usuarios === null) {
    return <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>;
  }

  return (
    <div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 18 }}>
        Usuarios con email pendiente de verificar (excluye cuentas demo). Úsalo para casos donde el
        email de verificación no llega, por ejemplo el bloqueo conocido de Hotmail/Outlook.
      </p>

      {usuarios.length === 0 ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
          No hay ningún email pendiente de verificar.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,161,90,0.3)" }}>
                {["Nick", "Email", "Registro", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(201,161,90,0.1)" }}>
                  <td style={{ padding: "10px 12px", color: "var(--text)" }}>{u.nick}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{u.email}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{tiempoRelativo(u.created_at)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      type="button"
                      disabled={procesando === u.id}
                      onClick={() => verificar(u.id, u.nick)}
                      className="btn-outline-gold"
                      style={{ fontSize: 10, padding: "5px 10px" }}
                    >
                      {procesando === u.id ? "Verificando…" : "Verificar manualmente"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

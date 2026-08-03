"use client";

import { useState } from "react";
import { CATEGORIAS_DENUNCIA } from "@/lib/reportes";

export function ReportButton({ reportedUserId, label, className, style }) {
  const [abierto, setAbierto] = useState(false);
  const [categoria, setCategoria] = useState(CATEGORIAS_DENUNCIA[0]);
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  function cerrar() {
    setAbierto(false);
    setEnviado(false);
    setError("");
    setCategoria(CATEGORIAS_DENUNCIA[0]);
    setDetalle("");
  }

  async function enviar() {
    setEnviando(true);
    setError("");

    const res = await fetch("/api/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportedUserId, categoria, detalle }),
    });
    const data = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setError(data.error || "No se pudo enviar la denuncia.");
      return;
    }
    setEnviado(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={className}
        style={style}
      >
        {label}
      </button>

      {abierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(14,10,11,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrar();
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--surface)",
              border: "1px solid var(--border-gold)",
              padding: 28,
            }}
          >
            {enviado ? (
              <>
                <h3 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>
                  Denuncia enviada
                </h3>
                <p
                  style={{
                    marginTop: 16,
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                  }}
                >
                  Tu denuncia ha sido registrada. La revisaremos en 48 horas.
                </p>
                <button
                  type="button"
                  onClick={cerrar}
                  className="btn-gold"
                  style={{ marginTop: 24, width: "100%" }}
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <h3 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>
                  Denunciar perfil
                </h3>

                <label style={{ display: "block", marginTop: 18 }}>
                  <span className="label-field">Motivo</span>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="input-field"
                  >
                    {CATEGORIAS_DENUNCIA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                {categoria === "Otro" && (
                  <label style={{ display: "block", marginTop: 16 }}>
                    <span className="label-field">Cuéntanos más</span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={detalle}
                      onChange={(e) => setDetalle(e.target.value)}
                      className="input-field"
                      style={{ resize: "none" }}
                    />
                  </label>
                )}

                {error && (
                  <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>
                    {error}
                  </p>
                )}

                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={cerrar}
                    disabled={enviando}
                    className="btn-outline-gold"
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={enviar}
                    disabled={enviando}
                    className="btn-gold"
                    style={{ flex: 1, opacity: enviando ? 0.6 : 1 }}
                  >
                    {enviando ? "Enviando…" : "Enviar denuncia"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

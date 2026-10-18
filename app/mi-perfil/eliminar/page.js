"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useConfirmar } from "../../components/Confirmar";

export default function EliminarCuenta() {
  const confirmar = useConfirmar();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const confirmado = await confirmar({
      mensaje: "¿Eliminar tu cuenta?",
      detalle: "Esta acción eliminará tu cuenta de forma irreversible.",
      accion: "Eliminar cuenta",
    });
    if (!confirmado) return;

    setEnviando(true);
    const res = await fetch("/api/perfil/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setEnviando(false);
      setError(data.error || "No se pudo eliminar la cuenta.");
      return;
    }

    await signOut({ callbackUrl: "/" });
  }

  return (
    <main style={{ minHeight: "60vh", display: "flex", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h1 className="heading" style={{ fontSize: 30, color: "var(--danger)" }}>
          Eliminar mi cuenta
        </h1>
        <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          Esta acción es irreversible. Tu perfil, fotos y datos asociados se
          eliminarán de forma definitiva conforme a nuestra{" "}
          <a href="/legal/privacidad" style={{ color: "var(--gold)" }}>
            política de privacidad
          </a>
          .
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 22 }}>
          <label>
            <span className="label-field">Confirma tu contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </label>

          {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--danger)" }}>{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            style={{
              width: "100%",
              padding: "16px",
              background: "#6b1524",
              color: "var(--text)",
              border: "none",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.04em",
              fontSize: 12,
              cursor: "pointer",
              opacity: enviando ? 0.6 : 1,
            }}
          >
            {enviando ? "Eliminando…" : "Eliminar mi cuenta definitivamente"}
          </button>
        </form>
      </div>
    </main>
  );
}

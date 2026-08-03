"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function RestablecerContrasena() {
  const router = useRouter();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);

    const res = await fetch("/api/auth/restablecer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setError(data.error || "No se pudo restablecer la contraseña.");
      return;
    }

    setExito(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (exito) {
    return (
      <main
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
          Contraseña actualizada
        </h1>
        <p style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          Redirigiendo a iniciar sesión…
        </p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "60vh", display: "flex", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
          Nueva contraseña
        </h1>

        <form onSubmit={onSubmit} style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 22 }}>
          <label>
            <span className="label-field">Contraseña nueva</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </label>

          {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}

          <button type="submit" disabled={enviando} className="btn-gold" style={{ width: "100%" }}>
            {enviando ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}

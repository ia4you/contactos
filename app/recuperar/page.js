"use client";

import { useState } from "react";

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    await fetch("/api/auth/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEnviando(false);
    setEnviado(true);
  }

  if (enviado) {
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
          Revisa tu email
        </h1>
        <p style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          Si existe una cuenta con ese email, te hemos enviado un enlace para
          restablecer tu contraseña.
        </p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "60vh", display: "flex", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
          Recuperar contraseña
        </h1>
        <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
          Te enviaremos un enlace a tu email para elegir una nueva contraseña.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 22 }}>
          <label>
            <span className="label-field">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </label>

          <button type="submit" disabled={enviando} className="btn-gold" style={{ width: "100%" }}>
            {enviando ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      </div>
    </main>
  );
}

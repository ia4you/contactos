"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthLayout } from "../components/AuthLayout";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificado = searchParams.get("verificado");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setEnviando(false);

    if (res?.error) {
      setError("Email, contraseña incorrectos o cuenta sin verificar.");
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <AuthLayout activo="login">
      <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
        Bienvenido de nuevo
      </h1>

      {verificado === "1" && (
        <p
          style={{
            marginTop: 16,
            padding: "10px 14px",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--gold)",
            border: "1px solid var(--border-gold)",
          }}
        >
          Email confirmado. Ya puedes iniciar sesión.
        </p>
      )}
      {verificado === "0" && (
        <p
          style={{
            marginTop: 16,
            padding: "10px 14px",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "#e07a7a",
            border: "1px solid rgba(154,58,58,0.4)",
          }}
        >
          El enlace de verificación no es válido o ha caducado.
        </p>
      )}

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
        <label>
          <span className="label-field">Contraseña</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </label>

        {error && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>
        )}

        <button type="submit" disabled={enviando} className="btn-gold" style={{ width: "100%" }}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-body)",
          fontSize: 12.5,
        }}
      >
        <a href="/recuperar" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </AuthLayout>
  );
}

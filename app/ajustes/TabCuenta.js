"use client";

import { useState } from "react";
import Link from "next/link";

export function TabCuenta({ usuario }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 56, maxWidth: 480 }}>
      <FormularioEmail emailActual={usuario.email} />
      <FormularioPassword />
      <ZonaPeligro />
    </div>
  );
}

function FormularioEmail({ emailActual }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function guardar(e) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    setMensaje("");

    const res = await fetch("/api/ajustes/cuenta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "email", currentPassword, newEmail }),
    });
    const data = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setError(data.error || "No se pudo cambiar el email.");
      return;
    }
    setMensaje("Hemos enviado un enlace de confirmación a tu nuevo email.");
    setCurrentPassword("");
    setNewEmail("");
  }

  return (
    <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Cambiar email
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
        Email actual: {emailActual}
      </p>

      <label>
        <span className="label-field">Nuevo email</span>
        <input
          type="email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="input-field"
        />
      </label>
      <label>
        <span className="label-field">Contraseña actual</span>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="input-field"
        />
      </label>

      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}
      {mensaje && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>{mensaje}</p>}

      <button type="submit" disabled={enviando} className="btn-outline-gold" style={{ alignSelf: "flex-start" }}>
        {enviando ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

function FormularioPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function guardar(e) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    setMensaje("");

    const res = await fetch("/api/ajustes/cuenta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "password", currentPassword, newPassword, repeatPassword }),
    });
    const data = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setError(data.error || "No se pudo cambiar la contraseña.");
      return;
    }
    setMensaje("Contraseña actualizada.");
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
  }

  return (
    <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
        Cambiar contraseña
      </h2>

      <label>
        <span className="label-field">Contraseña actual</span>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="input-field"
        />
      </label>
      <label>
        <span className="label-field">Contraseña nueva</span>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-field"
        />
      </label>
      <label>
        <span className="label-field">Repetir contraseña nueva</span>
        <input
          type="password"
          required
          minLength={8}
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          className="input-field"
        />
      </label>

      {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}
      {mensaje && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>{mensaje}</p>}

      <button type="submit" disabled={enviando} className="btn-outline-gold" style={{ alignSelf: "flex-start" }}>
        {enviando ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

function ZonaPeligro() {
  return (
    <div style={{ borderTop: "1px solid rgba(154,58,58,0.3)", paddingTop: 24 }}>
      <h2 className="heading" style={{ fontSize: 22, color: "#e07a7a" }}>
        Zona de peligro
      </h2>
      <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
        Eliminar tu cuenta es una acción irreversible.
      </p>
      <Link
        href="/mi-perfil/eliminar"
        style={{
          display: "inline-block",
          marginTop: 16,
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "#e07a7a",
          textDecoration: "underline",
        }}
      >
        Eliminar mi cuenta
      </Link>
    </div>
  );
}

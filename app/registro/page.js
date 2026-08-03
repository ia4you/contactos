"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ISLANDS,
  PROFILE_TYPES,
  LOOKING_FOR_OPTIONS,
  GENERO_OPTIONS,
  GENERO_MAX,
  ORIENTACION_OPTIONS,
  ORIENTACION_MAX,
  ROL_OPTIONS,
  ROL_MAX,
  FECHA_NACIMIENTO_MIN,
  FECHA_NACIMIENTO_MAX,
} from "@/lib/constants";
import { AuthLayout } from "../components/AuthLayout";
import { MultiSelectChips } from "../components/MultiSelectChips";

const ESTADO_INICIAL = {
  profileType: "chica",
  nick: "",
  genero: [],
  orientacion: [],
  rol: [],
  herBirthdate: "",
  hisBirthdate: "",
  island: ISLANDS[0].value,
  email: "",
  password: "",
  lookingFor: [],
  acceptTerms: false,
  acceptGdpr: false,
};

export default function Registro() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function toggleLookingFor(valor) {
    setForm((f) => ({
      ...f,
      lookingFor: f.lookingFor.includes(valor)
        ? f.lookingFor.filter((v) => v !== valor)
        : [...f.lookingFor, valor],
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo completar el registro.");
        return;
      }
      setExito(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <AuthLayout activo="registro">
        <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
          Revisa tu email
        </h1>
        <p style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          Te hemos enviado un enlace de confirmación. Debes verificar tu email
          antes de poder iniciar sesión.
        </p>
        <Link
          href="/login"
          style={{ display: "inline-block", marginTop: 24, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}
        >
          Ir a iniciar sesión
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout activo="registro">
      <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
        Crear cuenta
      </h1>
      <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
        Todos los campos son necesarios. Tus datos están protegidos.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 22 }}>
        {/* 1. Tipo de perfil */}
        <div>
          <span className="label-field">Tipo de perfil</span>
          <div style={{ display: "flex", gap: 8 }}>
            {PROFILE_TYPES.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => actualizar("profileType", p.value)}
                className={`pill-select ${form.profileType === p.value ? "active" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Apodo */}
        <label>
          <span className="label-field">Apodo (nick)</span>
          <input
            type="text"
            required
            minLength={3}
            maxLength={24}
            value={form.nick}
            onChange={(e) => actualizar("nick", e.target.value)}
            className="input-field"
          />
        </label>

        {/* 3. Género */}
        <MultiSelectChips
          label="Género"
          options={GENERO_OPTIONS}
          selected={form.genero}
          onChange={(v) => actualizar("genero", v)}
          max={GENERO_MAX}
        />

        {/* 4. Orientación */}
        <MultiSelectChips
          label="Orientación"
          options={ORIENTACION_OPTIONS}
          selected={form.orientacion}
          onChange={(v) => actualizar("orientacion", v)}
          max={ORIENTACION_MAX}
        />

        {/* 5. Rol */}
        <MultiSelectChips
          label="Rol"
          options={ROL_OPTIONS}
          selected={form.rol}
          onChange={(v) => actualizar("rol", v)}
          max={ROL_MAX}
        />

        {/* 6. Fecha de nacimiento */}
        {form.profileType === "pareja" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label>
              <span className="label-field">Nacimiento (ella)</span>
              <input
                type="date"
                required
                min={FECHA_NACIMIENTO_MIN}
                max={FECHA_NACIMIENTO_MAX}
                value={form.herBirthdate}
                onChange={(e) => actualizar("herBirthdate", e.target.value)}
                className="input-field"
              />
            </label>
            <label>
              <span className="label-field">Nacimiento (él)</span>
              <input
                type="date"
                required
                min={FECHA_NACIMIENTO_MIN}
                max={FECHA_NACIMIENTO_MAX}
                value={form.hisBirthdate}
                onChange={(e) => actualizar("hisBirthdate", e.target.value)}
                className="input-field"
              />
            </label>
          </div>
        ) : (
          <label>
            <span className="label-field">Fecha de nacimiento</span>
            <input
              type="date"
              required
              min={FECHA_NACIMIENTO_MIN}
              max={FECHA_NACIMIENTO_MAX}
              value={form.herBirthdate}
              onChange={(e) => actualizar("herBirthdate", e.target.value)}
              className="input-field"
            />
          </label>
        )}

        {/* 7. Isla */}
        <label>
          <span className="label-field">Isla</span>
          <select
            value={form.island}
            onChange={(e) => actualizar("island", e.target.value)}
            className="input-field"
          >
            {ISLANDS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </label>

        {/* 8. Email y contraseña */}
        <label>
          <span className="label-field">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => actualizar("email", e.target.value)}
            className="input-field"
          />
        </label>

        <label>
          <span className="label-field">Contraseña</span>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => actualizar("password", e.target.value)}
            className="input-field"
          />
        </label>

        {/* 9. Qué buscas */}
        <div>
          <span className="label-field">¿Qué buscas?</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {LOOKING_FOR_OPTIONS.map((o) => (
              <label
                key={o.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--text)",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.lookingFor.includes(o.value)}
                  onChange={() => toggleLookingFor(o.value)}
                  className="checkbox-gold"
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        {/* 10. Checkboxes RGPD */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingTop: 16,
            borderTop: "1px solid rgba(201,161,90,0.12)",
          }}
        >
          <label style={{ display: "flex", gap: 8, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
            <input
              type="checkbox"
              required
              checked={form.acceptTerms}
              onChange={(e) => actualizar("acceptTerms", e.target.checked)}
              className="checkbox-gold"
              style={{ marginTop: 2 }}
            />
            <span>
              Acepto los{" "}
              <Link href="/legal/aviso-legal" style={{ color: "var(--gold)" }}>
                términos
              </Link>{" "}
              y la{" "}
              <Link href="/legal/privacidad" style={{ color: "var(--gold)" }}>
                política de privacidad
              </Link>
              .
            </span>
          </label>
          <label style={{ display: "flex", gap: 8, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
            <input
              type="checkbox"
              required
              checked={form.acceptGdpr}
              onChange={(e) => actualizar("acceptGdpr", e.target.checked)}
              className="checkbox-gold"
              style={{ marginTop: 2 }}
            />
            <span>
              Consiento expresamente el tratamiento de mis datos relativos a la
              vida sexual conforme al art. 9.2.a del RGPD.
            </span>
          </label>
        </div>

        {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}

        <button type="submit" disabled={enviando} className="btn-gold" style={{ width: "100%" }}>
          {enviando ? "Creando cuenta…" : "Crear mi perfil"}
        </button>

        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)" }}>
          Tus datos están protegidos y nunca se comparten con terceros.
        </p>
      </form>
    </AuthLayout>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ISLANDS, PROFILE_TYPES, LOOKING_FOR_OPTIONS } from "@/lib/constants";

const ESTADO_INICIAL = {
  profileType: "chica",
  herBirthdate: "",
  hisBirthdate: "",
  nick: "",
  email: "",
  password: "",
  island: ISLANDS[0].value,
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
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-champan">Revisa tu email</h1>
        <p className="mt-4 text-sm text-[#F2EDE4]/70">
          Te hemos enviado un enlace de confirmación. Debes verificar tu email
          antes de poder iniciar sesión.
        </p>
        <Link href="/login" className="mt-8 text-sm text-champan underline underline-offset-4">
          Ir a iniciar sesión
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-champan">Crear mi perfil</h1>
      <p className="mt-2 text-sm text-[#F2EDE4]/60">
        Todos los campos son necesarios. Tus datos están protegidos.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-[#F2EDE4]/80">Tipo de perfil</legend>
          <div className="flex gap-2">
            {PROFILE_TYPES.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => actualizar("profileType", p.value)}
                className={`flex-1 rounded-full border px-3 py-2 text-sm transition ${
                  form.profileType === p.value
                    ? "border-burdeos bg-burdeos text-[#F2EDE4]"
                    : "border-champan/20 text-[#F2EDE4]/70"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>

        {form.profileType === "pareja" ? (
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Fecha de nacimiento (ella)">
              <input
                type="date"
                required
                value={form.herBirthdate}
                onChange={(e) => actualizar("herBirthdate", e.target.value)}
                className="campo"
              />
            </Campo>
            <Campo label="Fecha de nacimiento (él)">
              <input
                type="date"
                required
                value={form.hisBirthdate}
                onChange={(e) => actualizar("hisBirthdate", e.target.value)}
                className="campo"
              />
            </Campo>
          </div>
        ) : (
          <Campo label="Fecha de nacimiento">
            <input
              type="date"
              required
              value={form.herBirthdate}
              onChange={(e) => actualizar("herBirthdate", e.target.value)}
              className="campo"
            />
          </Campo>
        )}

        <Campo label="Nick">
          <input
            type="text"
            required
            minLength={3}
            maxLength={24}
            value={form.nick}
            onChange={(e) => actualizar("nick", e.target.value)}
            className="campo"
          />
        </Campo>

        <Campo label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => actualizar("email", e.target.value)}
            className="campo"
          />
        </Campo>

        <Campo label="Contraseña">
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => actualizar("password", e.target.value)}
            className="campo"
          />
        </Campo>

        <Campo label="Isla">
          <select
            value={form.island}
            onChange={(e) => actualizar("island", e.target.value)}
            className="campo"
          >
            {ISLANDS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </Campo>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-[#F2EDE4]/80">¿Qué buscas?</legend>
          <div className="grid grid-cols-2 gap-2">
            {LOOKING_FOR_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm text-[#F2EDE4]/80">
                <input
                  type="checkbox"
                  checked={form.lookingFor.includes(o.value)}
                  onChange={() => toggleLookingFor(o.value)}
                  className="h-4 w-4 accent-burdeos"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-3 border-t border-champan/15 pt-5">
          <label className="flex items-start gap-2 text-xs text-[#F2EDE4]/70">
            <input
              type="checkbox"
              required
              checked={form.acceptTerms}
              onChange={(e) => actualizar("acceptTerms", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-burdeos"
            />
            Acepto los{" "}
            <Link href="/legal/aviso-legal" className="underline">
              términos
            </Link>{" "}
            y la{" "}
            <Link href="/legal/privacidad" className="underline">
              política de privacidad
            </Link>
            .
          </label>
          <label className="flex items-start gap-2 text-xs text-[#F2EDE4]/70">
            <input
              type="checkbox"
              required
              checked={form.acceptGdpr}
              onChange={(e) => actualizar("acceptGdpr", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-burdeos"
            />
            Consiento expresamente el tratamiento de mis datos relativos a la
            vida sexual conforme al art. 9.2.a del RGPD.
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-full bg-burdeos px-6 py-3 font-body font-semibold text-[#F2EDE4] transition hover:bg-burdeos-light disabled:opacity-60"
        >
          {enviando ? "Creando cuenta…" : "Crear mi perfil"}
        </button>
      </form>
    </main>
  );
}

function Campo({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[#F2EDE4]/80">{label}</span>
      {children}
    </label>
  );
}

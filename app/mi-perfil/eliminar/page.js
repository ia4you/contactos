"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function EliminarCuenta() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const confirmado = window.confirm(
      "Esta acción eliminará tu cuenta de forma irreversible. ¿Seguro que quieres continuar?"
    );
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
    <main className="flex min-h-screen justify-center bg-fondo px-4 py-14">
      <div className="h-fit w-full max-w-[480px] rounded-xl border border-borde bg-surface p-8">
        <h1 className="font-display text-2xl font-semibold text-red-400">Eliminar mi cuenta</h1>
        <p className="mt-3 text-sm text-texto-secundario">
          Esta acción es irreversible. Tu perfil, fotos y datos asociados se
          eliminarán de forma definitiva conforme a nuestra{" "}
          <a href="/legal/privacidad" className="underline">
            política de privacidad
          </a>
          .
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-texto-secundario">
              Confirma tu contraseña
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="campo"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="h-12 w-full rounded-full bg-red-500/90 font-body font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
          >
            {enviando ? "Eliminando…" : "Eliminar mi cuenta definitivamente"}
          </button>
        </form>
      </div>
    </main>
  );
}

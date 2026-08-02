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
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-champan">Contraseña actualizada</h1>
        <p className="mt-4 text-sm text-[#F2EDE4]/70">Redirigiendo a iniciar sesión…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-champan">Nueva contraseña</h1>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#F2EDE4]/80">Contraseña nueva</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="campo"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-full bg-burdeos px-6 py-3 font-body font-semibold text-[#F2EDE4] transition hover:bg-burdeos-light disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </main>
  );
}

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
      <main className="flex min-h-screen flex-col items-center justify-center bg-fondo px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-champan">Revisa tu email</h1>
        <p className="mt-4 text-sm text-texto-secundario">
          Si existe una cuenta con ese email, te hemos enviado un enlace para
          restablecer tu contraseña.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center bg-fondo px-4 py-14">
      <div className="h-fit w-full max-w-[480px] rounded-xl border border-borde bg-surface p-8">
        <h1 className="font-display text-[28px] font-semibold text-texto">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-texto-secundario">
          Te enviaremos un enlace a tu email para elegir una nueva contraseña.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-texto-secundario">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="campo"
            />
          </label>

          <button
            type="submit"
            disabled={enviando}
            className="h-12 w-full rounded-full bg-burdeos font-body font-semibold text-white transition hover:bg-burdeos-hover disabled:opacity-60"
          >
            {enviando ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      </div>
    </main>
  );
}

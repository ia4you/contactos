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
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-champan">Revisa tu email</h1>
        <p className="mt-4 text-sm text-[#F2EDE4]/70">
          Si existe una cuenta con ese email, te hemos enviado un enlace para
          restablecer tu contraseña.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-champan">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-[#F2EDE4]/60">
        Te enviaremos un enlace a tu email para elegir una nueva contraseña.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#F2EDE4]/80">Email</span>
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
          className="w-full rounded-full bg-burdeos px-6 py-3 font-body font-semibold text-[#F2EDE4] transition hover:bg-burdeos-light disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Enviar enlace"}
        </button>
      </form>
    </main>
  );
}

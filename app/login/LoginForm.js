"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

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

    router.push("/mi-perfil");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-champan">Iniciar sesión</h1>

      {verificado === "1" && (
        <p className="mt-4 rounded-lg bg-champan/10 px-3 py-2 text-sm text-champan">
          Email confirmado. Ya puedes iniciar sesión.
        </p>
      )}
      {verificado === "0" && (
        <p className="mt-4 rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-400">
          El enlace de verificación no es válido o ha caducado.
        </p>
      )}

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
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#F2EDE4]/80">Contraseña</span>
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
          className="w-full rounded-full bg-burdeos px-6 py-3 font-body font-semibold text-[#F2EDE4] transition hover:bg-burdeos-light disabled:opacity-60"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="mt-6 flex justify-between text-sm text-[#F2EDE4]/60">
        <Link href="/recuperar" className="underline underline-offset-4">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/registro" className="underline underline-offset-4">
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}

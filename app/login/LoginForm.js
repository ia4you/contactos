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
    <main className="flex min-h-screen justify-center bg-fondo px-4 py-14">
      <div className="h-fit w-full max-w-[480px] rounded-xl border border-borde bg-surface p-8">
        <h1 className="font-display text-[28px] font-semibold text-texto">Bienvenido de nuevo</h1>

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
            <span className="mb-1 block text-xs font-medium text-texto-secundario">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="campo"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-texto-secundario">Contraseña</span>
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
            className="h-12 w-full rounded-full bg-burdeos font-body font-semibold text-white transition hover:bg-burdeos-hover disabled:opacity-60"
          >
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm text-texto-secundario">
          <Link href="/recuperar" className="hover:text-texto">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/registro" className="text-champan hover:underline">
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}

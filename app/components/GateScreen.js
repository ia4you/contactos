import { confirmarEdad } from "../actions/gate";

export function GateScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-noche px-6 py-12 text-center">
      <p className="font-display text-sm uppercase tracking-[0.3em] text-champan/80">
        contactos.turel.es
      </p>
      <h1 className="mt-6 font-display text-3xl font-semibold text-[#F2EDE4] sm:text-4xl">
        ¿Eres mayor de 18 años?
      </h1>
      <p className="mt-4 max-w-sm text-sm text-[#F2EDE4]/70">
        Este sitio contiene contenido dirigido exclusivamente a un público adulto.
        Confirma tu edad para continuar.
      </p>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <form action={confirmarEdad}>
          <button
            type="submit"
            className="w-full rounded-full bg-burdeos px-6 py-3 font-body font-semibold text-[#F2EDE4] transition hover:bg-burdeos-light"
          >
            Sí, soy mayor de 18 años
          </button>
        </form>
        <a
          href="https://www.google.com"
          className="w-full rounded-full border border-champan/30 px-6 py-3 font-body text-[#F2EDE4]/70 transition hover:border-champan/60"
        >
          No, salir
        </a>
      </div>

      <p className="mt-10 max-w-xs text-xs text-[#F2EDE4]/40">
        Acceso exclusivo a mayores de 18 años.
      </p>
    </main>
  );
}

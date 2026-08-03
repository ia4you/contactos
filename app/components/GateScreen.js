import { confirmarEdad } from "../actions/gate";

export function GateScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-fondo px-6 py-12 text-center">
      <p className="font-display text-3xl text-champan">Contactos</p>

      <h1 className="mt-8 font-display text-[28px] font-semibold text-texto">
        ¿Eres mayor de 18 años?
      </h1>
      <p className="mt-3 max-w-xs text-sm text-texto-secundario">
        Este sitio contiene contenido dirigido exclusivamente a un público
        adulto. Confirma tu edad para continuar.
      </p>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <form action={confirmarEdad}>
          <button
            type="submit"
            className="w-full rounded-full bg-burdeos px-6 py-3.5 font-body font-semibold text-white transition hover:bg-burdeos-hover"
          >
            Sí, soy mayor de 18
          </button>
        </form>
        <a
          href="https://www.google.com"
          className="w-full rounded-full border border-borde px-6 py-3.5 font-body text-texto-secundario transition hover:border-texto-secundario"
        >
          No, salir
        </a>
      </div>
    </main>
  );
}

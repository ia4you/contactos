import Link from "next/link";

export function Landing() {
  return (
    <main className="flex flex-col">
      <section className="flex flex-col items-center px-6 py-20 text-center sm:py-28">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-champan/80">
          Canarias · Ambiente liberal
        </p>
        <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-tight text-[#F2EDE4] sm:text-5xl">
          Contactos con discreción, en tus islas
        </h1>
        <p className="mt-6 max-w-md text-base text-[#F2EDE4]/70">
          Un espacio pensado para parejas y personas del ambiente liberal en
          Canarias. Tu privacidad es la prioridad: perfiles verificados,
          fotos protegidas y control total sobre quién te ve.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/registro"
            className="rounded-full bg-burdeos px-8 py-3 font-body font-semibold text-[#F2EDE4] transition hover:bg-burdeos-light"
          >
            Crear mi perfil
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-champan/30 px-8 py-3 font-body text-[#F2EDE4]/80 transition hover:border-champan/60"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="grid gap-6 px-6 pb-20 sm:grid-cols-3 sm:px-12">
        <Caracteristica
          titulo="Discreción por defecto"
          texto="Tus fotos aparecen desenfocadas hasta que decides mostrarlas. Nada se muestra sin tu permiso."
        />
        <Caracteristica
          titulo="Perfiles de las 8 islas"
          texto="Filtra por isla y encuentra gente de tu entorno más cercano, de Gran Canaria a La Graciosa."
        />
        <Caracteristica
          titulo="Tú tienes el control"
          texto="Elige qué buscas, gestiona tus solicitudes de acceso y borra tu cuenta cuando quieras."
        />
      </section>
    </main>
  );
}

function Caracteristica({ titulo, texto }) {
  return (
    <div className="rounded-2xl border border-champan/15 bg-white/[0.02] p-6 text-left">
      <h2 className="font-display text-lg font-semibold text-champan">{titulo}</h2>
      <p className="mt-2 text-sm text-[#F2EDE4]/70">{texto}</p>
    </div>
  );
}

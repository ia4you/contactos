import Image from "next/image";
import Link from "next/link";

export function Landing() {
  return (
    <main className="flex flex-col">
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center sm:py-32">
        <Image
          src="/images/banner-hero.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-fondo/40" />

        <div className="relative z-10 flex flex-col items-center">
          <p className="font-display text-[11px] uppercase tracking-widest text-champan">
            Canarias · Ambiente liberal
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-[48px] font-semibold leading-tight text-white sm:text-[64px]">
            Conexiones exclusivas y discretas
          </h1>
          <p className="mt-6 max-w-md text-base text-texto-secundario">
            Un espacio pensado para parejas y personas del ambiente liberal en
            Canarias. Tu privacidad es la prioridad: perfiles verificados,
            fotos protegidas y control total sobre quién te ve.
          </p>

          <Link
            href="/registro"
            className="mt-9 rounded-full bg-burdeos px-8 py-3.5 font-body font-semibold text-white transition hover:bg-burdeos-hover"
          >
            Crear mi perfil
          </Link>
          <Link href="/login" className="mt-4 text-sm text-champan hover:underline">
            Ya tengo cuenta →
          </Link>
        </div>
      </section>

      <section className="grid gap-px bg-borde sm:grid-cols-3">
        <Tarjeta
          imagen="/images/siluetas-pareja.png"
          titulo="Conexiones reales"
          texto="Perfiles verificados de parejas y personas afines a tu mismo ambiente, sin sorpresas."
        />
        <Tarjeta
          imagen="/images/salon-lujo.png"
          titulo="Ambiente exclusivo y privado"
          texto="Tus fotos y datos permanecen protegidos hasta que decides compartirlos."
        />
        <Tarjeta
          imagen="/images/canarias-aerea.png"
          titulo="Las 8 islas de Canarias"
          texto="Filtra por isla y encuentra gente de tu entorno más cercano."
        />
      </section>

      <section className="bg-burdeos px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
          Únete a un espacio pensado para ti
        </h2>
        <Link
          href="/registro"
          className="mt-7 inline-block rounded-full border border-white px-8 py-3 font-body font-semibold text-white transition hover:bg-white hover:text-burdeos"
        >
          Unirme ahora
        </Link>
      </section>
    </main>
  );
}

function Tarjeta({ imagen, titulo, texto }) {
  return (
    <div className="flex flex-col bg-fondo">
      <div className="relative h-[200px] w-full">
        <Image src={imagen} alt="" fill className="object-cover" />
      </div>
      <div className="flex-1 bg-surface p-6">
        <h3 className="font-display text-lg font-semibold text-champan">{titulo}</h3>
        <p className="mt-2 text-sm text-texto-secundario">{texto}</p>
      </div>
    </div>
  );
}

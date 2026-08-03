import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-borde bg-fondo px-6 py-8 text-sm text-texto-secundario">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/legal/aviso-legal" className="hover:text-champan">
            Aviso legal
          </Link>
          <Link href="/legal/privacidad" className="hover:text-champan">
            Privacidad
          </Link>
          <Link href="/legal/cookies" className="hover:text-champan">
            Cookies
          </Link>
        </nav>
        <p className="font-medium text-champan">Acceso exclusivo a mayores de 18 años</p>
        <p className="text-xs text-texto-secundario/60">contactos.turel.es</p>
      </div>
    </footer>
  );
}

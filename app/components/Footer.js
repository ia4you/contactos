"use client";

import Link from "next/link";
import { COOKIE_SETTINGS_EVENT } from "./CookieConsent";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <span className="site-footer__marca">Contactos</span>
        <p className="meta" style={{ marginTop: 10, fontSize: 14 }}>
          Acceso exclusivo a mayores de 18 años.
        </p>
      </div>

      <nav className="site-footer__nav" aria-label="Información legal">
        <Link href="/legal/aviso-legal" className="site-footer__enlace">
          Aviso legal
        </Link>
        <Link href="/legal/privacidad" className="site-footer__enlace">
          Privacidad
        </Link>
        <Link href="/legal/cookies" className="site-footer__enlace">
          Cookies
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
          className="site-footer__enlace"
        >
          Configurar cookies
        </button>
      </nav>
    </footer>
  );
}

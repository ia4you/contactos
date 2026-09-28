"use client";

import Link from "next/link";
import { COOKIE_SETTINGS_EVENT } from "./CookieConsent";

export function Footer() {
  return (
    <footer
      style={{
        padding: "56px",
        borderTop: "1px solid rgba(201,161,90,0.18)",
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <span className="heading" style={{ fontSize: 20, letterSpacing: 4, color: "var(--text)" }}>
          CONTACTOS
        </span>
        <p
          style={{
            marginTop: 10,
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          Acceso exclusivo a mayores de 18 años.
        </p>
      </div>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          fontFamily: "var(--font-body)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <Link href="/legal/aviso-legal" style={{ color: "inherit", textDecoration: "none" }}>
          Aviso legal
        </Link>
        <Link href="/legal/privacidad" style={{ color: "inherit", textDecoration: "none" }}>
          Privacidad
        </Link>
        <Link href="/legal/cookies" style={{ color: "inherit", textDecoration: "none" }}>
          Cookies
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
          style={{
            color: "inherit",
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            cursor: "pointer",
          }}
        >
          Configurar cookies
        </button>
      </nav>
    </footer>
  );
}

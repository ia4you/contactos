"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";

const GA_ID = "G-Y5GCHELG2S";
const STORAGE_KEY = "cookie_consent"; // "accepted" | "rejected"
export const COOKIE_SETTINGS_EVENT = "cookie-consent:open";

export function CookieConsent() {
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    setConsent(stored);
    setShowBanner(!stored);

    const reopen = () => setShowBanner(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  function decide(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    setConsent(value);
    setShowBanner(false);
  }

  return (
    <>
      {consent === "accepted" && <GoogleAnalytics gaId={GA_ID} />}
      {showBanner && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            background: "var(--bg)",
            borderTop: "1px solid rgba(201,161,90,0.3)",
            padding: "20px 24px",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--text-secondary)",
              maxWidth: 560,
              margin: 0,
            }}
          >
            Usamos cookies técnicas necesarias para el funcionamiento del
            sitio. Con tu consentimiento, también usamos Google Analytics
            para medir el uso de la web. Más información en nuestra{" "}
            <Link href="/legal/cookies" style={{ color: "var(--gold)" }}>
              política de cookies
            </Link>
            .
          </p>
          <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => decide("rejected")}
              className="btn-outline-gold"
              style={{ fontSize: 13, padding: "10px 18px" }}
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => decide("accepted")}
              className="btn-gold"
              style={{ fontSize: 13, padding: "10px 18px" }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { cookies } from "next/headers";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import "./theme.css";
import { Providers } from "./providers";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://contactos.turel.es"),
  title: {
    default: "Contactos Liberales en Canarias | Club Liberal Canarias",
    template: "%s | Contactos Liberales Canarias",
  },
  description:
    "La comunidad liberal de Canarias. Contactos discretos para parejas, chicas y chicos del ambiente liberal en las 8 islas. Únete gratis.",
  keywords: [
    "contactos liberales canarias",
    "parejas liberales canarias",
    "ambiente liberal gran canaria",
    "club liberal tenerife",
    "contactos swinger canarias",
    "parejas canarias",
  ],
  authors: [{ name: "Contactos Turel" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Contactos",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://contactos.turel.es",
    siteName: "Contactos Liberales Canarias",
    title: "Contactos Liberales en Canarias | Club Liberal",
    description:
      "La comunidad liberal de Canarias. Contactos discretos para parejas y personas del ambiente liberal en las 8 islas.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contactos Liberales Canarias",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contactos Liberales en Canarias",
    description: "La comunidad liberal de Canarias. Únete gratis.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#0e0a0b",
};

export default function RootLayout({ children }) {
  // Antes de confirmar la puerta de edad no debe verse nada más del sitio,
  // así que ni el navbar ni el footer se renderizan hasta pasar por ella.
  const gateOk = cookies().get("edad_confirmada")?.value === "1";

  return (
    <html lang="es">
      <body
        className={`${cormorant.variable} ${jost.variable} antialiased flex min-h-screen flex-col`}
        style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}
      >
        <Providers>
          {gateOk && <Navbar />}
          <div style={{ flex: 1 }}>{children}</div>
          {gateOk && <Footer />}
        </Providers>
        <GoogleAnalytics gaId="G-Y5GCHELG2S" />
      </body>
    </html>
  );
}

import { cookies } from "next/headers";
import { Cormorant_Garamond, Jost } from "next/font/google";
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
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "Contactos — Club Liberal Canarias",
  description:
    "Un espacio íntimo para el ambiente liberal en Canarias. Discreción y privacidad ante todo.",
  manifest: "/manifest.json",
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
      </body>
    </html>
  );
}

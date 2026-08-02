import { cookies } from "next/headers";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "./components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "contactos.turel.es — Contactos liberales en Canarias",
  description:
    "Portal de contactos para el ambiente liberal en Canarias. Discreción y privacidad ante todo.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0B0E1A",
};

export default function RootLayout({ children }) {
  // Antes de confirmar la puerta de edad no debe verse nada más del sitio,
  // así que el footer (enlaces legales, etc.) tampoco se renderiza hasta
  // pasar por ella.
  const gateOk = cookies().get("edad_confirmada")?.value === "1";

  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${outfit.variable} font-body antialiased bg-noche text-[#F2EDE4] flex min-h-screen flex-col`}>
        <Providers>
          <div className="flex-1">{children}</div>
          {gateOk && <Footer />}
        </Providers>
      </body>
    </html>
  );
}

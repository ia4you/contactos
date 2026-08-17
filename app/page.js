import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { GateScreen } from "./components/GateScreen";
import { Landing } from "./components/Landing";

export const metadata = {
  title: "Contactos Liberales en Canarias — Parejas y Ambiente Liberal",
  description:
    "Únete a la mayor comunidad liberal de Canarias. Contactos discretos para parejas, chicas y chicos del ambiente. Registro gratuito. Privacidad total.",
  alternates: {
    canonical: "https://contactos.turel.es",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Contactos Liberales Canarias",
  url: "https://contactos.turel.es",
  description: "Plataforma de contactos para el ambiente liberal en Canarias",
  areaServed: "Canarias, España",
};

export default async function Home() {
  // Un usuario con sesión activa ya pasó por el registro/login en su
  // momento: mostrarle de nuevo la landing con "Iniciar sesión"/"Crear
  // perfil" no tiene sentido, así que va directo al feed.
  const session = await getServerSession(authOptions);
  if (session) redirect("/feed");

  const gateOk = cookies().get("edad_confirmada")?.value === "1";

  if (!gateOk) {
    return <GateScreen />;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <Landing />
    </>
  );
}

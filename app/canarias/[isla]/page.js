import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../components/Footer";
import { ISLANDS_SEO, obtenerIsla } from "../islasData";

export async function generateStaticParams() {
  return ISLANDS_SEO.map((i) => ({ isla: i.slug }));
}

export async function generateMetadata({ params }) {
  const isla = obtenerIsla(params.isla);
  if (!isla) return {};

  const url = `https://contactos.turel.es/canarias/${isla.slug}`;
  return {
    title: isla.metaTitle,
    description: isla.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: isla.metaTitle,
      description: isla.metaDescription,
      url,
    },
  };
}

function faqParaIsla(isla) {
  return [
    {
      pregunta: `¿Hay ambiente liberal en ${isla.label}?`,
      respuesta: `Sí, existe una comunidad activa de parejas y personas del ambiente liberal en ${isla.label}. Contactos.turel.es es la plataforma de referencia para conectar de forma discreta en las islas.`,
    },
    {
      pregunta: "¿Es seguro y discreto?",
      respuesta:
        "Sí. Puedes marcar tus fotografías como privadas, decidir quién te ve y eliminar tu cuenta de forma permanente cuando quieras. La discreción es la prioridad del servicio.",
    },
    {
      pregunta: "¿Es gratis unirse?",
      respuesta:
        "Sí, crear tu perfil en contactos.turel.es es completamente gratuito. Puedes registrarte en minutos y empezar a explorar perfiles de tu isla sin coste.",
    },
    {
      pregunta: "¿Qué tipo de perfiles hay?",
      respuesta: `La comunidad incluye parejas liberales, chicas y chicos del ambiente, cada uno con su propio perfil, gustos y lo que busca, para facilitar conexiones afines en ${isla.label} y el resto de Canarias.`,
    },
    {
      pregunta: "¿Cómo protegen mi privacidad?",
      respuesta:
        "Tú decides qué fotos son públicas o privadas y quién puede verlas. Puedes eliminar tu cuenta en cualquier momento y tus datos se borran de forma permanente en un plazo máximo de 30 días.",
    },
  ];
}

export default function IslaPage({ params }) {
  const isla = obtenerIsla(params.isla);
  if (!isla) notFound();

  const faqs = faqParaIsla(isla);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: { "@type": "Answer", text: f.respuesta },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section style={{ padding: "96px 24px 60px", maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span className="heading" style={{ fontSize: 20, letterSpacing: 4, color: "var(--text)" }}>
            CONTACTOS
          </span>
        </Link>

        <p className="kicker" style={{ marginTop: 32 }}>
          Solo para mayores de 18 · {isla.label}
        </p>
        <h1 className="heading" style={{ marginTop: 16, fontSize: "clamp(30px, 5vw, 46px)", color: "var(--text)" }}>
          {isla.h1}
        </h1>
        <p
          style={{
            marginTop: 24,
            fontFamily: "var(--font-body)",
            fontSize: 16,
            fontWeight: 300,
            lineHeight: 1.7,
            color: "#cdbdae",
            textAlign: "left",
          }}
        >
          {isla.intro}
        </p>

        <div style={{ marginTop: 32 }}>
          <Link href="/registro" className="btn-gold">
            Ver perfiles en {isla.label}
          </Link>
        </div>
      </section>

      <section
        style={{
          padding: "80px 24px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid rgba(201,161,90,0.18)",
          borderBottom: "1px solid rgba(201,161,90,0.18)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 className="heading" style={{ fontSize: 30, color: "var(--text)" }}>
            La comunidad liberal de {isla.label}
          </h2>
          <p
            style={{
              marginTop: 18,
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            En {isla.label} conviven parejas liberales, chicas y chicos del ambiente con perfiles
            muy distintos entre sí: desde quienes ya viven activamente el estilo de vida swinger
            hasta personas que se acercan por primera vez con curiosidad y respeto. La comunidad se
            mueve tanto en torno a {isla.capital} como al resto de la isla, con quedadas informales,
            eventos puntuales y conversaciones que, gracias a la plataforma, pueden empezar de forma
            privada antes de dar cualquier paso presencial. No es necesario frecuentar locales
            concretos ni depender de contactos personales para formar parte de esta comunidad: basta
            con crear un perfil y dejar que la afinidad haga el resto.
          </p>
        </div>
      </section>

      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2 className="heading" style={{ fontSize: 30, color: "var(--text)" }}>
          Cómo funciona en {isla.label}
        </h2>
        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 32,
            maxWidth: 860,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <PasoIsla numero="1" titulo="Crea tu perfil">
            Regístrate gratis, elige tu tipo de perfil y cuenta qué buscas en {isla.label}.
          </PasoIsla>
          <PasoIsla numero="2" titulo="Busca por isla">
            Filtra perfiles de {isla.label} afines a tus gustos y a lo que buscas.
          </PasoIsla>
          <PasoIsla numero="3" titulo="Conecta">
            Escribe con discreción y decide tú qué compartir y cuándo dar el siguiente paso.
          </PasoIsla>
        </div>
      </section>

      <section style={{ padding: "80px 24px", background: "var(--bg-secondary)", borderTop: "1px solid rgba(201,161,90,0.18)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 className="heading" style={{ fontSize: 30, color: "var(--text)", textAlign: "center" }}>
            Preguntas frecuentes
          </h2>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 28 }}>
            {faqs.map((f) => (
              <div key={f.pregunta}>
                <h3 className="heading" style={{ fontSize: 18, color: "var(--gold)" }}>
                  {f.pregunta}
                </h3>
                <p
                  style={{
                    marginTop: 8,
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: "var(--text-secondary)",
                  }}
                >
                  {f.respuesta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <h2 className="heading" style={{ fontSize: 34, color: "var(--text)" }}>
          Tu comunidad liberal en {isla.label} te espera.
        </h2>
        <div style={{ marginTop: 32 }}>
          <Link href="/registro" className="btn-gold">
            Ver perfiles en {isla.label}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PasoIsla({ numero, titulo, children }) {
  return (
    <div>
      <span className="heading" style={{ fontSize: 40, fontStyle: "italic", color: "rgba(201,161,90,0.35)" }}>
        {numero}
      </span>
      <h3 className="heading" style={{ marginTop: 10, fontSize: 19, color: "var(--text)" }}>
        {titulo}
      </h3>
      <p
        style={{
          marginTop: 8,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 300,
          color: "var(--text-secondary)",
        }}
      >
        {children}
      </p>
    </div>
  );
}

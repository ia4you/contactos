import Link from "next/link";
import { ISLANDS_SEO } from "../canarias/islasData";
import { RegistroCTA } from "./RegistroCTA";

// Server Component: el contenido de la landing va siempre en el HTML (SEO);
// la puerta de edad se superpone encima desde app/page.js.
export function Landing() {
  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="contenedor">
          <p className="kicker rise-in">Solo para mayores de 18 · Canarias</p>
          <div className="hero__grid" style={{ marginTop: 28 }}>
            <h1 className="hero__titulo rise-in">
              Un espacio <em className="acento">íntimo</em>,<br />
              para quienes valoran la discreción.
            </h1>
            <div className="hero__lateral">
              <p className="hero__subtitulo">
                Un lugar reservado para parejas y personas del ambiente liberal en
                Canarias, donde la privacidad y el buen gusto son la norma, no la
                excepción.
              </p>
              <div className="hero__botones">
                <RegistroCTA location="landing_hero" className="btn-gold">
                  Crear mi perfil
                </RegistroCTA>
                <Link href="/login" className="btn-outline-light">
                  Ya soy miembro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cita */}
      <section className="banda-cita" aria-label="Nuestro compromiso">
        <div className="contenedor banda-cita__inner">
          <span className="banda-cita__comilla" aria-hidden="true">
            &ldquo;
          </span>
          <blockquote className="banda-cita__texto">
            Lo que sucede entre nosotros, permanece entre nosotros.
          </blockquote>
        </div>
      </section>

      {/* Filosofía */}
      <section className="seccion">
        <div className="contenedor">
          <p className="kicker">Nuestra filosofía</p>
          <h2 className="seccion__titulo" style={{ marginTop: 16 }}>
            La discreción es nuestra <em className="acento">moneda</em>
          </h2>
          <hr className="seccion__regla" />

          <div className="pilares">
            <Pilar numeral="I" titulo="Privacidad total">
              Tú decides qué compartes y con quién. Marca tus fotos como
              privadas y controla quién puede verte.
            </Pilar>
            <Pilar numeral="II" titulo="Comunidad real">
              Perfiles con gustos, orientación y lo que buscan. Nuestra IA te
              recomienda las personas más afines a ti.
            </Pilar>
            <Pilar numeral="III" titulo="Control absoluto">
              Tú decides quién te ve, a quién respondes y cuándo cerrar tu
              cuenta de forma definitiva.
            </Pilar>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="seccion" style={{ background: "var(--bg-deep)" }}>
        <div className="contenedor">
          <p className="kicker">El proceso</p>
          <h2 className="seccion__titulo" style={{ marginTop: 16 }}>
            Cómo <em className="acento">funciona</em>
          </h2>
          <hr className="seccion__regla" />

          <ol className="pilares">
            <Pilar numeral="1" titulo="Crea tu perfil" como="li">
              Regístrate en minutos, elige tu tipo de perfil, tus gustos y lo
              que buscas en Canarias.
            </Pilar>
            <Pilar numeral="2" titulo="Descubre y conecta" como="li">
              Explora perfiles, el feed de la comunidad, eventos y grupos por
              isla. Filtra por afinidad con IA.
            </Pilar>
            <Pilar numeral="3" titulo="Encuentra tu conexión" como="li">
              Envía mensajes, comparte historias, crea anuncios y conecta con
              quien realmente encaja contigo.
            </Pilar>
          </ol>
        </div>
      </section>

      {/* Elige tu isla (enlazado interno hacia /canarias/[isla]) */}
      <section className="seccion">
        <div className="contenedor islas">
          <div>
            <p className="kicker">Toda Canarias</p>
            <h2 className="seccion__titulo" style={{ marginTop: 16 }}>
              Elige tu <em className="acento">isla</em>
            </h2>
            <hr className="seccion__regla" />
            <p style={{ marginTop: 28 }}>
              <Link href="/blog" className="enlace" style={{ fontSize: 16 }}>
                Lee nuestro blog sobre el ambiente liberal en Canarias →
              </Link>
            </p>
          </div>

          <ul className="islas__lista">
            {ISLANDS_SEO.map((isla) => (
              <li key={isla.slug}>
                <Link href={`/canarias/${isla.slug}`} className="isla-enlace">
                  <span>
                    {isla.label}
                    <span className="sr-only">: ver perfiles en {isla.label}</span>
                  </span>
                  <span className="isla-enlace__flecha" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA final + descarga de la app (solo landing sin sesión: esta
          página nunca se renderiza si hay sesión activa, ver app/page.js) */}
      <section className="cta-final">
        <div className="contenedor">
          <h2 className="cta-final__titulo">
            Tu próxima conexión
            <br />
            <em className="acento">empieza aquí.</em>
          </h2>
          <div className="cta-final__botones">
            <RegistroCTA location="landing_cta_final" className="btn-gold">
              Crear mi perfil
            </RegistroCTA>
            <Link href="/downloads/contactos.apk" className="btn-outline-light">
              Descargar app para Android
            </Link>
          </div>
          <p className="meta" style={{ marginTop: 20, fontSize: 14, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            ¿Prefieres la versión móvil? Instala nuestra app directamente en tu
            Android. Activa &quot;Fuentes desconocidas&quot; en ajustes si es necesario.
          </p>
        </div>
      </section>
    </main>
  );
}

function Pilar({ numeral, titulo, como: Etiqueta = "div", children }) {
  return (
    <Etiqueta className="pilar">
      <span className="numeral pilar__numeral" aria-hidden="true">
        {numeral}
      </span>
      <h3 className="pilar__titulo">{titulo}</h3>
      <p className="pilar__texto">{children}</p>
    </Etiqueta>
  );
}

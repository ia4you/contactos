"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ISLANDS_SEO } from "../canarias/islasData";

export function Landing() {
  const [videoError, setVideoError] = useState(false);

  return (
    <main>
      {/* Sección 1 — Hero */}
      <section
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "96px 24px 40px",
        }}
      >
        {videoError ? (
          <Image
            src="/images/siluetas-pareja.png"
            alt=""
            fill
            priority
            unoptimized={false}
            style={{ objectFit: "cover", width: "100%", height: "100%", zIndex: 0 }}
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(107,21,36,0.35), transparent 60%), " +
              "linear-gradient(180deg, rgba(14,10,11,0.55) 0%, rgba(14,10,11,0.88) 78%, #0e0a0b 100%)",
          }}
        />

        <div
          className="rise-in"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 760,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p className="kicker">Solo para mayores de 18 · Canarias</p>
          <h1
            className="heading"
            style={{
              marginTop: 20,
              fontSize: "clamp(38px, 8vw, 70px)",
              fontWeight: 500,
              lineHeight: 1.15,
              color: "var(--text)",
            }}
          >
            Un espacio <em>íntimo</em>,<br />
            para quienes valoran la discreción.
          </h1>
          <p
            style={{
              marginTop: 24,
              maxWidth: 560,
              fontFamily: "var(--font-body)",
              fontSize: 17,
              fontWeight: 300,
              color: "#cdbdae",
            }}
          >
            Un lugar reservado para parejas y personas del ambiente liberal en
            Canarias, donde la privacidad y el buen gusto son la norma, no la
            excepción.
          </p>

          <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <Link href="/registro" className="btn-gold">
              Crear mi perfil
            </Link>
            <Link href="/login" className="btn-outline-light">
              Ya soy miembro
            </Link>
          </div>
        </div>
      </section>

      {/* Sección 2 — Filosofía */}
      <section style={{ padding: "120px 56px 60px", textAlign: "center" }}>
        <p className="kicker" style={{ textAlign: "center" }}>
          Nuestra filosofía
        </p>
        <h2 className="heading" style={{ marginTop: 16, fontSize: 42 }}>
          La discreción es nuestra moneda
        </h2>

        <div
          style={{
            marginTop: 64,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 48,
            maxWidth: 1000,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
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
      </section>

      {/* Sección 3 — Cómo funciona */}
      <section
        style={{
          padding: "100px 56px",
          textAlign: "center",
          background: "var(--bg-secondary)",
          borderTop: "1px solid rgba(201,161,90,0.18)",
          borderBottom: "1px solid rgba(201,161,90,0.18)",
        }}
      >
        <p className="kicker" style={{ textAlign: "center" }}>
          El proceso
        </p>
        <h2 className="heading" style={{ marginTop: 16, fontSize: 42 }}>
          Cómo funciona
        </h2>

        <div
          style={{
            marginTop: 64,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 0,
            maxWidth: 1000,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Paso numero="1" titulo="Crea tu perfil">
            Regístrate en minutos, elige tu tipo de perfil, tus gustos y lo
            que buscas en Canarias.
          </Paso>
          <Paso numero="2" titulo="Descubre y conecta">
            Explora perfiles, el feed de la comunidad, eventos y grupos por
            isla. Filtra por afinidad con IA.
          </Paso>
          <Paso numero="3" titulo="Encuentra tu conexión" ultimo>
            Envía mensajes, comparte historias, crea anuncios y conecta con
            quien realmente encaja contigo.
          </Paso>
        </div>
      </section>

      {/* Sección 3b — Elige tu isla (enlazado interno hacia /canarias/[isla]) */}
      <section style={{ padding: "100px 56px", textAlign: "center" }}>
        <p className="kicker" style={{ textAlign: "center" }}>
          Toda Canarias
        </p>
        <h2 className="heading" style={{ marginTop: 16, fontSize: 42 }}>
          Elige tu isla
        </h2>

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            maxWidth: 1000,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {ISLANDS_SEO.map((isla) => (
            <Link
              key={isla.slug}
              href={`/canarias/${isla.slug}`}
              style={{
                display: "block",
                padding: "24px 20px",
                border: "1px solid rgba(201,161,90,0.18)",
                textDecoration: "none",
                transition: "border-color 0.2s ease",
              }}
            >
              <h3 className="heading" style={{ fontSize: 18, color: "var(--text)" }}>
                {isla.label}
              </h3>
              <span
                style={{
                  marginTop: 8,
                  display: "block",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "var(--gold)",
                }}
              >
                Ver perfiles en {isla.label} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sección 4 — CTA banner */}
      <section
        style={{
          position: "relative",
          padding: "130px 56px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/canarias-aerea.png"
          alt=""
          fill
          unoptimized={false}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #0e0a0b 0%, rgba(14,10,11,0.55) 30%, rgba(14,10,11,0.75) 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 className="heading" style={{ fontSize: 44, color: "var(--text)" }}>
            Tu próxima conexión empieza aquí.
          </h2>
          <div style={{ marginTop: 32 }}>
            <Link href="/registro" className="btn-gold">
              Crear mi perfil
            </Link>
          </div>
        </div>
      </section>

      {/* Sección 5 — Descarga de la app (solo landing sin sesión: esta
          página nunca se renderiza si hay sesión activa, ver app/page.js) */}
      <section style={{ padding: "56px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          ¿Prefieres la versión móvil?
        </p>
        <div style={{ marginTop: 16 }}>
          <Link href="/downloads/contactos.apk" className="btn-outline-gold">
            📱 Descargar app para Android
          </Link>
        </div>
        <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
          Instala nuestra app directamente en tu Android. Activa &quot;Fuentes desconocidas&quot; en ajustes si es necesario.
        </p>
      </section>
    </main>
  );
}

function Pilar({ numeral, titulo, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "1px solid var(--gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="heading" style={{ fontSize: 20, color: "var(--gold)" }}>
          {numeral}
        </span>
      </div>
      <h3 className="heading" style={{ marginTop: 20, fontSize: 22, color: "var(--text)" }}>
        {titulo}
      </h3>
      <p
        style={{
          marginTop: 10,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 300,
          color: "var(--text-secondary)",
          maxWidth: 260,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function Paso({ numero, titulo, children, ultimo }) {
  return (
    <div
      style={{
        padding: "0 32px",
        borderLeft: "1px solid rgba(201,161,90,0.18)",
        borderRight: ultimo ? "1px solid rgba(201,161,90,0.18)" : "none",
      }}
    >
      <span
        className="heading"
        style={{
          fontSize: 56,
          fontStyle: "italic",
          color: "rgba(201,161,90,0.35)",
        }}
      >
        {numero}
      </span>
      <h3 className="heading" style={{ marginTop: 12, fontSize: 22, color: "var(--text)" }}>
        {titulo}
      </h3>
      <p
        style={{
          marginTop: 10,
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

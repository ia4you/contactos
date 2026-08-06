import Image from "next/image";
import Link from "next/link";

export function Landing() {
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
        <Image
          src="/images/siluetas-pareja.png"
          alt=""
          fill
          priority
          unoptimized={false}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
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
            Tus fotos y datos permanecen ocultos hasta que decides
            compartirlos con quien tú elijas.
          </Pilar>
          <Pilar numeral="II" titulo="Perfiles verificados">
            Revisamos cada perfil y cada fotografía antes de que sean
            visibles para el resto de la comunidad.
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
            Regístrate en un paso, elige tu tipo de perfil y qué buscas.
          </Paso>
          <Paso numero="2" titulo="Explora y conecta">
            Filtra por isla, revisa perfiles verificados y contacta con
            quien te interese.
          </Paso>
          <Paso numero="3" titulo="Encuentra tu afinidad" ultimo>
            Gestiona tus solicitudes y decide con quién compartir tus
            fotos privadas.
          </Paso>
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

import { confirmarEdad } from "../actions/gate";

export function GateScreen() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "var(--bg)",
        padding: "24px",
      }}
    >
      <p
        className="heading"
        style={{ fontSize: "28px", letterSpacing: "5px", color: "var(--text)" }}
      >
        CONTACTOS
      </p>

      <div
        style={{
          width: 60,
          height: 1,
          background: "var(--gold)",
          margin: "24px auto",
        }}
      />

      <h1 className="heading" style={{ fontSize: "32px", color: "var(--text)" }}>
        ¿Eres mayor de 18 años?
      </h1>
      <p
        style={{
          marginTop: 12,
          maxWidth: 320,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 300,
          color: "var(--text-secondary)",
        }}
      >
        Este sitio contiene contenido dirigido exclusivamente a un público
        adulto. Confirma tu edad para continuar.
      </p>

      <div style={{ marginTop: 40, width: "100%", maxWidth: 320 }}>
        <form action={confirmarEdad}>
          <button type="submit" className="btn-gold" style={{ width: "100%" }}>
            Sí, tengo más de 18 años
          </button>
        </form>
        <a
          href="https://www.google.com"
          style={{
            display: "block",
            marginTop: 16,
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          No, salir
        </a>
      </div>
    </main>
  );
}

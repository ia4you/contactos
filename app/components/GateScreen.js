import { confirmarEdad } from "../actions/gate";

export function GateScreen({ error }) {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "var(--bg)",
        padding: "24px",
        overflowY: "auto",
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

      {/* No es <h1>: el H1 real de la página es el de Landing (contenido
          real indexable). Este es un overlay/diálogo interstitial, así que
          usa role="heading" aria-level="2" para conservar semántica de
          encabezado accesible sin duplicar el H1 del documento. */}
      <p
        role="heading"
        aria-level="2"
        className="heading"
        style={{ fontSize: "32px", color: "var(--text)" }}
      >
        ¿Eres mayor de 18 años?
      </p>
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
        adulto. Indica tu fecha de nacimiento para continuar.
      </p>

      <div style={{ marginTop: 40, width: "100%", maxWidth: 320 }}>
        <form action={confirmarEdad}>
          {error && (
            <p
              style={{
                marginBottom: 12,
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--text)",
              }}
            >
              Debes ser mayor de 18 años para acceder a este sitio.
            </p>
          )}
          <input
            type="date"
            name="fecha_nacimiento"
            required
            className="input-field"
            style={{ width: "100%", marginBottom: 16 }}
          />
          <button type="submit" className="btn-gold" style={{ width: "100%" }}>
            Continuar
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

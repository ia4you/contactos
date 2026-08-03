export function LegalPage({ kicker, titulo, children }) {
  return (
    <main style={{ background: "var(--bg)", minHeight: "60vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 40px" }}>
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="heading" style={{ marginTop: 16, fontSize: 40, color: "var(--text)" }}>
          {titulo}
        </h1>
        <div
          className="legal-body"
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            fontFamily: "var(--font-body)",
            fontSize: 15,
            lineHeight: 1.8,
            color: "var(--text-secondary)",
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

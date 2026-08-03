export default function Perfiles() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 40px",
      }}
    >
      <p className="kicker">Próximamente</p>
      <h1 className="heading" style={{ fontSize: "32px", marginTop: "16px" }}>
        Explorar perfiles
      </h1>
      <p style={{ color: "var(--text-secondary)", marginTop: "12px", maxWidth: 420 }}>
        Esta sección estará disponible muy pronto.
      </p>
    </main>
  );
}

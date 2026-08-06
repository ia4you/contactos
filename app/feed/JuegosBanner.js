const JUEGOS = [
  {
    titulo: "¿Nos conocemos?",
    texto: "El juego de parejas más divertido de Canarias",
    href: "https://parejas.turel.rel.es",
  },
  {
    titulo: "Desátate",
    texto: "Descubre tus límites con tu pareja",
    href: "https://desatate.turel.es",
  },
];

export function JuegosBanner() {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="grid-2-responsive" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {JUEGOS.map((j) => (
          <div
            key={j.titulo}
            style={{
              background: "#1c1416",
              border: "1px solid rgba(201,161,90,0.18)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <h3 className="heading" style={{ fontSize: 16, color: "var(--gold)" }}>
              {j.titulo}
            </h3>
            <p style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>
              {j.texto}
            </p>
            <a
              href={j.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold"
              style={{ alignSelf: "flex-start", padding: "7px 16px", fontSize: 11 }}
            >
              Jugar
            </a>
          </div>
        ))}
      </div>
      <p
        style={{
          marginTop: 8,
          fontFamily: "var(--font-body)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        Patrocinado por turel.es
      </p>
    </div>
  );
}

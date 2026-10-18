import { Gamepad2 } from "lucide-react";

const JUEGOS = [
  {
    titulo: "Desátate",
    texto: "Descubre tus límites con tu pareja",
    href: "https://desatate.turel.es",
  },
];

export function JuegosBanner({ vertical = false }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        className={vertical ? undefined : "grid-2-responsive"}
        style={vertical ? { display: "flex", flexDirection: "column", gap: 12 } : { gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        {JUEGOS.map((j) => (
          <div
            key={j.titulo}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Gamepad2 size={22} color="var(--gold)" />
            <h3 className="widget-titulo">
              {j.titulo}
            </h3>
            <p style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
              {j.texto}
            </p>
            <a
              href={j.href}
              target="_blank"
              rel="noopener noreferrer"
              className="enlace-flecha"
              style={{ alignSelf: "flex-start" }}
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

import Link from "next/link";

export function DemoBanner() {
  return (
    <div
      style={{
        background: "rgba(122,46,63,0.15)",
        border: "1px solid rgba(122,46,63,0.5)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flexWrap: "wrap",
        textAlign: "center",
      }}
    >
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>
        Este es un perfil de demostración. Las respuestas están generadas por IA. ¡Regístrate
        para conectar con personas reales!
      </p>
      <Link href="/registro" className="btn-gold" style={{ padding: "8px 18px", fontSize: 12, flexShrink: 0 }}>
        Crear mi perfil gratis
      </Link>
    </div>
  );
}

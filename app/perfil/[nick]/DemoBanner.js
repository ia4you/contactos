import { RegistroCTA } from "../../components/RegistroCTA";

export function DemoBanner() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--rule)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flexWrap: "wrap",
        textAlign: "center",
      }}
    >
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)" }}>
        Este es un perfil de demostración. Las respuestas están generadas por IA. ¡Regístrate
        para conectar con personas reales!
      </p>
      <RegistroCTA location="perfil_demo_banner" className="btn-gold" style={{ padding: "8px 18px", fontSize: 12, flexShrink: 0 }}>
        Crear mi perfil gratis
      </RegistroCTA>
    </div>
  );
}

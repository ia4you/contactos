import { DemoBadge } from "./DemoBadge";

// badge_especial (p.ej. "CEO" para Turel, user id=2) tiene prioridad sobre
// cualquier otro badge, incluido "Demo".
export function UsuarioBadge({ badgeEspecial, isDemo, style }) {
  if (badgeEspecial) {
    return (
      <span
        style={{
          position: "absolute",
          bottom: -2,
          right: -2,
          zIndex: 2,
          background: "var(--gold)",
          color: "var(--bg)",
          fontFamily: "var(--font-body)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.04em",
          padding: "2px 5px",
          borderRadius: 4,
          border: "1px solid var(--bg)",
          whiteSpace: "nowrap",
          ...style,
        }}
      >
        {badgeEspecial}
      </span>
    );
  }
  if (isDemo) return <DemoBadge style={style} />;
  return null;
}

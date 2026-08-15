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
          background: "#c9a15a",
          color: "#0e0a0b",
          fontFamily: "var(--font-body)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          padding: "2px 5px",
          borderRadius: 4,
          border: "1px solid #0e0a0b",
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

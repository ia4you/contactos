import { DemoBadge, estiloInsignia } from "./DemoBadge";

// badge_especial (p.ej. "CEO" para Turel, user id=2) tiene prioridad sobre
// cualquier otro badge, incluido "Demo".
export function UsuarioBadge({ badgeEspecial, isDemo, style }) {
  if (badgeEspecial) {
    return (
      <span style={{ ...estiloInsignia, background: "var(--bg)", color: "var(--gold)", border: "1px solid var(--gold)", ...style }}>
        {badgeEspecial}
      </span>
    );
  }
  if (isDemo) return <DemoBadge style={style} />;
  return null;
}

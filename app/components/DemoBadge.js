// Insignia pequeña en la esquina del avatar, por fuera de la cara. Con
// style={{ position: "static" }} se usa en línea junto al nick.
export const estiloInsignia = {
  position: "absolute",
  bottom: -4,
  right: -6,
  zIndex: 2,
  fontFamily: "var(--font-body)",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  lineHeight: "14px",
  padding: "0 4px",
  borderRadius: 2,
  whiteSpace: "nowrap",
};

export function DemoBadge({ style }) {
  return (
    <span style={{ ...estiloInsignia, background: "var(--wine)", color: "var(--text)", ...style }}>
      Demo
    </span>
  );
}

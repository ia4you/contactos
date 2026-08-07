export function DemoBadge({ style }) {
  return (
    <span
      style={{
        position: "absolute",
        bottom: -2,
        right: -2,
        zIndex: 2,
        background: "#7A2E3F",
        color: "#fff",
        fontFamily: "var(--font-body)",
        fontSize: 8,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        padding: "2px 5px",
        borderRadius: 4,
        border: "1px solid #0e0a0b",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      Demo
    </span>
  );
}

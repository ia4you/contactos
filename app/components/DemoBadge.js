export function DemoBadge({ style }) {
  return (
    <span
      style={{
        position: "absolute",
        bottom: -2,
        right: -2,
        zIndex: 2,
        background: "var(--wine)",
        color: "#fff",
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
      Demo
    </span>
  );
}

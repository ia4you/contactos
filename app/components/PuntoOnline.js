export function PuntoOnline({ size = 10 }) {
  return (
    <span
      style={{
        position: "absolute",
        right: -1,
        bottom: -1,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--online)",
        border: "2px solid var(--bg)",
        zIndex: 1,
      }}
    />
  );
}

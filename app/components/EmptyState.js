import Image from "next/image";

export function EmptyState({ texto = "Aún no hay nada aquí", alto = 180 }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 0",
        textAlign: "center",
      }}
    >
      <div style={{ position: "relative", width: alto, height: alto, opacity: 0.5 }}>
        <Image src="/images/rosa-burdeos.png" alt="" fill unoptimized={false} style={{ objectFit: "contain" }} />
      </div>
      <p style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
        {texto}
      </p>
    </div>
  );
}

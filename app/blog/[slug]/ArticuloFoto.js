"use client";

import Image from "next/image";

export function ArticuloFoto({ foto, alt, titulo, fecha }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "21 / 9",
        minHeight: 380,
        marginTop: 24,
        overflow: "hidden",
      }}
    >
      <Image
        src={`/uploads/blog/${foto}`}
        alt={alt}
        fill
        unoptimized={false}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        style={{ objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(14,10,11,0) 45%, rgba(14,10,11,0.25) 100%)",
        }}
      />
      {(titulo || fecha) && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "40px clamp(20px, 5vw, 64px) 28px",
            background:
              "linear-gradient(180deg, rgba(14,10,11,0) 0%, rgba(14,10,11,0.75) 40px, rgba(14,10,11,0.75) 100%)",
          }}
        >
          <p className="kicker">Blog</p>
          {titulo && (
            <h1
              className="heading"
              style={{
                marginTop: 10,
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 3.2vw, 34px)",
                lineHeight: 1.2,
                color: "var(--text)",
              }}
            >
              {titulo}
            </h1>
          )}
          {fecha && (
            <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
              {fecha}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

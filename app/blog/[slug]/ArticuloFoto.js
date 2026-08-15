"use client";

import Image from "next/image";

export function ArticuloFoto({ foto, alt }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "21 / 9", marginTop: 24, overflow: "hidden" }}>
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
          background: "linear-gradient(180deg, rgba(14,10,11,0.35) 0%, rgba(14,10,11,0.85) 100%)",
        }}
      />
    </div>
  );
}

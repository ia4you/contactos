"use client";

import Image from "next/image";
import Link from "next/link";
import { avatarSrc } from "@/lib/constants";

export function GrupoMiembrosTab({ miembros }) {
  if (!miembros.length) {
    return (
      <p style={{ padding: "40px 0", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
        Este grupo aún no tiene miembros.
      </p>
    );
  }

  return (
    <div style={{ padding: "24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
      {miembros.map((m) => {
        const src = avatarSrc(m.id, m.avatar_filename, m.profile_type);
        return (
          <Link
            key={m.id}
            href={`/perfil/${m.nick}`}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none", padding: 12 }}
          >
            <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)", textAlign: "center" }}>{m.nick}</span>
            {m.rol === "admin" && (
              <span className="badge-gold" style={{ fontSize: 9, padding: "2px 7px" }}>Admin</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

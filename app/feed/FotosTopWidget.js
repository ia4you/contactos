"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { avatarSrc } from "@/lib/constants";

const MEDALLAS = ["🥇", "🥈", "🥉"];

export function FotosTopWidget() {
  const [fotos, setFotos] = useState(null);

  useEffect(() => {
    fetch("/api/feed/fotos-top")
      .then((r) => r.json())
      .then((d) => setFotos(d.fotos || []))
      .catch(() => setFotos([]));
  }, []);

  if (!fotos || fotos.length < 3) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <p className="kicker">Fotos más valoradas hoy</p>
      <div className="scroll-sin-barra" style={{ marginTop: 14, display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {fotos.slice(0, 3).map((f, i) => (
          <Link
            key={f.id}
            href={`/perfil/${f.nick}`}
            style={{ position: "relative", flex: "0 0 200px", aspectRatio: "1 / 1", overflow: "hidden", textDecoration: "none" }}
          >
            <Image src={avatarSrc(f.user_id, f.filename, null)} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />

            <span style={{ position: "absolute", left: 8, top: 8, fontSize: 22 }}>{MEDALLAS[i]}</span>

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "24px 12px 12px",
                background: "linear-gradient(180deg, transparent 0%, rgba(14,10,11,0.85) 100%)",
              }}
            >
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--gold)" }}>
                🔥 {f.likes_count} me gusta{f.likes_count === 1 ? "" : "s"}
              </p>
              <p style={{ marginTop: 2, fontFamily: "var(--font-display)", fontSize: 14, color: "#fff" }}>
                Foto de {f.nick}
              </p>
              <span
                style={{
                  marginTop: 8,
                  display: "inline-block",
                  padding: "5px 12px",
                  border: "1px solid #fff",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Ver perfil
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

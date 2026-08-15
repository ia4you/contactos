"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { avatarSrc } from "@/lib/constants";
import { EmptyState } from "../components/EmptyState";

const LIMITE = 24;

export function FotosShell() {
  const [fotos, setFotos] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function cargar(offsetActual, append) {
    setCargando(true);
    const res = await fetch(`/api/fotos?offset=${offsetActual}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;

    setFotos((prev) => (append ? [...(prev || []), ...data.fotos] : data.fotos));
    setHasMore(data.hasMore);
    setOffset(offsetActual + LIMITE);
  }

  useEffect(() => {
    cargar(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="kicker">Comunidad</p>
      <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
        Fotos
      </h1>

      {fotos === null ? (
        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 0" }}>
          Cargando…
        </p>
      ) : fotos.length === 0 ? (
        <EmptyState texto="Todavía no hay fotos públicas que mostrar" />
      ) : (
        <>
          <div className="fotos-grid-publicas" style={{ marginTop: 28 }}>
            {fotos.map((f) => {
              const src = avatarSrc(f.user_id, f.filename, f.profile_type);
              const avatar = avatarSrc(f.user_id, f.avatar_filename, f.profile_type);
              return (
                <Link
                  key={f.id}
                  href={`/perfil/${f.nick}`}
                  style={{ position: "relative", display: "block", aspectRatio: "1 / 1", overflow: "hidden" }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized={false}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ objectFit: "cover" }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "16px 8px 6px",
                      background: "linear-gradient(180deg, transparent 0%, rgba(14,10,11,0.85) 100%)",
                    }}
                  >
                    <div style={{ position: "relative", width: 22, height: 22, flexShrink: 0, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.5)" }}>
                      <Image src={avatar} alt="" fill unoptimized={false} draggable={false} style={{ objectFit: "cover" }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.nick}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button type="button" onClick={() => cargar(offset, true)} disabled={cargando} className="btn-outline-gold">
                {cargando ? "Cargando…" : "Cargar más"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

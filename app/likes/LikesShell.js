"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ISLANDS, PROFILE_TYPES, avatarSrc } from "@/lib/constants";
import { mostrarPuntoOnline } from "@/lib/online";
import { tiempoRelativo } from "@/lib/tiempo";
import { EmptyState } from "../components/EmptyState";
import { PuntoOnline } from "../components/PuntoOnline";
import { DemoBadge } from "../components/DemoBadge";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const LIMITE = 30;

function TabLikesPerfil() {
  const [likes, setLikes] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function cargar(offsetActual, append) {
    setCargando(true);
    const res = await fetch(`/api/likes/recibidos/perfil?offset=${offsetActual}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;

    setLikes((prev) => (append ? [...(prev || []), ...data.likes] : data.likes));
    setHasMore(data.hasMore);
    setOffset(offsetActual + LIMITE);
  }

  useEffect(() => {
    cargar(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (likes === null) {
    return (
      <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 0" }}>
        Cargando…
      </p>
    );
  }
  if (likes.length === 0) {
    return <EmptyState texto="Aún no has recibido likes en tu perfil" />;
  }

  return (
    <>
      {likes.map((l) => {
        const src = avatarSrc(l.id, l.avatar_filename, l.profile_type);
        return (
          <Link
            key={l.id}
            href={`/perfil/${l.nick}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 0",
              borderBottom: "1px solid rgba(201,161,90,0.12)",
              textDecoration: "none",
            }}
          >
            <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
              <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
              </div>
              {mostrarPuntoOnline(l) && <PuntoOnline />}
              {l.is_demo && <DemoBadge />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="heading" style={{ fontSize: 15, color: "var(--text)" }}>
                  {l.nick}
                </span>
                <span className="badge-gold" style={{ fontSize: 9 }}>{ISLAND_LABEL[l.island]}</span>
                <span className="badge-gold" style={{ fontSize: 9 }}>{PROFILE_TYPE_LABEL[l.profile_type]}</span>
                {l.match && (
                  <span style={{ display: "inline-block", fontFamily: "var(--font-body)", background: "var(--gold)", color: "var(--bg)", fontSize: 9, textTransform: "uppercase", letterSpacing: 1, padding: "2px 8px" }}>
                    Match ✓
                  </span>
                )}
              </div>
              <p style={{ marginTop: 3, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
                {tiempoRelativo(l.created_at)}
              </p>
            </div>
          </Link>
        );
      })}

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button type="button" onClick={() => cargar(offset, true)} disabled={cargando} className="btn-outline-gold">
            {cargando ? "Cargando…" : "Ver más"}
          </button>
        </div>
      )}
    </>
  );
}

function TabLikesFotos({ usuarioId }) {
  const [fotos, setFotos] = useState(null);

  useEffect(() => {
    fetch("/api/likes/recibidos/fotos")
      .then((r) => r.json())
      .then((d) => setFotos(d.fotos || []))
      .catch(() => setFotos([]));
  }, []);

  if (fotos === null) {
    return (
      <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 0" }}>
        Cargando…
      </p>
    );
  }
  if (fotos.length === 0) {
    return <EmptyState texto="Todavía no tienes fotos con likes" />;
  }

  return (
    <div className="fotos-grid-2a">
      {fotos.map((f) => (
        <Link key={f.id} href={`/mi-perfil?tab=fotos#foto-${f.id}`} style={{ display: "block" }}>
          <div style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden", border: "1px solid rgba(201,161,90,0.2)" }}>
            <Image src={`/uploads/${usuarioId}/${f.filename}`} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
          </div>
          <p style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
            <Heart size={11} fill="var(--gold)" color="var(--gold)" />
            {f.likes_count} {f.likes_count === 1 ? "persona" : "personas"}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function LikesShell({ usuarioId }) {
  const [tab, setTab] = useState("perfil");

  useEffect(() => {
    fetch("/api/likes/vista", { method: "PATCH" }).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="kicker">Actividad</p>
      <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
        Mis likes
      </h1>

      <div className="tab-nav" style={{ marginTop: 28 }}>
        <button type="button" onClick={() => setTab("perfil")} className={`tab-nav-item ${tab === "perfil" ? "active" : ""}`}>
          Likes en perfil
        </button>
        <button type="button" onClick={() => setTab("fotos")} className={`tab-nav-item ${tab === "fotos" ? "active" : ""}`}>
          Likes en fotos
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        {tab === "perfil" ? <TabLikesPerfil /> : <TabLikesFotos usuarioId={usuarioId} />}
      </div>
    </div>
  );
}

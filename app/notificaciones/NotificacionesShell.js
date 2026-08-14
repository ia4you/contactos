"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AVATAR_PLACEHOLDER, avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { textoNotificacion } from "@/lib/notificacionTexto";
import { hrefNotificacion } from "@/lib/notificacionHref";
import { mostrarPuntoOnline } from "@/lib/online";
import { EmptyState } from "../components/EmptyState";
import { PuntoOnline } from "../components/PuntoOnline";
import { DemoBadge } from "../components/DemoBadge";

const LIMITE = 30;

const TABS = [
  { value: "todas", label: "Todas" },
  { value: "likes", label: "Likes" },
  { value: "comentarios", label: "Comentarios" },
  { value: "amistades", label: "Amistades" },
  { value: "visitas", label: "Visitas" },
];

export function NotificacionesShell() {
  const [tab, setTab] = useState("todas");
  const [notificaciones, setNotificaciones] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function cargar(tabActual, offsetActual, append) {
    setCargando(true);
    const params = new URLSearchParams({ offset: String(offsetActual), limite: String(LIMITE) });
    if (tabActual !== "todas") params.set("categoria", tabActual);
    const res = await fetch(`/api/notificaciones?${params.toString()}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;

    setNotificaciones((prev) => (append ? [...(prev || []), ...data.notificaciones] : data.notificaciones));
    setHasMore(data.hasMore);
    setOffset(offsetActual + LIMITE);
  }

  useEffect(() => {
    cargar(tab, 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function cambiarTab(nuevoTab) {
    if (nuevoTab === tab) return;
    setTab(nuevoTab);
    setOffset(0);
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 0 80px" }}>
      <div style={{ padding: "0 24px" }}>
        <h1 className="heading" style={{ fontSize: 32, color: "var(--text)" }}>
          Notificaciones
        </h1>
      </div>

      <div className="tab-nav" style={{ marginTop: 20, padding: "0 24px" }}>
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => cambiarTab(t.value)}
            className={`tab-nav-item ${tab === t.value ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        {notificaciones === null ? (
          <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 24px" }}>
            Cargando…
          </p>
        ) : notificaciones.length === 0 ? (
          <div style={{ padding: "0 24px" }}>
            <EmptyState texto="No hay notificaciones aquí" />
          </div>
        ) : (
          <>
            {notificaciones.map((n) => {
              const src = avatarSrc(n.from_id, n.avatar_filename, n.profile_type) || AVATAR_PLACEHOLDER.chica;
              const href = hrefNotificacion(n);
              const Envoltorio = href ? Link : "div";
              return (
                <Envoltorio
                  key={n.id}
                  {...(href ? { href } : {})}
                  className="notificacion-fila"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 24px",
                    borderBottom: "1px solid #2a2a2a",
                    textDecoration: "none",
                    cursor: href ? "pointer" : "default",
                  }}
                >
                  <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                      <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                    </div>
                    {n.from_id && mostrarPuntoOnline({ last_active: n.last_active, show_last_seen: n.show_last_seen }) && <PuntoOnline />}
                    {n.is_demo && <DemoBadge />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: n.leida ? "var(--text-secondary)" : "var(--text)" }}>
                      {textoNotificacion(n)}
                    </p>
                  </div>
                  <span style={{ flexShrink: 0, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
                    {tiempoRelativo(n.created_at)}
                  </span>
                </Envoltorio>
              );
            })}

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button type="button" onClick={() => cargar(tab, offset, true)} disabled={cargando} className="btn-outline-gold">
                  {cargando ? "Cargando…" : "Ver más"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

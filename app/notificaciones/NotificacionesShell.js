"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AVATAR_PLACEHOLDER, avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { textoNotificacion } from "@/lib/notificacionTexto";
import { hrefNotificacion } from "@/lib/notificacionHref";
import { EmptyState } from "../components/EmptyState";

const LIMITE = 20;

function inicioDia(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function agrupar(notificaciones) {
  const hoy = inicioDia(new Date());
  const ayer = new Date(hoy.getTime() - 86400000);
  const haceUnaSemana = new Date(hoy.getTime() - 7 * 86400000);

  const grupos = { Hoy: [], Ayer: [], "Esta semana": [], Antes: [] };
  for (const n of notificaciones) {
    const fecha = inicioDia(n.created_at);
    if (fecha.getTime() === hoy.getTime()) grupos.Hoy.push(n);
    else if (fecha.getTime() === ayer.getTime()) grupos.Ayer.push(n);
    else if (fecha.getTime() > haceUnaSemana.getTime()) grupos["Esta semana"].push(n);
    else grupos.Antes.push(n);
  }
  return grupos;
}

export function NotificacionesShell() {
  const { data: session } = useSession();
  const [notificaciones, setNotificaciones] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargar(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar(offsetActual, append) {
    setCargando(true);
    const res = await fetch(`/api/notificaciones?offset=${offsetActual}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;

    setNotificaciones((prev) => (append ? [...(prev || []), ...data.notificaciones] : data.notificaciones));
    setHasMore(data.hasMore);
    setOffset(offsetActual + LIMITE);
  }

  const grupos = notificaciones ? agrupar(notificaciones) : null;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="kicker">Actividad</p>
      <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
        Notificaciones
      </h1>

      <div style={{ marginTop: 32 }}>
        {notificaciones === null ? (
          <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", padding: "40px 0" }}>
            Cargando…
          </p>
        ) : notificaciones.length === 0 ? (
          <EmptyState texto="Aún no tienes notificaciones" />
        ) : (
          <>
            {Object.entries(grupos)
              .filter(([, items]) => items.length > 0)
              .map(([titulo, items]) => (
                <div key={titulo} style={{ marginBottom: 32 }}>
                  <p className="kicker" style={{ letterSpacing: 3 }}>{titulo}</p>
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 2 }}>
                    {items.map((n) => {
                      const src = avatarSrc(n.from_id, n.avatar_filename, n.profile_type) || AVATAR_PLACEHOLDER.chica;
                      const href = hrefNotificacion(n, session?.user?.name);
                      const Envoltorio = href ? Link : "div";
                      return (
                        <Envoltorio
                          key={n.id}
                          {...(href ? { href } : {})}
                          style={{
                            display: "flex",
                            gap: 14,
                            padding: "14px 16px",
                            background: n.leida ? "transparent" : "rgba(201,161,90,0.06)",
                            borderBottom: "1px solid rgba(201,161,90,0.1)",
                            textDecoration: "none",
                            cursor: href ? "pointer" : "default",
                          }}
                        >
                          <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                            <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                          </div>
                          <div>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)" }}>
                              {textoNotificacion(n)}
                            </p>
                            <p style={{ marginTop: 3, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
                              {tiempoRelativo(n.created_at)}
                            </p>
                          </div>
                        </Envoltorio>
                      );
                    })}
                  </div>
                </div>
              ))}

            {hasMore && (
              <div style={{ textAlign: "center" }}>
                <button type="button" onClick={() => cargar(offset, true)} disabled={cargando} className="btn-outline-gold">
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

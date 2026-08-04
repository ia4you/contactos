"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { AVATAR_PLACEHOLDER } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { textoNotificacion } from "@/lib/notificacionTexto";

export function NotificacionesBell() {
  const [contador, setContador] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function cargarContador() {
      fetch("/api/notificaciones/contador")
        .then((r) => r.json())
        .then((d) => setContador(d.noLeidas || 0))
        .catch(() => {});
    }
    cargarContador();
    const intervalo = setInterval(cargarContador, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    function onClickFuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  async function alAbrir() {
    const nuevoEstado = !abierto;
    setAbierto(nuevoEstado);
    if (!nuevoEstado) return;

    const res = await fetch("/api/notificaciones?limite=10");
    const data = await res.json().catch(() => null);
    setNotificaciones(data?.notificaciones || []);

    // Se marca como leído sin condicionar al contador local: el polling cada
    // 30s puede ir por detrás de una notificación recién creada, y si el
    // PATCH solo se disparara cuando contador > 0 esa notificación nunca
    // llegaría a marcarse como leída.
    setContador(0);
    fetch("/api/notificaciones/leidas", { method: "PATCH" }).catch(() => {});
  }

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button type="button" onClick={alAbrir} aria-label="Notificaciones" className="icon-btn" style={{ position: "relative" }}>
        <Bell size={20} />
        {contador > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 15,
              height: 15,
              borderRadius: 8,
              background: "#c94b4b",
              color: "#fff",
              fontSize: 9,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
            }}
          >
            {contador > 9 ? "9+" : contador}
          </span>
        )}
      </button>

      {abierto && (
        <div className="dropdown-menu" style={{ width: 320, maxHeight: 420, overflowY: "auto" }}>
          {notificaciones === null ? (
            <p style={{ padding: "16px 18px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
              Cargando…
            </p>
          ) : notificaciones.length === 0 ? (
            <p style={{ padding: "16px 18px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
              No tienes notificaciones.
            </p>
          ) : (
            notificaciones.map((n) => {
              const src = n.avatar_filename
                ? `/uploads/${n.from_id}/${n.avatar_filename}`
                : AVATAR_PLACEHOLDER[n.profile_type] || AVATAR_PLACEHOLDER.chica;
              return (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "12px 18px",
                    borderBottom: "1px solid rgba(201,161,90,0.1)",
                    background: n.leida ? "transparent" : "rgba(201,161,90,0.06)",
                  }}
                >
                  <div style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                    <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>
                      {textoNotificacion(n)}
                    </p>
                    <p style={{ marginTop: 2, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>
                      {tiempoRelativo(n.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <Link
            href="/notificaciones"
            onClick={() => setAbierto(false)}
            className="dropdown-item"
            style={{ textAlign: "center", borderTop: "1px solid rgba(201,161,90,0.15)" }}
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}

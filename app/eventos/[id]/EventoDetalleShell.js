"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ISLANDS, avatarSrc } from "@/lib/constants";
import { notFound } from "next/navigation";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const TIPO_LABEL = { quedada: "Quedada", fiesta: "Fiesta", club: "Club", otro: "Otro" };

function formatearFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function EventoDetalleShell({ eventoId }) {
  const [evento, setEvento] = useState(null);
  const [asistentes, setAsistentes] = useState([]);
  const [notFoundState, setNotFoundState] = useState(false);

  function cargar() {
    fetch(`/api/eventos/${eventoId}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFoundState(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setEvento(d.evento);
        setAsistentes(d.asistentes || []);
      })
      .catch(() => setNotFoundState(true));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId]);

  async function asistir(status) {
    const res = await fetch(`/api/eventos/${eventoId}/asistir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) cargar();
  }

  if (notFoundState) notFound();
  if (!evento) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
      </div>
    );
  }

  const esPasado = new Date(evento.fecha_evento).getTime() < Date.now();
  const aforoRestante = evento.aforo != null ? Math.max(0, evento.aforo - evento.apuntados_count) : null;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" }}>
      <Link href="/eventos" className="nav-top-link" style={{ fontSize: 12 }}>
        ← Volver a eventos
      </Link>

      {evento.foto && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", marginTop: 20, border: "1px solid #2a2a2a" }}>
          <Image src={`/uploads/eventos/${evento.foto}`} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="badge-gold">{TIPO_LABEL[evento.tipo]}</span>
        <span className="badge-gold">{ISLAND_LABEL[evento.isla]}</span>
      </div>

      <h1 className="heading" style={{ marginTop: 14, fontSize: 34, color: "var(--text)" }}>
        {evento.titulo}
      </h1>

      <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--gold)" }}>
        {formatearFecha(evento.fecha_evento)}
      </p>
      {evento.lugar && (
        <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>{evento.lugar}</p>
      )}
      <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
        Organiza {evento.organizador_nick}
      </p>

      {evento.descripcion && (
        <p style={{ marginTop: 24, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text)", whiteSpace: "pre-wrap" }}>
          {evento.descripcion}
        </p>
      )}

      <p style={{ marginTop: 20, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
        {evento.apuntados_count} apuntados
        {evento.interesados_count > 0 && ` · ${evento.interesados_count} interesados`}
        {aforoRestante !== null && ` · ${aforoRestante} plazas libres`}
      </p>

      {!esPasado && (
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {evento.mi_status === "apuntado" ? (
            <button type="button" onClick={() => asistir("apuntado")} className="btn-outline-gold" style={{ borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}>
              Cancelar asistencia
            </button>
          ) : (
            <>
              <button type="button" onClick={() => asistir("apuntado")} className="btn-gold">
                Apuntarme
              </button>
              <button
                type="button"
                onClick={() => asistir("interesado")}
                className="btn-outline-gold"
                style={evento.mi_status === "interesado" ? { borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" } : {}}
              >
                {evento.mi_status === "interesado" ? "Quitar interés" : "Interesado"}
              </button>
            </>
          )}
        </div>
      )}

      {asistentes.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>
            Asistentes
          </h2>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 14 }}>
            {asistentes.map((a) => {
              const src = avatarSrc(a.id, a.avatar_filename, a.profile_type);
              return (
                <Link key={a.id} href={`/perfil/${a.nick}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 60, textDecoration: "none" }}>
                  <div style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: a.status === "apuntado" ? "2px solid var(--gold)" : "2px solid rgba(244,234,217,0.2)" }}>
                    <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                    {a.nick}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

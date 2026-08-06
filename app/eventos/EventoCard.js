"use client";

import Link from "next/link";
import { ISLANDS } from "@/lib/constants";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const TIPO_LABEL = { quedada: "Quedada", fiesta: "Fiesta", club: "Club", otro: "Otro" };

function formatearFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function EventoCard({ evento, onAsistir, esPasado }) {
  const aforoRestante = evento.aforo != null ? Math.max(0, evento.aforo - evento.apuntados_count) : null;

  return (
    <div style={{ background: "#141414", border: "1px solid #2a2a2a", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span className="badge-gold" style={{ fontSize: 9 }}>{TIPO_LABEL[evento.tipo]}</span>
        <span className="badge-gold" style={{ fontSize: 9 }}>{ISLAND_LABEL[evento.isla]}</span>
      </div>

      <Link href={`/eventos/${evento.id}`} style={{ textDecoration: "none" }}>
        <h3 className="heading" style={{ fontSize: 19, color: "var(--text)" }}>{evento.titulo}</h3>
      </Link>

      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
        {formatearFecha(evento.fecha_evento)}
      </p>
      {evento.lugar && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>{evento.lugar}</p>
      )}

      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
        {evento.apuntados_count} apuntados
        {evento.interesados_count > 0 && ` · ${evento.interesados_count} interesados`}
        {aforoRestante !== null && ` · ${aforoRestante} plazas libres`}
      </p>

      {!esPasado && (
        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          {evento.mi_status === "apuntado" ? (
            <button type="button" onClick={() => onAsistir(evento.id, "apuntado")} className="btn-outline-gold" style={{ fontSize: 11, borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}>
              Cancelar asistencia
            </button>
          ) : evento.mi_status === "interesado" ? (
            <>
              <button type="button" onClick={() => onAsistir(evento.id, "apuntado")} className="btn-gold" style={{ fontSize: 11 }}>
                Apuntarme
              </button>
              <button type="button" onClick={() => onAsistir(evento.id, "interesado")} className="btn-outline-gold" style={{ fontSize: 11, borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}>
                Quitar interés
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onAsistir(evento.id, "apuntado")} className="btn-gold" style={{ fontSize: 11 }}>
                Apuntarme
              </button>
              <button type="button" onClick={() => onAsistir(evento.id, "interesado")} className="btn-outline-gold" style={{ fontSize: 11 }}>
                Interesado
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

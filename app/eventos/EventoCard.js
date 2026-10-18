"use client";

import Image from "next/image";
import Link from "next/link";
import { ISLANDS } from "@/lib/constants";
import { FechaEvento } from "../components/FechaEvento";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const TIPO_LABEL = { quedada: "Quedada", fiesta: "Fiesta", club: "Club", otro: "Otro" };

function horaEvento(iso) {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function EventoCard({ evento, onAsistir, esPasado, esPropio, onEditar, onEliminar }) {
  const aforoRestante = evento.aforo != null ? Math.max(0, evento.aforo - evento.apuntados_count) : null;

  return (
    <article className="evento-fila">
      <FechaEvento iso={evento.fecha_evento} />
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      <p className="meta">
        {[TIPO_LABEL[evento.tipo], ISLAND_LABEL[evento.isla], horaEvento(evento.fecha_evento)].filter(Boolean).join(" · ")}
      </p>

      <Link href={`/eventos/${evento.id}`} style={{ textDecoration: "none" }}>
        <h3 className="tarjeta-feed__titulo">{evento.titulo}</h3>
      </Link>

      {evento.lugar && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>{evento.lugar}</p>
      )}

      {evento.foto && (
        <div style={{ position: "relative", width: "100%", maxWidth: 480, aspectRatio: "16 / 9", overflow: "hidden", marginTop: 4 }}>
          <Image sizes="(max-width: 719px) 100vw, 480px" src={`/uploads/eventos/${evento.foto}`} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
      )}

      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
        {evento.apuntados_count} apuntados
        {evento.interesados_count > 0 && ` · ${evento.interesados_count} interesados`}
        {aforoRestante !== null && ` · ${aforoRestante} plazas libres`}
      </p>

      {!esPasado && esPropio && (
        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          <button type="button" onClick={() => onEditar(evento)} className="btn-outline-gold" style={{ fontSize: 12 }}>
            Editar
          </button>
          <button
            type="button"
            onClick={() => onEliminar(evento.id)}
            className="btn-outline-gold"
            style={{ fontSize: 12, borderColor: "var(--danger-border)", color: "var(--danger)" }}
          >
            Eliminar
          </button>
        </div>
      )}

      {!esPasado && !esPropio && (
        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          {evento.mi_status === "apuntado" ? (
            <button type="button" onClick={() => onAsistir(evento.id, "apuntado")} className="btn-outline-gold" style={{ fontSize: 12, borderColor: "var(--danger-border)", color: "var(--danger)" }}>
              Cancelar asistencia
            </button>
          ) : evento.mi_status === "interesado" ? (
            <>
              <button type="button" onClick={() => onAsistir(evento.id, "apuntado")} className="btn-gold" style={{ fontSize: 12 }}>
                Apuntarme
              </button>
              <button type="button" onClick={() => onAsistir(evento.id, "interesado")} className="btn-outline-gold" style={{ fontSize: 12, borderColor: "var(--danger-border)", color: "var(--danger)" }}>
                Quitar interés
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onAsistir(evento.id, "apuntado")} className="btn-gold" style={{ fontSize: 12 }}>
                Apuntarme
              </button>
              <button type="button" onClick={() => onAsistir(evento.id, "interesado")} className="btn-outline-gold" style={{ fontSize: 12 }}>
                Interesado
              </button>
            </>
          )}
        </div>
      )}
      </div>
    </article>
  );
}

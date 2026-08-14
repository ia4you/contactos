"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Clock, Phone, Mail, Globe } from "lucide-react";
import { ISLANDS } from "@/lib/constants";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

function formatearFecha(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  );
}

function FilaInfo({ icono: Icono, label, valor }) {
  if (!valor) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14 }}>
      <Icono size={16} color="var(--gold)" style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--gold)" }}>
          {label}
        </p>
        <p style={{ marginTop: 2, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>{valor}</p>
      </div>
    </div>
  );
}

function TarjetaEvento({ evento, clubId, onApuntado }) {
  const [enviando, setEnviando] = useState(false);
  const esPasado = new Date(evento.fecha_evento).getTime() < Date.now();

  async function apuntarme() {
    if (enviando) return;
    setEnviando(true);
    const res = await fetch(`/api/clubs/${clubId}/eventos/${evento.id}/asistir`, { method: "POST" });
    setEnviando(false);
    if (res.ok) {
      const data = await res.json();
      onApuntado(evento.id, data);
    }
  }

  return (
    <div style={{ background: "#1c1416", border: "1px solid rgba(201,161,90,0.2)", marginTop: 20, overflow: "hidden" }}>
      {evento.foto && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
          <Image src={evento.foto} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} onContextMenu={(e) => e.preventDefault()} />
        </div>
      )}
      <div style={{ padding: 20 }}>
        <h3 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>
          {evento.titulo}
        </h3>
        <p style={{ marginTop: 6, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>
          {formatearFecha(evento.fecha_evento)}
        </p>
        <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
          {evento.precio}
          {evento.aforo != null && ` · Aforo: ${evento.aforo}`}
        </p>
        {evento.descripcion && (
          <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
            {evento.descripcion}
          </p>
        )}
        <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
          {evento.apuntados_count} apuntados
        </p>

        {!esPasado && (
          <button
            type="button"
            onClick={apuntarme}
            disabled={enviando}
            className={evento.mi_apuntado ? "btn-gold" : "btn-outline-gold"}
            style={{ marginTop: 14 }}
          >
            {evento.mi_apuntado ? "Apuntado ✓" : "Apuntarme"}
          </button>
        )}
      </div>
    </div>
  );
}

export function ClubDetalleShell({ slug }) {
  const [club, setClub] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [notFoundState, setNotFoundState] = useState(false);
  const [principalIdx, setPrincipalIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/clubs/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFoundState(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setClub(d.club);
        setEventos(d.eventos || []);
      })
      .catch(() => setNotFoundState(true));
  }, [slug]);

  function onApuntado(eventoId, data) {
    setEventos((prev) =>
      prev.map((e) =>
        e.id === eventoId ? { ...e, mi_apuntado: data.miApuntado, apuntados_count: data.apuntadosCount } : e
      )
    );
  }

  if (notFoundState) notFound();
  if (!club) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
      </div>
    );
  }

  const fotos = [club.foto1, club.foto2, club.foto3].filter(Boolean);
  const principal = fotos[principalIdx] || fotos[0];
  const miniaturas = fotos.filter((_, i) => i !== principalIdx);
  const preventContextMenu = (e) => e.preventDefault();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div className="club-detalle-layout" style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        <div className="club-detalle-galeria" style={{ width: 400, flexShrink: 0 }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", border: "1px solid rgba(201,161,90,0.2)", overflow: "hidden" }}>
            <Image src={principal} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} onContextMenu={preventContextMenu} />
          </div>
          {miniaturas.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              {miniaturas.map((foto) => {
                const idxReal = fotos.indexOf(foto);
                return (
                  <button
                    key={foto}
                    type="button"
                    onClick={() => setPrincipalIdx(idxReal)}
                    style={{
                      position: "relative",
                      flex: 1,
                      aspectRatio: "1 / 1",
                      border: "1px solid rgba(201,161,90,0.2)",
                      overflow: "hidden",
                      padding: 0,
                      cursor: "pointer",
                      background: "none",
                    }}
                  >
                    <Image src={foto} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} onContextMenu={preventContextMenu} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <h1 className="heading" style={{ fontSize: 36, color: "var(--text)" }}>
              {club.nombre}
            </h1>
            <span className="badge-gold">{ISLAND_LABEL[club.isla]}</span>
            {club.destacado && (
              <span style={{ display: "inline-block", fontFamily: "var(--font-body)", background: "var(--gold)", color: "var(--bg)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, padding: "4px 10px" }}>
                Destacado
              </span>
            )}
          </div>

          {club.descripcion && (
            <p style={{ marginTop: 16, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
              {club.descripcion}
            </p>
          )}

          <div style={{ marginTop: 28 }}>
            <p className="kicker" style={{ letterSpacing: 3 }}>
              Información
            </p>
            <FilaInfo icono={MapPin} label="Dirección" valor={club.direccion} />
            <FilaInfo icono={Clock} label="Horario" valor={club.horario} />
            <FilaInfo icono={Phone} label="Teléfono" valor={club.telefono} />
            <FilaInfo icono={Mail} label="Email" valor={club.email} />
            <FilaInfo icono={Globe} label="Web" valor={club.web} />
          </div>

          {eventos.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <p className="kicker" style={{ letterSpacing: 3 }}>
                Próximos eventos
              </p>
              {eventos.map((evento) => (
                <TarjetaEvento key={evento.id} evento={evento} clubId={club.id} onApuntado={onApuntado} />
              ))}
            </div>
          )}

          <p style={{ marginTop: 40, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Este club es un establecimiento privado de acceso para adultos. Contactos.turel.es actúa como
            directorio informativo y no se responsabiliza de las actividades realizadas en el local.
          </p>
        </div>
      </div>
    </div>
  );
}

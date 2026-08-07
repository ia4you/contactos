"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ISLANDS } from "@/lib/constants";
import { EventoCard } from "./EventoCard";
import { CrearEventoModal } from "./CrearEventoModal";
import { EmptyState } from "../components/EmptyState";

const TIPOS = [
  { value: "quedada", label: "Quedada" },
  { value: "fiesta", label: "Fiesta" },
  { value: "club", label: "Club" },
  { value: "otro", label: "Otro" },
];

export function EventosShell({ usuario }) {
  const [eventos, setEventos] = useState(null);
  const [filtroIsla, setFiltroIsla] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [eventoEnEdicion, setEventoEnEdicion] = useState(null);
  const [pasadosAbierto, setPasadosAbierto] = useState(false);
  const [pasados, setPasados] = useState(null);

  function cargar() {
    const params = new URLSearchParams();
    if (filtroIsla) params.set("isla", filtroIsla);
    if (filtroTipo) params.set("tipo", filtroTipo);
    fetch(`/api/eventos?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setEventos(d.eventos || []))
      .catch(() => setEventos([]));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function filtrar() {
    cargar();
  }

  function cargarPasados() {
    const nuevoEstado = !pasadosAbierto;
    setPasadosAbierto(nuevoEstado);
    if (nuevoEstado && pasados === null) {
      fetch("/api/eventos?pasados=true")
        .then((r) => r.json())
        .then((d) => setPasados(d.eventos || []))
        .catch(() => setPasados([]));
    }
  }

  async function onAsistir(eventoId, status) {
    const res = await fetch(`/api/eventos/${eventoId}/asistir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) return;

    const actualizar = (lista) =>
      lista
        ? lista.map((e) =>
            e.id === eventoId
              ? { ...e, mi_status: data.miStatus, apuntados_count: data.apuntados_count, interesados_count: data.interesados_count }
              : e
          )
        : lista;
    setEventos(actualizar);
    setPasados(actualizar);
  }

  function abrirCrear() {
    setEventoEnEdicion(null);
    setModalAbierto(true);
  }

  function abrirEditar(evento) {
    setEventoEnEdicion(evento);
    setModalAbierto(true);
  }

  function onGuardado(evento) {
    setModalAbierto(false);
    if (eventoEnEdicion) {
      const actualizar = (lista) => (lista ? lista.map((e) => (e.id === evento.id ? { ...e, ...evento } : e)) : lista);
      setEventos(actualizar);
      setPasados(actualizar);
    } else {
      setEventos((prev) => [{ ...evento, organizador_nick: usuario.nick, apuntados_count: 0, interesados_count: 0, mi_status: null }, ...(prev || [])]);
    }
  }

  async function eliminarEvento(id) {
    if (!window.confirm("¿Eliminar este evento?")) return;
    setEventos((prev) => (prev ? prev.filter((e) => e.id !== id) : prev));
    setPasados((prev) => (prev ? prev.filter((e) => e.id !== id) : prev));
    await fetch(`/api/eventos/${id}`, { method: "DELETE" });
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="kicker">Comunidad</p>
          <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
            Eventos
          </h1>
        </div>
        <button type="button" onClick={abrirCrear} className="btn-gold">
          Crear evento
        </button>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label>
          <span className="label-field">Isla</span>
          <select value={filtroIsla} onChange={(e) => setFiltroIsla(e.target.value)} className="input-field" style={{ width: 180 }}>
            <option value="">Todas</option>
            {ISLANDS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label-field">Tipo</span>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="input-field" style={{ width: 160 }}>
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={filtrar} className="btn-outline-gold">
          Filtrar
        </button>
      </div>

      <div style={{ marginTop: 32 }}>
        {eventos === null ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
        ) : eventos.length === 0 ? (
          <EmptyState texto="No hay eventos próximos" />
        ) : (
          <div className="anuncios-grid">
            {eventos.map((e) => (
              <EventoCard
                key={e.id}
                evento={e}
                onAsistir={onAsistir}
                esPropio={String(e.user_id) === String(usuario.id)}
                onEditar={abrirEditar}
                onEliminar={eliminarEvento}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <button
          type="button"
          onClick={cargarPasados}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "var(--text-secondary)",
            padding: 0,
          }}
        >
          <ChevronDown size={16} style={{ transform: pasadosAbierto ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
          Eventos anteriores
        </button>

        {pasadosAbierto && (
          <div style={{ marginTop: 20 }}>
            {pasados === null ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
            ) : pasados.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>No hay eventos anteriores.</p>
            ) : (
              <div className="anuncios-grid">
                {pasados.map((e) => (
                  <EventoCard
                    key={e.id}
                    evento={e}
                    onAsistir={onAsistir}
                    esPasado
                    esPropio={String(e.user_id) === String(usuario.id)}
                    onEditar={abrirEditar}
                    onEliminar={eliminarEvento}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modalAbierto && (
        <CrearEventoModal
          eventoExistente={eventoEnEdicion}
          islaPorDefecto={usuario.island}
          onClose={() => setModalAbierto(false)}
          onGuardado={onGuardado}
        />
      )}
    </div>
  );
}

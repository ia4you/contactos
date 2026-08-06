"use client";

import { useState } from "react";
import { ISLANDS } from "@/lib/constants";

const TIPOS = [
  { value: "quedada", label: "Quedada" },
  { value: "fiesta", label: "Fiesta" },
  { value: "club", label: "Club" },
  { value: "otro", label: "Otro" },
];

export function CrearEventoModal({ islaPorDefecto, onClose, onCreado }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isla, setIsla] = useState(islaPorDefecto);
  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState("");
  const [aforo, setAforo] = useState("");
  const [tipo, setTipo] = useState("quedada");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    setError("");
    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    if (!fecha) {
      setError("La fecha y hora son obligatorias.");
      return;
    }

    setEnviando(true);
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        isla,
        lugar: lugar.trim(),
        fechaEvento: new Date(fecha).toISOString(),
        aforo: aforo ? Number(aforo) : null,
        tipo,
      }),
    });
    const data = await res.json().catch(() => null);
    setEnviando(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo crear el evento.");
      return;
    }
    onCreado(data.evento);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(14,10,11,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 480, background: "var(--surface)", border: "1px solid var(--border-gold)", padding: 28, margin: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
          Crear evento
        </h3>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">Título</span>
          <input type="text" maxLength={100} value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input-field" />
        </label>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">Descripción</span>
          <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="input-field" />
        </label>

        <div className="grid-2-responsive" style={{ gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
          <label>
            <span className="label-field">Isla</span>
            <select value={isla} onChange={(e) => setIsla(e.target.value)} className="input-field">
              {ISLANDS.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label-field">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input-field">
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">Lugar</span>
          <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)} className="input-field" placeholder="Opcional" />
        </label>

        <div className="grid-2-responsive" style={{ gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
          <label>
            <span className="label-field">Fecha y hora</span>
            <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input-field" />
          </label>
          <label>
            <span className="label-field">Aforo (opcional)</span>
            <input type="number" min={1} value={aforo} onChange={(e) => setAforo(e.target.value)} className="input-field" />
          </label>
        </div>

        {error && <p style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button type="button" onClick={onClose} disabled={enviando} className="btn-outline-gold" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={enviando} className="btn-gold" style={{ flex: 1 }}>
            {enviando ? "Creando…" : "Crear evento"}
          </button>
        </div>
      </div>
    </div>
  );
}

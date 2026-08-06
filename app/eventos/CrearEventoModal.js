"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { ISLANDS } from "@/lib/constants";
import { LugarAutocomplete } from "./LugarAutocomplete";

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
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const inputFileRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function seleccionarArchivo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArchivo(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function quitarArchivo() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArchivo(null);
    setPreviewUrl(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

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
    const formData = new FormData();
    formData.append("titulo", titulo.trim());
    formData.append("descripcion", descripcion.trim());
    formData.append("isla", isla);
    formData.append("lugar", lugar.trim());
    formData.append("fechaEvento", new Date(fecha).toISOString());
    formData.append("aforo", aforo ? String(Number(aforo)) : "");
    formData.append("tipo", tipo);
    if (archivo) formData.append("file", archivo);

    const res = await fetch("/api/eventos", { method: "POST", body: formData });
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
          <LugarAutocomplete value={lugar} onChange={setLugar} />
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

        <div style={{ marginTop: 18 }}>
          <span className="label-field">Foto (opcional)</span>
          {previewUrl ? (
            <div>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", border: "1px solid rgba(201,161,90,0.2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <button type="button" onClick={quitarArchivo} className="btn-outline-gold" style={{ marginTop: 8, fontSize: 11, padding: "6px 14px" }}>
                Quitar foto
              </button>
            </div>
          ) : (
            <label
              className="btn-outline-gold"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              <ImageIcon size={15} />
              Subir foto
              <input
                ref={inputFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={seleccionarArchivo}
              />
            </label>
          )}
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

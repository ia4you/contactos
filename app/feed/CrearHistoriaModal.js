"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

export function CrearHistoriaModal({ onClose, onCreada }) {
  const [texto, setTexto] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [certificado, setCertificado] = useState(false);
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
    setArchivo(f);
    setPreviewUrl(URL.createObjectURL(f));
    setCertificado(false);
  }

  async function publicar() {
    setError("");
    if (!archivo && (!texto.trim() || texto.trim().length > 200)) {
      setError("El texto debe tener entre 1 y 200 caracteres.");
      return;
    }
    if (archivo && !certificado) {
      setError("Debes certificar que todas las personas de la foto son mayores de edad y han consentido.");
      return;
    }

    setEnviando(true);
    const formData = new FormData();
    formData.append("tipo", archivo ? "foto" : "texto");
    formData.append("contenido", texto.trim());
    if (archivo) {
      formData.append("file", archivo);
      formData.append("certifico", "true");
    }

    const res = await fetch("/api/historias", { method: "POST", body: formData });
    const data = await res.json().catch(() => null);
    setEnviando(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo publicar la historia.");
      return;
    }
    onCreada();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(14,10,11,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 420, background: "var(--surface)", border: "1px solid var(--border-gold)", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>
          Nueva historia
        </h3>
        <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
          Se caduca automáticamente a las 24 horas.
        </p>

        {previewUrl ? (
          <div style={{ marginTop: 16, position: "relative", width: "100%", aspectRatio: "9 / 12", overflow: "hidden", border: "1px solid rgba(201,161,90,0.2)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <textarea
            rows={4}
            maxLength={200}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe algo… (máx 200 caracteres)"
            className="input-field"
            style={{ marginTop: 16 }}
          />
        )}

        {archivo && (
          <label
            style={{ display: "flex", gap: 8, marginTop: 14, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}
          >
            <input
              type="checkbox"
              checked={certificado}
              onChange={(e) => setCertificado(e.target.checked)}
              className="checkbox-gold"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            Certifico que todas las personas que aparecen en esta foto son
            mayores de 18 años y han dado su consentimiento para su
            publicación.
          </label>
        )}

        {error && (
          <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>
        )}

        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="btn-outline-gold" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <ImageIcon size={15} />
            Foto
            <input
              ref={inputFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={seleccionarArchivo}
            />
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} disabled={enviando} className="btn-outline-gold">
              Cancelar
            </button>
            <button type="button" onClick={publicar} disabled={enviando} className="btn-gold">
              {enviando ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

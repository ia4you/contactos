"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { AVATAR_PLACEHOLDER } from "@/lib/constants";

export function Composer({ usuario, avatarUrl, onPublicado }) {
  const [expandido, setExpandido] = useState(false);
  const [texto, setTexto] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [certificado, setCertificado] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState("");
  const inputFileRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const imagenAvatar = avatarUrl || AVATAR_PLACEHOLDER[usuario.profile_type] || AVATAR_PLACEHOLDER.chica;

  function seleccionarArchivo(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setArchivo(f);
    setPreviewUrl(URL.createObjectURL(f));
    setCertificado(false);
    setExpandido(true);
  }

  function quitarArchivo() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArchivo(null);
    setPreviewUrl(null);
    setCertificado(false);
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  function cancelar() {
    quitarArchivo();
    setTexto("");
    setError("");
    setExpandido(false);
  }

  async function publicar() {
    setError("");

    if (!archivo && (!texto.trim() || texto.trim().length > 500)) {
      setError("El texto debe tener entre 1 y 500 caracteres.");
      return;
    }
    if (archivo && !certificado) {
      setError("Debes certificar que todas las personas de la foto son mayores de edad y han consentido.");
      return;
    }

    setPublicando(true);
    const formData = new FormData();
    formData.append("tipo", archivo ? "foto" : "texto");
    formData.append("contenido", texto.trim());
    if (archivo) {
      formData.append("file", archivo);
      formData.append("certifico", "true");
    }

    const res = await fetch("/api/feed/publicaciones", { method: "POST", body: formData });
    const data = await res.json().catch(() => null);
    setPublicando(false);

    if (!res.ok) {
      setError(data?.error || "No se pudo publicar.");
      return;
    }

    onPublicado({
      ...data.publicacion,
      user_id: usuario.id,
      nick: usuario.nick,
      profile_type: usuario.profile_type,
      island: usuario.island,
      avatar_filename: avatarUrl ? avatarUrl.split("/").pop() : null,
      likes_count: 0,
      comentarios_count: 0,
      me_gusta: false,
      esAnuncio: false,
    });

    cancelar();
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-gold)", padding: 20 }}>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <Image src={imagenAvatar} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>

        <div style={{ flex: 1 }}>
          {expandido ? (
            <textarea
              rows={4}
              maxLength={500}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="¿Qué quieres compartir?"
              className="input-field"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setExpandido(true)}
              className="input-field"
              style={{ textAlign: "left", cursor: "text", color: "var(--text-muted)" }}
            >
              ¿Qué quieres compartir?
            </button>
          )}

          {previewUrl && (
            <div style={{ marginTop: 14, position: "relative" }}>
              <div style={{ position: "relative", width: "100%", maxHeight: 320, aspectRatio: "16 / 10", overflow: "hidden", border: "1px solid rgba(201,161,90,0.2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <button
                type="button"
                onClick={quitarArchivo}
                className="btn-outline-gold"
                style={{ marginTop: 8, fontSize: 11, padding: "6px 14px" }}
              >
                Quitar foto
              </button>

              <label
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  fontFamily: "var(--font-body)",
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                }}
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
            </div>
          )}

          {error && (
            <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>
          )}

          {expandido && (
            <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
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
                <button type="button" onClick={cancelar} disabled={publicando} className="btn-outline-gold">
                  Cancelar
                </button>
              </div>
              <button
                type="button"
                onClick={publicar}
                disabled={publicando}
                className="btn-gold"
                style={{ opacity: publicando ? 0.6 : 1 }}
              >
                {publicando ? "Publicando…" : "Publicar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

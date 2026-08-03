"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, Star } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

const ESTADO_BADGE = {
  approved: { texto: "Aprobada", color: "#4a9a6a" },
  rejected: { texto: "Rechazada", color: "#9a3a3a" },
};

export function TabFotos({ usuarioId, fotos, setFotos }) {
  const [errorFoto, setErrorFoto] = useState("");
  const inputFileRef = useRef(null);

  const [archivoPendiente, setArchivoPendiente] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [certificado, setCertificado] = useState(false);
  const [usarComoAvatar, setUsarComoAvatar] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function seleccionarArchivo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setErrorFoto("");
    setArchivoPendiente(archivo);
    setPreviewUrl(URL.createObjectURL(archivo));
    setCaption("");
    setCertificado(false);
    setUsarComoAvatar(false);
  }

  function cancelarSubida() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArchivoPendiente(null);
    setPreviewUrl(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  async function confirmarSubida() {
    if (!archivoPendiente || !certificado) return;
    setSubiendo(true);
    setErrorFoto("");

    const formData = new FormData();
    formData.append("file", archivoPendiente);
    formData.append("caption", caption);
    formData.append("certifico", "true");

    const res = await fetch("/api/perfil/fotos", { method: "POST", body: formData });
    const data = await res.json();
    setSubiendo(false);

    if (!res.ok) {
      setErrorFoto(data.error || "No se pudo subir la foto.");
      return;
    }

    let foto = data.foto;
    if (usarComoAvatar) {
      await fetch("/api/perfil/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: foto.id }),
      });
      foto = { ...foto, is_avatar: true };
      setFotos((f) => [foto, ...f.map((x) => ({ ...x, is_avatar: false }))]);
    } else {
      setFotos((f) => [foto, ...f]);
    }

    cancelarSubida();
  }

  async function borrarFoto(id) {
    setFotos((f) => f.filter((foto) => foto.id !== id));
    await fetch(`/api/perfil/fotos?id=${id}`, { method: "DELETE" });
  }

  async function marcarAvatar(id) {
    setFotos((f) => f.map((foto) => ({ ...foto, is_avatar: foto.id === id })));
    await fetch("/api/perfil/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: id }),
    });
  }

  async function togglePrivada(id, valorActual) {
    setFotos((f) => f.map((foto) => (foto.id === id ? { ...foto, is_private: !valorActual } : foto)));
    await fetch("/api/perfil/fotos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: id, isPrivate: !valorActual }),
    });
  }

  const botonSubir = (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid var(--gold)",
        color: "var(--gold)",
        padding: "11px 22px",
        fontFamily: "var(--font-body)",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 2,
        cursor: "pointer",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--gold)";
        e.currentTarget.style.color = "var(--bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--gold)";
      }}
    >
      <Upload size={15} />
      Subir foto
      <input
        ref={inputFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={seleccionarArchivo}
      />
    </label>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <h2 className="heading" style={{ fontSize: 24, color: "var(--text)" }}>
          Mis fotos
        </h2>
        {botonSubir}
      </div>
      {errorFoto && (
        <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{errorFoto}</p>
      )}

      {fotos.length === 0 ? (
        <div style={{ marginTop: 16 }}>
          <EmptyState texto="Sube tu primera foto" alto={160} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>{botonSubir}</div>
        </div>
      ) : (
        <div className="fotos-grid-2a" style={{ marginTop: 32 }}>
          {fotos.map((foto) => {
            const badge = ESTADO_BADGE[foto.status];
            const noAprobada = foto.status !== "approved";
            return (
              <div
                key={foto.id}
                className="group"
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  border: "1px solid rgba(201,161,90,0.2)",
                }}
              >
                <Image
                  src={`/uploads/${usuarioId}/${foto.filename}`}
                  alt=""
                  fill
                  unoptimized={false}
                  style={{
                    objectFit: "cover",
                    opacity: noAprobada ? 0.5 : 1,
                    filter: noAprobada ? "grayscale(30%)" : "none",
                  }}
                />
                {badge && (
                  <span
                    style={{
                      position: "absolute",
                      right: 6,
                      top: 6,
                      fontFamily: "var(--font-body)",
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      padding: "3px 7px",
                      border: `1px solid ${badge.color}`,
                      color: badge.color,
                      background: "rgba(14,10,11,0.7)",
                    }}
                  >
                    {badge.texto}
                  </span>
                )}
                {foto.is_avatar && (
                  <Star
                    size={18}
                    fill="var(--gold)"
                    color="var(--gold)"
                    style={{ position: "absolute", left: 6, bottom: 6 }}
                  />
                )}

                <div
                  className="fotos-grid__overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: "rgba(14,10,11,0.75)",
                    padding: 8,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  {!foto.is_avatar && (
                    <button type="button" onClick={() => marcarAvatar(foto.id)} className="foto-overlay-btn">
                      Avatar
                    </button>
                  )}
                  <button type="button" onClick={() => togglePrivada(foto.id, foto.is_private)} className="foto-overlay-btn">
                    {foto.is_private ? "Pública" : "Privada"}
                  </button>
                  <button
                    type="button"
                    onClick={() => borrarFoto(foto.id)}
                    className="foto-overlay-btn"
                    style={{ borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {archivoPendiente && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(14,10,11,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--surface)",
              border: "1px solid var(--border-gold)",
              padding: 28,
            }}
          >
            <h3 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>
              Confirmar foto
            </h3>

            {previewUrl && (
              <div
                style={{
                  marginTop: 16,
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  border: "1px solid rgba(201,161,90,0.2)",
                  overflow: "hidden",
                }}
              >
                {/* Preview local del archivo aún no subido: no puede pasar
                    por el optimizador de next/image (no es una URL propia
                    del sitio), así que aquí sí toca <img> plano. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}

            <label style={{ display: "block", marginTop: 18 }}>
              <span className="label-field">Pie de foto (opcional)</span>
              <input
                type="text"
                maxLength={200}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-field"
                placeholder="Escribe algo sobre esta foto…"
              />
            </label>

            <label
              style={{
                display: "flex",
                gap: 8,
                marginTop: 18,
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

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--text)",
              }}
            >
              <input
                type="checkbox"
                checked={usarComoAvatar}
                onChange={(e) => setUsarComoAvatar(e.target.checked)}
                className="checkbox-gold"
              />
              Usar como avatar
            </label>

            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={cancelarSubida}
                disabled={subiendo}
                className="btn-outline-gold"
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarSubida}
                disabled={!certificado || subiendo}
                className="btn-gold"
                style={{ flex: 1, opacity: !certificado || subiendo ? 0.5 : 1 }}
              >
                {subiendo ? "Subiendo…" : "Subir foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

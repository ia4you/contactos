"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Star } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

const ESTADO_BADGE = {
  pending: { texto: "En revisión", color: "#c9a15a" },
  approved: { texto: "Aprobada", color: "#4a9a6a" },
  rejected: { texto: "Rechazada", color: "#9a3a3a" },
};

export function TabFotos({ usuarioId, fotos, setFotos }) {
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const inputFileRef = useRef(null);

  async function subirFoto(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setErrorFoto("");
    setSubiendo(true);

    const formData = new FormData();
    formData.append("file", archivo);

    const res = await fetch("/api/perfil/fotos", { method: "POST", body: formData });
    const data = await res.json();
    setSubiendo(false);
    if (inputFileRef.current) inputFileRef.current.value = "";

    if (!res.ok) {
      setErrorFoto(data.error || "No se pudo subir la foto.");
      return;
    }
    setFotos((f) => [data.foto, ...f]);
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
      {subiendo ? "Subiendo…" : "Subir foto"}
      <input
        ref={inputFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        disabled={subiendo}
        onChange={subirFoto}
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
    </div>
  );
}

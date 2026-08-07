"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Eye } from "lucide-react";
import { avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";

export function HistoriaViewer({ grupos, indiceGrupoInicial, meId, onClose }) {
  const [grupoIndex, setGrupoIndex] = useState(indiceGrupoInicial);
  const [historiaIndex, setHistoriaIndex] = useState(0);

  const grupo = grupos[grupoIndex];
  const historia = grupo?.historias[historiaIndex];

  function siguiente() {
    if (!grupo) return;
    if (historiaIndex + 1 < grupo.historias.length) {
      setHistoriaIndex((i) => i + 1);
    } else if (grupoIndex + 1 < grupos.length) {
      setGrupoIndex((g) => g + 1);
      setHistoriaIndex(0);
    } else {
      onClose();
    }
  }

  function anterior() {
    if (historiaIndex > 0) {
      setHistoriaIndex((i) => i - 1);
    } else if (grupoIndex > 0) {
      const grupoPrevio = grupos[grupoIndex - 1];
      setGrupoIndex((g) => g - 1);
      setHistoriaIndex(grupoPrevio.historias.length - 1);
    }
  }

  useEffect(() => {
    if (!historia) return;
    if (historia.user_id !== meId) {
      fetch(`/api/historias/${historia.id}/vista`, { method: "POST" }).catch(() => {});
    }
    const timer = setTimeout(siguiente, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoIndex, historiaIndex]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") siguiente();
      if (e.key === "ArrowLeft") anterior();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoIndex, historiaIndex]);

  if (!grupo || !historia) return null;

  const avatarUrl = avatarSrc(grupo.userId, grupo.avatarFilename, grupo.profileType);
  const esDueno = grupo.userId === meId;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 420, height: "100%", maxHeight: 760, background: "#0e0a0b", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 10, left: 10, right: 10, zIndex: 3, display: "flex", gap: 4 }}>
          {grupo.historias.map((h, i) => (
            <div key={h.id} style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
              <div
                key={i < historiaIndex ? "full" : i === historiaIndex ? `${grupoIndex}-${historiaIndex}` : "empty"}
                className={i === historiaIndex ? "historia-progreso-fill" : ""}
                style={{
                  height: "100%",
                  background: "#fff",
                  width: i < historiaIndex ? "100%" : i === historiaIndex ? undefined : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: 24, left: 14, right: 14, zIndex: 3, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.4)" }}>
            <Image src={avatarUrl} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#fff", fontWeight: 500 }}>{grupo.nick}</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{tiempoRelativo(historia.created_at)}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}
          >
            <X size={22} />
          </button>
        </div>

        <div
          style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {historia.tipo === "foto" ? (
            <>
              <Image
                src={`/uploads/${grupo.userId}/${historia.photo_filename}`}
                alt=""
                fill
                unoptimized={false}
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.6) 100%)",
                }}
              />
              {historia.contenido && (
                <p style={{ position: "absolute", left: 20, right: 20, bottom: 24, fontFamily: "var(--font-body)", fontSize: 14, color: "#fff" }}>
                  {historia.contenido}
                </p>
              )}
            </>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at 50% 30%, rgba(107,21,36,0.6), #0e0a0b 75%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 32,
              }}
            >
              <p className="heading" style={{ fontSize: 26, color: "var(--text)", textAlign: "center", lineHeight: 1.4 }}>
                {historia.contenido}
              </p>
            </div>
          )}
        </div>

        {esDueno && (
          <div style={{ position: "absolute", bottom: 16, left: 20, zIndex: 3, display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
            <Eye size={14} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12 }}>{historia.vistas_count} vistas</span>
          </div>
        )}

        <button
          type="button"
          onClick={anterior}
          aria-label="Anterior"
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "35%", background: "none", border: "none", cursor: "pointer", zIndex: 2 }}
        />
        <button
          type="button"
          onClick={siguiente}
          aria-label="Siguiente"
          style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "35%", background: "none", border: "none", cursor: "pointer", zIndex: 2 }}
        />
      </div>
    </div>
  );
}

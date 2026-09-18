"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";

const SWIPE_MIN_PX = 50;

export function FotoLightbox({ usuarioId, fotos, indiceInicial, onClose }) {
  const [indice, setIndice] = useState(indiceInicial);
  const touchStartX = useRef(null);

  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);
  const [comentarios, setComentarios] = useState(null);
  const [comentariosCount, setComentariosCount] = useState(fotos[indiceInicial]?.comentariosCount ?? 0);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState("");

  // Al pasar a otra foto del carrusel, la sección de comentarios vuelve a
  // su estado inicial (cerrada, sin comentarios cargados) — son de una
  // publicación distinta, no tendría sentido arrastrar el estado anterior.
  useEffect(() => {
    setComentariosAbiertos(false);
    setComentarios(null);
    setComentariosCount(fotos[indice]?.comentariosCount ?? 0);
    setNuevoComentario("");
    setErrorComentario("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice]);

  function anterior() {
    setIndice((i) => (i - 1 + fotos.length) % fotos.length);
  }
  function siguiente() {
    setIndice((i) => (i + 1) % fotos.length);
  }

  // Bloquea el scroll del fondo mientras el lightbox está abierto.
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") anterior();
      else if (e.key === "ArrowRight") siguiente();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotos.length]);

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_MIN_PX) return;
    if (delta > 0) anterior();
    else siguiente();
  }

  const foto = fotos[indice];
  const tieneComentarios = foto.publicacionId != null;

  async function toggleComentarios(e) {
    e.stopPropagation();
    setComentariosAbiertos((v) => !v);
    if (!comentarios) {
      const res = await fetch(`/api/feed/publicaciones/${foto.publicacionId}/comentarios`);
      const data = await res.json().catch(() => null);
      setComentarios(data?.comentarios || []);
    }
  }

  async function enviarComentario() {
    const texto = nuevoComentario.trim();
    if (!texto || enviandoComentario) return;
    setErrorComentario("");
    setEnviandoComentario(true);
    const res = await fetch("/api/feed/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicacionId: foto.publicacionId, texto }),
    });
    const data = await res.json().catch(() => null);
    setEnviandoComentario(false);
    if (res.ok && data) {
      setComentarios((c) => [...(c || []), data.comentario]);
      setComentariosCount((n) => n + 1);
      setNuevoComentario("");
      return;
    }
    setErrorComentario(data?.error || "No se pudo enviar el comentario.");
  }

  return (
    <div
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 2,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.08)",
          border: "none",
          borderRadius: "50%",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <X size={22} />
      </button>

      {tieneComentarios && (
        <button
          type="button"
          onClick={toggleComentarios}
          aria-label="Comentarios"
          style={{
            position: "absolute",
            top: 20,
            right: 72,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 40,
            padding: "0 14px",
            background: comentariosAbiertos ? "var(--gold)" : "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: 20,
            color: comentariosAbiertos ? "var(--bg)" : "#fff",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 13,
          }}
        >
          <MessageCircle size={16} />
          {comentariosCount > 0 && comentariosCount}
        </button>
      )}

      {fotos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              anterior();
            }}
            aria-label="Foto anterior"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "50%",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              siguiente();
            }}
            aria-label="Foto siguiente"
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "50%",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "90vw",
          height: "90vh",
        }}
      >
        <Image
          src={avatarSrc(usuarioId, foto.filename, null)}
          alt=""
          fill
          unoptimized={false}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ objectFit: "contain" }}
        />
      </div>

      {tieneComentarios && comentariosAbiertos && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            maxHeight: "45vh",
            overflowY: "auto",
            background: "rgba(14,10,11,0.92)",
            borderTop: "1px solid rgba(201,161,90,0.25)",
            padding: 20,
          }}
        >
          {comentarios === null ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Cargando…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {comentarios.length === 0 && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  Todavía no hay comentarios.
                </p>
              )}
              {comentarios.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Link
                    href={`/perfil/${c.nick}`}
                    style={{ position: "relative", width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}
                  >
                    <Image
                      src={avatarSrc(c.user_id, c.avatar_filename, c.profile_type)}
                      alt=""
                      fill
                      unoptimized={false}
                      style={{ objectFit: "cover" }}
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/perfil/${c.nick}`}
                      style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#fff", fontWeight: 500, textDecoration: "none" }}
                    >
                      {c.nick}
                    </Link>{" "}
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                      {c.texto}
                    </span>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                      {tiempoRelativo(c.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <input
              type="text"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarComentario()}
              placeholder="Escribe un comentario…"
              maxLength={500}
              className="input-field"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={enviarComentario}
              disabled={enviandoComentario || !nuevoComentario.trim()}
              className="btn-outline-gold"
            >
              Enviar
            </button>
          </div>
          {errorComentario && (
            <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 12.5, color: "#e07a7a" }}>{errorComentario}</p>
          )}
        </div>
      )}
    </div>
  );
}

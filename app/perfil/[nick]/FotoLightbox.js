"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { avatarSrc } from "@/lib/constants";

const SWIPE_MIN_PX = 50;

export function FotoLightbox({ usuarioId, fotos, indiceInicial, onClose }) {
  const [indice, setIndice] = useState(indiceInicial);
  const touchStartX = useRef(null);

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
    </div>
  );
}

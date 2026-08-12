"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { ReportButton } from "../../components/ReportButton";
import { avatarSrc } from "@/lib/constants";

function FotoItem({ usuarioId, foto, esPropio, destacada }) {
  const [meGusta, setMeGusta] = useState(foto.meGusta);
  const [likesCount, setLikesCount] = useState(foto.likesCount);
  const [cargando, setCargando] = useState(false);

  async function toggleLike(e) {
    e.stopPropagation();
    if (cargando) return;
    setCargando(true);
    const res = await fetch("/api/likes/foto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_id: foto.id }),
    });
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (res.ok && data) {
      setMeGusta(data.meGusta);
      setLikesCount(data.likesCount);
    }
  }

  return (
    <div id={`foto-${foto.id}`}>
      <div
        className={destacada ? "group foto-destacada" : "group"}
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          border: "1px solid rgba(201,161,90,0.2)",
        }}
      >
        <Image
          src={avatarSrc(usuarioId, foto.filename, null)}
          alt=""
          fill
          unoptimized={false}
          style={{ objectFit: "cover" }}
        />

        {!esPropio && (
          <div
            className="fotos-grid__overlay"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "space-between",
              padding: 8,
            }}
          >
            <button
              type="button"
              onClick={toggleLike}
              aria-label="Me gusta"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                border: "none",
                borderRadius: "50%",
                background: "rgba(14,10,11,0.75)",
                color: meGusta ? "var(--gold)" : "var(--text)",
                cursor: "pointer",
              }}
            >
              <Heart size={15} fill={meGusta ? "var(--gold)" : "none"} />
            </button>

            <ReportButton
              reportedUserId={usuarioId}
              label="Denunciar"
              className="foto-overlay-btn"
              style={{
                width: "auto",
                alignSelf: "stretch",
                borderColor: "rgba(154,58,58,0.5)",
                color: "#e07a7a",
                background: "rgba(14,10,11,0.75)",
                padding: "6px 12px",
              }}
            />
          </div>
        )}
      </div>
      {likesCount > 0 && (
        <p
          style={{
            marginTop: 6,
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Heart size={11} fill="var(--gold)" color="var(--gold)" />
          {likesCount}
        </p>
      )}
    </div>
  );
}

export function FotosGridPublico({ usuarioId, fotos, esPropio }) {
  const [fotoDestacadaId, setFotoDestacadaId] = useState(null);

  // Deep link desde una notificación de like ("/perfil/nick#foto-123"): hace
  // scroll hasta la foto y la resalta un instante para que quede claro cuál
  // es, sin depender de que el usuario la busque en la cuadrícula.
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#foto-(\d+)$/);
    if (!match) return;
    const id = Number(match[1]);
    document.getElementById(`foto-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFotoDestacadaId(id);
  }, []);

  return (
    <div className="fotos-grid-2a">
      {fotos.map((foto) => (
        <FotoItem
          key={foto.id}
          usuarioId={usuarioId}
          foto={foto}
          esPropio={esPropio}
          destacada={foto.id === fotoDestacadaId}
        />
      ))}
    </div>
  );
}

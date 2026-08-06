"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Flame } from "lucide-react";
import { ISLANDS, PROFILE_TYPES } from "@/lib/constants";
import { mostrarPuntoOnline } from "@/lib/online";
import { ReportButton } from "../../components/ReportButton";
import { BlockButton } from "../../components/BlockButton";
import { PuntoOnline } from "../../components/PuntoOnline";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

function CompatibilidadBadge({ pct }) {
  let color = "var(--text-muted)";
  let Icono = null;
  if (pct > 80) {
    color = "#4ade80";
    Icono = Flame;
  } else if (pct > 50) {
    color = "var(--gold)";
    Icono = Heart;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "var(--font-body)",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 1,
        color,
        border: `1px solid ${color}`,
        padding: "4px 10px",
      }}
    >
      {Icono && <Icono size={11} fill={color} />}
      {pct}% de afinidad
    </span>
  );
}

function GrupoChips({ titulo, valores }) {
  if (!valores || valores.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "var(--text-muted)",
          marginRight: 8,
        }}
      >
        {titulo}:
      </span>
      <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
        {valores.map((v) => (
          <span key={v} className="badge-gold">
            {v}
          </span>
        ))}
      </span>
    </div>
  );
}

const estiloBadgeSolido = {
  display: "inline-block",
  fontFamily: "var(--font-body)",
  background: "var(--gold)",
  color: "var(--bg)",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  padding: "4px 10px",
};

const estiloBotonBase = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "11px 22px",
  fontFamily: "var(--font-body)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 2,
  cursor: "pointer",
  background: "transparent",
};

export function PerfilCabecera({
  usuario,
  avatarSrc,
  miembroDesde,
  esPropio,
  estadoInicial,
  compatibilidad,
}) {
  const router = useRouter();
  const [meGusta, setMeGusta] = useState(estadoInicial.meGusta);
  const [match, setMatch] = useState(estadoInicial.match);
  const [amistad, setAmistad] = useState(estadoInicial.amistad); // null | 'enviada' | 'recibida' | 'amigos'
  const [cargandoLike, setCargandoLike] = useState(false);
  const [cargandoAmistad, setCargandoAmistad] = useState(false);
  const [cargandoMensaje, setCargandoMensaje] = useState(false);
  const online = mostrarPuntoOnline(usuario, esPropio);

  async function toggleLike() {
    if (cargandoLike) return;
    setCargandoLike(true);
    const res = await fetch("/api/likes/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_id: usuario.id }),
    });
    const data = await res.json().catch(() => null);
    setCargandoLike(false);
    if (res.ok && data) {
      setMeGusta(data.meGusta);
      if (data.match) setMatch(true);
    }
  }

  async function solicitarAmistad() {
    setCargandoAmistad(true);
    const res = await fetch("/api/amistades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_id: usuario.id }),
    });
    const data = await res.json().catch(() => null);
    setCargandoAmistad(false);
    if (res.ok && data) {
      setAmistad(data.status === "accepted" ? "amigos" : "enviada");
    }
  }

  async function responderAmistad(accion) {
    setCargandoAmistad(true);
    const res = await fetch(`/api/amistades/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    setCargandoAmistad(false);
    if (res.ok) {
      setAmistad(accion === "aceptar" ? "amigos" : null);
    }
  }

  async function enviarMensaje() {
    setCargandoMensaje(true);
    const res = await fetch("/api/mensajes/iniciar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user_id: usuario.id }),
    });
    const data = await res.json().catch(() => null);
    setCargandoMensaje(false);
    if (res.ok && data?.conversacionId) {
      router.push(`/mensajes?con=${data.conversacionId}`);
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid rgba(201,161,90,0.18)",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--gold)",
              }}
            >
              <Image src={avatarSrc} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
            </div>
            {online && <PuntoOnline size={16} />}
          </div>

          <div style={{ maxWidth: 480 }}>
            <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
              {usuario.nick}
            </h1>

            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span className="badge-gold">{ISLAND_LABEL[usuario.island]}</span>
              {compatibilidad && <CompatibilidadBadge pct={compatibilidad.pct} />}
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-body)",
                  background: "var(--surface)",
                  border: "1px solid var(--border-gold)",
                  color: "var(--text)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  padding: "4px 10px",
                }}
              >
                {PROFILE_TYPE_LABEL[usuario.profile_type]}
              </span>
              {usuario.verified && <span style={estiloBadgeSolido}>Verificado</span>}
              {!esPropio && match && <span style={estiloBadgeSolido}>✓ Match</span>}
              {!esPropio && amistad === "amigos" && <span style={estiloBadgeSolido}>Amigos</span>}
            </div>

            <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
              Miembro desde {miembroDesde}
            </p>

            {usuario.bio && (
              <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
                {usuario.bio}
              </p>
            )}

            <GrupoChips titulo="Género" valores={usuario.genero} />
            <GrupoChips titulo="Orientación" valores={usuario.orientacion} />
            <GrupoChips titulo="Rol" valores={usuario.rol} />
          </div>
        </div>

        {!esPropio && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignSelf: "flex-start" }}>
            <button
              type="button"
              onClick={toggleLike}
              disabled={cargandoLike}
              style={{
                ...estiloBotonBase,
                border: "1px solid var(--gold)",
                color: meGusta ? "var(--bg)" : "var(--gold)",
                background: meGusta ? "var(--gold)" : "transparent",
              }}
            >
              <Heart size={15} fill={meGusta ? "var(--bg)" : "none"} />
              {meGusta ? "Te gusta" : "Dar like"}
            </button>

            {amistad === "amigos" ? null : amistad === "enviada" ? (
              <button
                type="button"
                disabled
                style={{ ...estiloBotonBase, border: "1px solid rgba(244,234,217,0.2)", color: "var(--text-muted)", cursor: "not-allowed" }}
              >
                Solicitud enviada
              </button>
            ) : amistad === "recibida" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => responderAmistad("aceptar")}
                  disabled={cargandoAmistad}
                  className="btn-gold"
                  style={{ flex: 1, fontSize: 12 }}
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  onClick={() => responderAmistad("rechazar")}
                  disabled={cargandoAmistad}
                  style={{ ...estiloBotonBase, flex: 1, border: "1px solid rgba(244,234,217,0.3)", color: "var(--text-secondary)" }}
                >
                  Rechazar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={solicitarAmistad}
                disabled={cargandoAmistad}
                style={{ ...estiloBotonBase, border: "1px solid var(--gold)", color: "var(--gold)" }}
              >
                Solicitar amistad
              </button>
            )}

            <button
              type="button"
              onClick={enviarMensaje}
              disabled={cargandoMensaje}
              style={{
                ...estiloBotonBase,
                border: "1px solid rgba(244,234,217,0.3)",
                color: "var(--text)",
              }}
            >
              Enviar mensaje
            </button>

            <ReportButton
              reportedUserId={usuario.id}
              label="Denunciar perfil"
              style={{
                ...estiloBotonBase,
                border: "1px solid rgba(154,58,58,0.5)",
                color: "#e07a7a",
              }}
            />

            <BlockButton
              blockedId={usuario.id}
              label="Bloquear"
              style={{
                ...estiloBotonBase,
                border: "1px solid rgba(244,234,217,0.3)",
                color: "var(--text-secondary)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

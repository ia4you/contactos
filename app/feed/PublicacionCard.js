"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, X } from "lucide-react";
import { ISLANDS, PROFILE_TYPES, avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { mostrarPuntoOnline } from "@/lib/online";
import { PuntoOnline } from "../components/PuntoOnline";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

function CabeceraUsuario({ userId, nick, profileType, island, avatarFilename, tiempo, lastActive, showLastSeen }) {
  const src = avatarSrc(userId, avatarFilename, profileType);
  const online = mostrarPuntoOnline({ last_active: lastActive, show_last_seen: showLastSeen });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
          <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
        {online && <PuntoOnline />}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href={`/perfil/${nick}`} className="heading" style={{ fontSize: 16, color: "var(--text)", textDecoration: "none" }}>
            {nick}
          </Link>
          <span className="badge-gold" style={{ fontSize: 9, padding: "2px 7px" }}>{ISLAND_LABEL[island]}</span>
        </div>
        {tiempo && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>{tiempo}</span>
        )}
      </div>
    </div>
  );
}

export function AnuncioCardFeed({ anuncio, usuarioActualId, onEliminar }) {
  const esPropio = String(anuncio.user_id) === String(usuarioActualId);

  async function eliminar() {
    if (!window.confirm("¿Eliminar tu anuncio?")) return;
    onEliminar(anuncio.id);
    await fetch(`/api/anuncios/${anuncio.id}`, { method: "DELETE" });
  }

  return (
    <div style={{ position: "relative", background: "#141414", border: "1px solid #2a2a2a", padding: 20, marginBottom: 16 }}>
      <span
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          fontFamily: "var(--font-body)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          padding: "5px 12px",
          background: "var(--gold-light)",
          color: "var(--bg)",
        }}
      >
        Anuncio
      </span>

      <CabeceraUsuario
        userId={anuncio.user_id}
        nick={anuncio.nick}
        profileType={anuncio.profile_type}
        island={anuncio.island}
        avatarFilename={anuncio.avatar_filename}
      />

      <span className="badge-gold" style={{ marginTop: 12, display: "inline-block" }}>
        {PROFILE_TYPE_LABEL[anuncio.profile_type]}
      </span>

      <h3 className="heading" style={{ marginTop: 10, fontSize: 18, color: "var(--text)" }}>
        {anuncio.titulo}
      </h3>
      <p
        style={{
          marginTop: 6,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--text-secondary)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {anuncio.descripcion}
      </p>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {esPropio && (
          <button
            type="button"
            onClick={eliminar}
            className="btn-outline-gold"
            style={{ borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}
          >
            Eliminar
          </button>
        )}
        <Link href={`/perfil/${anuncio.nick}`} className="btn-outline-gold">
          Ver perfil
        </Link>
      </div>
    </div>
  );
}

const TIPO_EVENTO_LABEL = { quedada: "Quedada", fiesta: "Fiesta", club: "Club", otro: "Otro" };

function formatearFechaEvento(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  );
}

export function EventoCardFeed({ evento, usuarioActualId, onEliminar }) {
  const esPropio = String(evento.user_id) === String(usuarioActualId);

  async function eliminar() {
    if (!window.confirm("¿Eliminar este evento?")) return;
    onEliminar(evento.id);
    await fetch(`/api/eventos/${evento.id}`, { method: "DELETE" });
  }

  return (
    <div style={{ position: "relative", background: "#141414", border: "1px solid #2a2a2a", marginBottom: 16, overflow: "hidden" }}>
      <span
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          zIndex: 1,
          fontFamily: "var(--font-body)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          padding: "5px 12px",
          background: "var(--gold-light)",
          color: "var(--bg)",
        }}
      >
        Evento
      </span>

      {evento.foto && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
          <Image src={`/uploads/eventos/${evento.foto}`} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
      )}

      <div style={{ padding: 20 }}>
        <span className="badge-gold" style={{ fontSize: 9 }}>{TIPO_EVENTO_LABEL[evento.tipo]}</span>

        <h3 className="heading" style={{ marginTop: 10, fontSize: 18, color: "var(--text)" }}>
          {evento.titulo}
        </h3>
        <p style={{ marginTop: 6, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>
          {formatearFechaEvento(evento.fecha_evento)}
        </p>
        {evento.lugar && (
          <p style={{ marginTop: 2, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
            {evento.lugar} · {ISLAND_LABEL[evento.isla]}
          </p>
        )}

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {esPropio && (
            <button
              type="button"
              onClick={eliminar}
              className="btn-outline-gold"
              style={{ borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}
            >
              Eliminar
            </button>
          )}
          <Link href={`/eventos/${evento.id}`} className="btn-outline-gold">
            Ver evento
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PublicacionCard({ publicacion, usuarioActualId, onEliminar }) {
  const p = publicacion;
  const [meGusta, setMeGusta] = useState(p.me_gusta);
  const [likesCount, setLikesCount] = useState(p.likes_count);
  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);
  const [comentarios, setComentarios] = useState(null);
  const [comentariosCount, setComentariosCount] = useState(p.comentarios_count);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [eliminada, setEliminada] = useState(false);

  const esPropia = String(p.user_id) === String(usuarioActualId);

  async function toggleLike() {
    setMeGusta((v) => !v);
    setLikesCount((c) => (meGusta ? c - 1 : c + 1));
    const res = await fetch(`/api/feed/publicaciones/${p.id}/like`, { method: "POST" });
    const data = await res.json().catch(() => null);
    if (res.ok && data) {
      setMeGusta(data.meGusta);
      setLikesCount(data.likesCount);
    }
  }

  async function abrirComentarios() {
    setComentariosAbiertos((v) => !v);
    if (!comentarios) {
      const res = await fetch(`/api/feed/publicaciones/${p.id}/comentarios`);
      const data = await res.json().catch(() => null);
      setComentarios(data?.comentarios || []);
    }
  }

  async function enviarComentario() {
    const texto = nuevoComentario.trim();
    if (!texto || enviandoComentario) return;
    setEnviandoComentario(true);
    const res = await fetch("/api/feed/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicacionId: p.id, texto }),
    });
    const data = await res.json().catch(() => null);
    setEnviandoComentario(false);
    if (res.ok && data) {
      setComentarios((c) => [...(c || []), { ...data.comentario, avatar_filename: null }]);
      setComentariosCount((n) => n + 1);
      setNuevoComentario("");
    }
  }

  async function eliminar() {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    setEliminada(true);
    const res = await fetch(`/api/feed/publicaciones/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      onEliminar?.(p.id);
    } else {
      setEliminada(false);
    }
  }

  if (eliminada) return null;

  return (
    <div style={{ background: "#141414", border: "1px solid #2a2a2a", padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <CabeceraUsuario
          userId={p.user_id}
          nick={p.nick}
          profileType={p.profile_type}
          island={p.island}
          avatarFilename={p.avatar_filename}
          tiempo={tiempoRelativo(p.created_at)}
          lastActive={p.last_active}
          showLastSeen={p.show_last_seen}
        />
        {esPropia && (
          <button
            type="button"
            onClick={eliminar}
            aria-label="Eliminar publicación"
            className="icon-btn"
            style={{ padding: 4 }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        {p.tipo === "texto" ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text)", whiteSpace: "pre-wrap" }}>
            {p.contenido}
          </p>
        ) : (
          <>
            <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", overflow: "hidden" }}>
              <Image
                src={`/uploads/${p.user_id}/${p.photo_filename}`}
                alt=""
                fill
                unoptimized={false}
                style={{ objectFit: "cover" }}
              />
            </div>
            {p.contenido && (
              <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
                {p.contenido}
              </p>
            )}
          </>
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", borderTop: "1px solid rgba(201,161,90,0.12)", paddingTop: 12 }}>
        <button
          type="button"
          onClick={toggleLike}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            borderRight: "1px solid #2a2a2a",
            padding: "8px 0",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: meGusta ? "var(--gold)" : "var(--text-secondary)",
          }}
        >
          <Heart size={16} fill={meGusta ? "var(--gold)" : "none"} />
          Me gusta {likesCount > 0 && `(${likesCount})`}
        </button>
        <button
          type="button"
          onClick={abrirComentarios}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            padding: "8px 0",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: comentariosAbiertos ? "var(--gold)" : "var(--text-secondary)",
          }}
        >
          <MessageCircle size={16} />
          Comentar {comentariosCount > 0 && `(${comentariosCount})`}
        </button>
      </div>

      {comentariosAbiertos && (
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(201,161,90,0.12)", paddingTop: 14 }}>
          {comentarios === null ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>Cargando…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {comentarios.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ position: "relative", width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                    <Image
                      src={avatarSrc(c.user_id, c.avatar_filename, "chica")}
                      alt=""
                      fill
                      unoptimized={false}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                      {c.nick}
                    </span>{" "}
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
                      {c.texto}
                    </span>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
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
        </div>
      )}
    </div>
  );
}

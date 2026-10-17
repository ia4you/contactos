"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, X, Users } from "lucide-react";
import { ISLANDS, PROFILE_TYPES, avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { mostrarPuntoOnline } from "@/lib/online";
import { PuntoOnline } from "../components/PuntoOnline";
import { useConfirmar } from "../components/Confirmar";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));
const TIPO_EVENTO_LABEL = { quedada: "Quedada", fiesta: "Fiesta", club: "Club", otro: "Otro" };

// Base de todas las tarjetas del feed: sin caja, separadas por una regla
// inferior (estilo listado de revista) y con una etiqueta opcional.
function TarjetaFeed({ etiqueta, children }) {
  return (
    <article className="tarjeta-feed">
      {etiqueta && <span className="etiqueta-tarjeta tarjeta-feed__etiqueta">{etiqueta}</span>}
      {children}
    </article>
  );
}

function Acciones({ children }) {
  return <div className="tarjeta-feed__acciones">{children}</div>;
}

function BotonEliminar({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="btn-outline-gold btn-peligro">
      Eliminar
    </button>
  );
}

// `protegida`: fotos de usuarios, clubs y blog llevan la anticopia
// (sin menú contextual ni arrastre).
function ImagenFeed({ src, aspecto = "16 / 9", protegida, onDoubleClick, children }) {
  return (
    <div className="tarjeta-feed__media" style={{ aspectRatio: aspecto }} onDoubleClick={onDoubleClick}>
      <Image
        sizes="(max-width: 720px) 100vw, 680px"
        src={src}
        alt=""
        fill
        unoptimized={false}
        draggable={protegida ? false : undefined}
        onContextMenu={protegida ? (e) => e.preventDefault() : undefined}
        style={{ objectFit: "cover" }}
      />
      {children}
    </div>
  );
}

function CabeceraUsuario({ userId, nick, profileType, island, avatarFilename, tiempo, lastActive, showLastSeen }) {
  const src = avatarSrc(userId, avatarFilename, profileType);
  const online = mostrarPuntoOnline({ last_active: lastActive, show_last_seen: showLastSeen });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
      <Link href={`/perfil/${nick}`} tabIndex={-1} aria-hidden="true" style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
          <Image sizes="44px" src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
        {online && <PuntoOnline />}
      </Link>
      <div style={{ minWidth: 0 }}>
        <Link href={`/perfil/${nick}`} className="tarjeta-feed__nick">
          {nick}
        </Link>
        <p className="meta" style={{ marginTop: 2 }}>
          {ISLAND_LABEL[island]}
          {tiempo && ` · ${tiempo}`}
          {online && <span className="sr-only"> · en línea</span>}
        </p>
      </div>
    </div>
  );
}

// Fecha grande en Cormorant itálica dorada + día de la semana y mes cortos
// (SÁB · OCT), separada del contenido por una regla vertical.
function FechaEvento({ iso }) {
  const d = new Date(iso);
  const dia = d.toLocaleDateString("es-ES", { day: "numeric" });
  const mes = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  const semana = d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
  return (
    <time dateTime={iso} className="evento-fecha">
      <span className="numeral evento-fecha__dia">{dia}</span>
      <span className="evento-fecha__mes">
        {semana} · {mes}
      </span>
    </time>
  );
}

function horaEvento(iso) {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function CuerpoEvento({ iso, children }) {
  return (
    <div className="evento-fila" style={{ marginTop: 16 }}>
      <FechaEvento iso={iso} />
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function AnuncioCardFeed({ anuncio, usuarioActualId, onEliminar }) {
  const confirmar = useConfirmar();
  const esPropio = String(anuncio.user_id) === String(usuarioActualId);

  async function eliminar() {
    if (!(await confirmar({ mensaje: "¿Eliminar tu anuncio?", accion: "Eliminar" }))) return;
    onEliminar(anuncio.id);
    await fetch(`/api/anuncios/${anuncio.id}`, { method: "DELETE" });
  }

  return (
    <TarjetaFeed etiqueta={`Anuncio · ${PROFILE_TYPE_LABEL[anuncio.profile_type]}`}>
      <CabeceraUsuario
        userId={anuncio.user_id}
        nick={anuncio.nick}
        profileType={anuncio.profile_type}
        island={anuncio.island}
        avatarFilename={anuncio.avatar_filename}
      />
      <h3 className="tarjeta-feed__titulo" style={{ marginTop: 16 }}>
        {anuncio.titulo}
      </h3>
      <p
        style={{
          marginTop: 6,
          fontSize: 16,
          color: "var(--text-secondary)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {anuncio.descripcion}
      </p>
      <Acciones>
        {esPropio && <BotonEliminar onClick={eliminar} />}
        <Link href={`/perfil/${anuncio.nick}`} className="btn-outline-gold">
          Ver perfil
        </Link>
      </Acciones>
    </TarjetaFeed>
  );
}

export function EventoCardFeed({ evento, usuarioActualId, onEliminar }) {
  const confirmar = useConfirmar();
  const esPropio = String(evento.user_id) === String(usuarioActualId);

  async function eliminar() {
    if (!(await confirmar({ mensaje: "¿Eliminar este evento?", accion: "Eliminar" }))) return;
    onEliminar(evento.id);
    await fetch(`/api/eventos/${evento.id}`, { method: "DELETE" });
  }

  return (
    <TarjetaFeed etiqueta={`Evento · ${TIPO_EVENTO_LABEL[evento.tipo]}`}>
      {evento.foto && <ImagenFeed src={`/uploads/eventos/${evento.foto}`} />}
      <CuerpoEvento iso={evento.fecha_evento}>
        <h3 className="tarjeta-feed__titulo">{evento.titulo}</h3>
        <p className="meta" style={{ marginTop: 6 }}>
          {horaEvento(evento.fecha_evento)}
          {evento.lugar ? ` · ${evento.lugar}` : ""} · {ISLAND_LABEL[evento.isla]}
        </p>
        <Acciones>
          {esPropio && <BotonEliminar onClick={eliminar} />}
          <Link href={`/eventos/${evento.id}`} className="btn-outline-gold">
            Ver evento
          </Link>
        </Acciones>
      </CuerpoEvento>
    </TarjetaFeed>
  );
}

export function ClubEventoCardFeed({ evento }) {
  return (
    <TarjetaFeed etiqueta={`Club · ${evento.club_nombre}`}>
      {evento.foto && <ImagenFeed src={evento.foto} protegida />}
      <CuerpoEvento iso={evento.fecha_evento}>
        <h3 className="tarjeta-feed__titulo">{evento.titulo}</h3>
        <p className="meta" style={{ marginTop: 6 }}>
          {horaEvento(evento.fecha_evento)} · {ISLAND_LABEL[evento.isla]}
          {evento.precio && ` · ${evento.precio}`}
        </p>
        <Acciones>
          <Link href={`/clubs/${evento.club_slug}`} className="btn-outline-gold">
            Ver club
          </Link>
        </Acciones>
      </CuerpoEvento>
    </TarjetaFeed>
  );
}

export function BlogPostCardFeed({ post }) {
  return (
    <TarjetaFeed etiqueta="Blog">
      {post.foto && <ImagenFeed src={`/uploads/blog/${post.foto}`} protegida />}
      <h3 className="tarjeta-feed__titulo" style={{ marginTop: post.foto ? 16 : 0 }}>
        {post.titulo}
      </h3>
      {post.extracto && <p style={{ marginTop: 8, fontSize: 16, color: "var(--text-secondary)" }}>{post.extracto}</p>}
      <Acciones>
        <Link href={`/blog/${post.slug}`} className="btn-outline-gold">
          Leer artículo
        </Link>
      </Acciones>
    </TarjetaFeed>
  );
}

export function GrupoEventoCardFeed({ evento }) {
  const texto =
    evento.tipo === "creado" ? (
      <>
        <strong style={{ color: "var(--text)" }}>{evento.creador_nick}</strong> ha creado el grupo{" "}
        <strong style={{ color: "var(--text)" }}>{evento.grupo_nombre}</strong>
      </>
    ) : (
      <>
        Hay una nueva entrada en el grupo <strong style={{ color: "var(--text)" }}>{evento.grupo_nombre}</strong>
      </>
    );

  return (
    <TarjetaFeed etiqueta="Grupo">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: "50%",
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gold)",
          }}
        >
          <Users size={18} />
        </div>
        <p style={{ fontSize: 16, color: "var(--text-secondary)" }}>{texto}</p>
      </div>
      <Acciones>
        <Link href={`/grupos/${evento.grupo_id}`} className="btn-outline-gold">
          Ver grupo
        </Link>
      </Acciones>
    </TarjetaFeed>
  );
}

export function PublicacionCard({ publicacion, usuarioActualId, onEliminar }) {
  const p = publicacion;
  const confirmar = useConfirmar();
  const [meGusta, setMeGusta] = useState(p.me_gusta);
  const [likesCount, setLikesCount] = useState(p.likes_count);
  const [corazon, setCorazon] = useState(0);
  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);
  const [comentarios, setComentarios] = useState(null);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [comentariosCount, setComentariosCount] = useState(p.comentarios_count);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState("");
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

  // Doble clic sobre la foto: solo da like (nunca lo quita), como en las
  // fotos del perfil, y muestra el corazón animado.
  function likeDobleClick() {
    setCorazon((n) => n + 1);
    if (!meGusta) toggleLike();
  }

  async function abrirComentarios() {
    const seVaAAbrir = !comentariosAbiertos;
    setComentariosAbiertos(seVaAAbrir);
    // Al cerrar no hace falta pedir nada; al abrir, siempre se vuelve a
    // pedir al servidor (no solo la primera vez): el panel puede reabrirse
    // con comentarios nuevos de otros usuarios que la instancia actual del
    // componente nunca llegó a ver.
    if (!seVaAAbrir) return;
    setCargandoComentarios(true);
    const res = await fetch(`/api/feed/publicaciones/${p.id}/comentarios`);
    const data = await res.json().catch(() => null);
    setCargandoComentarios(false);
    setComentarios(data?.comentarios || []);
  }

  async function enviarComentario() {
    const texto = nuevoComentario.trim();
    if (!texto || enviandoComentario) return;
    setErrorComentario("");
    setEnviandoComentario(true);
    const res = await fetch("/api/feed/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicacionId: p.id, texto }),
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

  async function eliminar() {
    if (!(await confirmar({ mensaje: "¿Eliminar esta publicación?", accion: "Eliminar" }))) return;
    setEliminada(true);
    const res = await fetch(`/api/feed/publicaciones/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      onEliminar?.(p.id);
    } else {
      setEliminada(false);
    }
  }

  if (eliminada) return null;

  const idComentarios = `comentarios-${p.id}`;

  return (
    <TarjetaFeed>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
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
          <button type="button" onClick={eliminar} aria-label="Eliminar publicación" className="icon-btn">
            <X size={18} />
          </button>
        )}
      </div>

      {p.titulo && (
        <h3 className="tarjeta-feed__titulo" style={{ marginTop: 16, color: "var(--gold)" }}>
          {p.titulo}
        </h3>
      )}
      {p.tipo === "texto" ? (
        <p style={{ marginTop: 14, fontSize: 17, lineHeight: 1.6, color: "var(--text)", whiteSpace: "pre-wrap" }}>{p.contenido}</p>
      ) : (
        <>
          <ImagenFeed src={`/uploads/${p.user_id}/${p.photo_filename}`} aspecto="4 / 3" protegida onDoubleClick={likeDobleClick}>
            {corazon > 0 && (
              <div
                key={corazon}
                aria-hidden="true"
                style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}
              >
                <Heart size={88} fill="var(--gold)" color="var(--gold)" className="corazon-doble-click" />
              </div>
            )}
          </ImagenFeed>
          {p.contenido && <p style={{ marginTop: 12, fontSize: 16, color: "var(--text-secondary)" }}>{p.contenido}</p>}
        </>
      )}

      <div className="tarjeta-feed__interaccion">
        <button type="button" onClick={toggleLike} aria-pressed={meGusta} className="tarjeta-feed__boton">
          <Heart size={18} fill={meGusta ? "var(--gold)" : "none"} aria-hidden="true" />
          Me gusta {likesCount > 0 && `(${likesCount})`}
        </button>
        <button
          type="button"
          onClick={abrirComentarios}
          aria-expanded={comentariosAbiertos}
          aria-controls={idComentarios}
          className="tarjeta-feed__boton"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Comentar {comentariosCount > 0 && `(${comentariosCount})`}
        </button>
      </div>

      {comentariosAbiertos && (
        <div id={idComentarios} style={{ marginTop: 12, borderTop: "1px solid var(--rule)", paddingTop: 16 }}>
          {comentarios === null ? (
            <p className="meta">Cargando…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Ya hay comentarios en pantalla (de una apertura anterior):
                  se mantienen visibles mientras llega el refetch, en vez de
                  vaciar la lista, para que no "parpadee" a blanco. */}
              {cargandoComentarios && <p className="meta">Actualizando…</p>}
              {comentarios.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Link
                    href={`/perfil/${c.nick}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}
                  >
                    <Image sizes="32px" src={avatarSrc(c.user_id, c.avatar_filename, c.profile_type)} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                  </Link>
                  <div>
                    <Link href={`/perfil/${c.nick}`} style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>
                      {c.nick}
                    </Link>{" "}
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{c.texto}</span>
                    <div className="meta" style={{ marginTop: 2, fontSize: 12 }}>
                      {tiempoRelativo(c.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <label htmlFor={`nuevo-comentario-${p.id}`} className="sr-only">
              Escribe un comentario
            </label>
            <input
              id={`nuevo-comentario-${p.id}`}
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
            <p role="alert" style={{ marginTop: 8, fontSize: 14, color: "var(--danger)" }}>
              {errorComentario}
            </p>
          )}
        </div>
      )}
    </TarjetaFeed>
  );
}

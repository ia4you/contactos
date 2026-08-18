"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, ArrowLeft, Trash2 } from "lucide-react";
import { ISLANDS, avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { mostrarPuntoOnline } from "@/lib/online";
import { EmptyState } from "../components/EmptyState";
import { PuntoOnline } from "../components/PuntoOnline";
import { UsuarioBadge } from "../components/UsuarioBadge";
import { AvisoSeguridadBanner, AvisoSeguridadModal } from "../components/AvisoSeguridadMensajes";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

export function MensajesShell({ usuarioId }) {
  const [conversaciones, setConversaciones] = useState(null);
  const [subTab, setSubTab] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [activaId, setActivaId] = useState(null);
  const [otro, setOtro] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargandoChat, setCargandoChat] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetch("/api/mensajes")
      .then((r) => r.json())
      .then((d) => {
        setConversaciones(d.conversaciones || []);
        const params = new URLSearchParams(window.location.search);
        const con = params.get("con");
        if (con) setActivaId(Number(con));
      })
      .catch(() => setConversaciones([]));
  }, []);

  const cargarChat = useCallback(async (id) => {
    setCargandoChat(true);
    const res = await fetch(`/api/mensajes/${id}`);
    const data = await res.json().catch(() => null);
    setCargandoChat(false);
    if (!res.ok || !data) return;

    setOtro(data.otro);
    setMensajes(data.mensajes);
    await fetch(`/api/mensajes/${id}/leidos`, { method: "PATCH" });
    setConversaciones((prev) => (prev ? prev.map((c) => (c.id === id ? { ...c, no_leidos: 0 } : c)) : prev));
  }, []);

  useEffect(() => {
    if (activaId) cargarChat(activaId);
  }, [activaId, cargarChat]);

  // Los perfiles demo responden con un retraso de 3-8s generado en el
  // servidor (ver lib/demoReply.js); sin polling, la respuesta llegaría a
  // la BD pero no se vería en el chat abierto hasta recargar.
  useEffect(() => {
    if (!activaId || !otro?.is_demo) return;
    const intervalo = setInterval(async () => {
      const res = await fetch(`/api/mensajes/${activaId}`);
      const data = await res.json().catch(() => null);
      if (data) {
        setMensajes(data.mensajes);
        fetch(`/api/mensajes/${activaId}/leidos`, { method: "PATCH" }).catch(() => {});
      }
    }, 3000);
    return () => clearInterval(intervalo);
  }, [activaId, otro?.is_demo]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajes]);

  function abrirConversacion(id) {
    setActivaId(id);
    window.history.replaceState(null, "", `/mensajes?con=${id}`);
  }

  function ajustarAltura() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  async function enviar() {
    const t = texto.trim();
    if (!t || !otro || enviando) return;
    setEnviando(true);
    const res = await fetch("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user_id: otro.id, texto: t }),
    });
    const data = await res.json().catch(() => null);
    setEnviando(false);
    if (!res.ok || !data) return;

    setMensajes((prev) => [...prev, data.mensaje]);
    setTexto("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setConversaciones((prev) => {
      const existe = prev?.some((c) => c.id === data.conversacionId);
      const actualizada = {
        id: data.conversacionId,
        otro_id: otro.id,
        nick: otro.nick,
        profile_type: otro.profile_type,
        island: otro.island,
        avatar_filename: otro.avatar_filename,
        ultimo_texto: t,
        last_message_at: data.mensaje.created_at,
        no_leidos: 0,
      };
      if (!existe) return [actualizada, ...(prev || [])];
      return prev
        .map((c) => (c.id === data.conversacionId ? { ...c, ultimo_texto: t, last_message_at: data.mensaje.created_at } : c))
        .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
    });
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  async function eliminarMensaje(mensajeId) {
    if (!window.confirm("¿Eliminar este mensaje?")) return;
    setMensajes((prev) => prev.map((m) => (m.id === mensajeId ? { ...m, eliminado: true, texto: null } : m)));
    await fetch(`/api/mensajes/${activaId}/${mensajeId}`, { method: "DELETE" });
  }

  function volverALaLista() {
    setActivaId(null);
    setOtro(null);
    window.history.replaceState(null, "", "/mensajes");
  }

  const conversacionesFiltradas = (conversaciones || []).filter(
    (c) =>
      (subTab === "todas" || c.no_leidos > 0) &&
      (!busqueda.trim() || c.nick.toLowerCase().includes(busqueda.trim().toLowerCase()))
  );

  return (
    <div className="mensajes-page">
      <AvisoSeguridadModal usuarioId={usuarioId} />
      <AvisoSeguridadBanner />
      <div className={`mensajes-layout ${otro ? "chat-abierto" : ""}`}>
      <aside className="mensajes-sidebar" style={{ background: "#150f10", borderRight: "1px solid rgba(201,161,90,0.18)", overflowY: "auto" }}>
        <div style={{ padding: "20px 20px 12px" }}>
          <p className="kicker">Mensajes</p>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar conversación…"
            className="input-field"
            style={{ marginTop: 12, fontSize: 13, padding: "9px 12px" }}
          />
        </div>

        <div className="tab-nav" style={{ padding: "0 12px" }}>
          <button type="button" onClick={() => setSubTab("todas")} className={`tab-nav-item ${subTab === "todas" ? "active" : ""}`} style={{ padding: "10px 12px" }}>
            Todas
          </button>
          <button type="button" onClick={() => setSubTab("no_leidas")} className={`tab-nav-item ${subTab === "no_leidas" ? "active" : ""}`} style={{ padding: "10px 12px" }}>
            No leídas
          </button>
        </div>

        {conversaciones === null ? (
          <p style={{ padding: "0 20px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
            Cargando…
          </p>
        ) : conversaciones.length === 0 ? (
          <div style={{ padding: "0 12px" }}>
            <EmptyState texto="Cuando conectes con alguien podrás enviarle un mensaje" alto={120} />
          </div>
        ) : conversacionesFiltradas.length === 0 ? (
          <p style={{ padding: "20px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
            Sin resultados.
          </p>
        ) : (
          conversacionesFiltradas.map((c) => {
            const src = avatarSrc(c.otro_id, c.avatar_filename, c.profile_type);
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => abrirConversacion(c.id)}
                onKeyDown={(e) => e.key === "Enter" && abrirConversacion(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "14px 20px",
                  background: activaId === c.id ? "rgba(201,161,90,0.1)" : c.no_leidos > 0 ? "#1c1416" : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(201,161,90,0.08)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Link
                  href={`/perfil/${c.nick}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}
                >
                  <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                    <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                  </div>
                  {mostrarPuntoOnline(c) && <PuntoOnline />}
                  <UsuarioBadge badgeEspecial={c.badge_especial} isDemo={c.is_demo} style={{ fontSize: 6, padding: "1px 3px", bottom: -1, right: -1 }} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 14,
                          color: c.no_leidos > 0 ? "var(--text)" : "var(--text-muted)",
                          fontWeight: c.no_leidos > 0 ? 700 : 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.nick}
                      </span>
                      <span className="badge-gold" style={{ fontSize: 8, padding: "1px 5px", flexShrink: 0 }}>
                        {ISLAND_LABEL[c.island]}
                      </span>
                    </span>
                    {c.last_message_at && (
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
                        {tiempoRelativo(c.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 3 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 12,
                        color: c.no_leidos > 0 ? "var(--text)" : "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.ultimo_texto || "…"}
                    </span>
                    {c.no_leidos > 0 && (
                      <span
                        style={{
                          flexShrink: 0,
                          minWidth: 18,
                          height: 18,
                          borderRadius: 9,
                          background: "var(--gold)",
                          color: "var(--bg)",
                          fontSize: 10,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 5px",
                        }}
                      >
                        {c.no_leidos}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </aside>

      <section className="mensajes-chat" style={{ display: "flex", flexDirection: "column", background: "var(--bg)" }}>
        {!otro ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
              Selecciona una conversación
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 24px",
                borderBottom: "1px solid rgba(201,161,90,0.18)",
              }}
            >
              <button
                type="button"
                onClick={volverALaLista}
                aria-label="Volver a la lista"
                className="icon-btn mensajes-volver"
                style={{ flexShrink: 0 }}
              >
                <ArrowLeft size={20} />
              </button>
              <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                  <Image
                    src={avatarSrc(otro.id, otro.avatar_filename, otro.profile_type)}
                    alt=""
                    fill
                    unoptimized={false}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                {mostrarPuntoOnline(otro) && <PuntoOnline />}
                <UsuarioBadge badgeEspecial={otro.badge_especial} isDemo={otro.is_demo} style={{ fontSize: 6, padding: "1px 3px", bottom: -1, right: -1 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="heading" style={{ fontSize: 16, color: "var(--text)" }}>{otro.nick}</span>
                  <span className="badge-gold" style={{ fontSize: 9, padding: "2px 7px" }}>{ISLAND_LABEL[otro.island]}</span>
                </div>
              </div>
              <Link href={`/perfil/${otro.nick}`} className="nav-top-link" style={{ fontSize: 11 }}>
                Ver perfil
              </Link>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {cargandoChat ? (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                  Cargando…
                </p>
              ) : (
                mensajes.map((m) => {
                  const esMio = String(m.sender_id) === String(usuarioId);
                  return (
                    <div
                      key={m.id}
                      className="mensaje-fila"
                      style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: esMio ? "flex-end" : "flex-start" }}
                    >
                      {esMio && !m.eliminado && (
                        <button
                          type="button"
                          onClick={() => eliminarMensaje(m.id)}
                          aria-label="Eliminar mensaje"
                          className="icon-btn mensaje-borrar"
                          style={{ padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <div style={{ maxWidth: "70%" }}>
                        <div
                          style={{
                            padding: "10px 14px",
                            background: esMio ? "var(--gold)" : "var(--surface)",
                            color: esMio ? "var(--bg)" : "var(--text)",
                            fontFamily: "var(--font-body)",
                            fontSize: 14,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {m.eliminado ? (
                            <span style={{ fontStyle: "italic", color: esMio ? "rgba(14,10,11,0.6)" : "var(--text-muted)" }}>
                              Mensaje eliminado
                            </span>
                          ) : (
                            m.texto
                          )}
                        </div>
                        <div
                          style={{
                            marginTop: 3,
                            fontFamily: "var(--font-body)",
                            fontSize: 10,
                            color: "var(--text-muted)",
                            textAlign: esMio ? "right" : "left",
                          }}
                        >
                          {tiempoRelativo(m.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid rgba(201,161,90,0.18)" }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  ajustarAltura();
                }}
                onKeyDown={onKeyDown}
                placeholder="Escribe un mensaje…"
                maxLength={2000}
                className="input-field"
                style={{ flex: 1, resize: "none", maxHeight: 120 }}
              />
              <button
                type="button"
                onClick={enviar}
                disabled={enviando || !texto.trim()}
                className="btn-gold"
                style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-end" }}
              >
                <Send size={14} />
                Enviar
              </button>
            </div>
          </>
        )}
      </section>
      </div>
    </div>
  );
}

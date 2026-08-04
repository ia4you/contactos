"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send } from "lucide-react";
import { ISLANDS, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { EmptyState } from "../components/EmptyState";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

export function MensajesShell({ usuarioId }) {
  const [conversaciones, setConversaciones] = useState(null);
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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", height: "calc(100vh - 89px)" }}>
      <aside style={{ background: "#150f10", borderRight: "1px solid rgba(201,161,90,0.18)", overflowY: "auto" }}>
        <div style={{ padding: "20px 20px 12px" }}>
          <p className="kicker">Mensajes</p>
        </div>

        {conversaciones === null ? (
          <p style={{ padding: "0 20px", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
            Cargando…
          </p>
        ) : conversaciones.length === 0 ? (
          <div style={{ padding: "0 12px" }}>
            <EmptyState texto="Cuando conectes con alguien podrás enviarle un mensaje" alto={120} />
          </div>
        ) : (
          conversaciones.map((c) => {
            const src = c.avatar_filename
              ? `/uploads/${c.otro_id}/${c.avatar_filename}`
              : AVATAR_PLACEHOLDER[c.profile_type];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => abrirConversacion(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "14px 20px",
                  background: activaId === c.id ? "rgba(201,161,90,0.1)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(201,161,90,0.08)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)", fontWeight: 500 }}>
                      {c.nick}
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
              </button>
            );
          })
        )}
      </aside>

      <section style={{ display: "flex", flexDirection: "column", background: "var(--bg)" }}>
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
              <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                <Image
                  src={otro.avatar_filename ? `/uploads/${otro.id}/${otro.avatar_filename}` : AVATAR_PLACEHOLDER[otro.profile_type]}
                  alt=""
                  fill
                  unoptimized={false}
                  style={{ objectFit: "cover" }}
                />
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
                    <div key={m.id} style={{ display: "flex", justifyContent: esMio ? "flex-end" : "flex-start" }}>
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
                          {m.texto}
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
  );
}

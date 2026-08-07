"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send } from "lucide-react";
import { avatarSrc } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";

export function GrupoChatShell({ grupoId, usuarioId }) {
  const [grupo, setGrupo] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [mensajes, setMensajes] = useState(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch(`/api/grupos/${grupoId}`)
      .then((r) => r.json())
      .then((d) => {
        setGrupo(d.grupo);
        setMiembros(d.miembros || []);
        if (d.grupo?.soy_miembro) {
          fetch(`/api/grupos/${grupoId}/mensajes`)
            .then((r) => r.json())
            .then((dm) => setMensajes(dm.mensajes || []))
            .catch(() => setMensajes([]));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajes]);

  async function enviar() {
    const t = texto.trim();
    if (!t || enviando) return;
    setEnviando(true);
    const res = await fetch(`/api/grupos/${grupoId}/mensajes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: t }),
    });
    const data = await res.json().catch(() => null);
    setEnviando(false);
    if (res.ok && data) {
      setMensajes((prev) => [...(prev || []), data.mensaje]);
      setTexto("");
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  if (!grupo) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 0, maxWidth: 1000, margin: "0 auto" }} className="grupo-layout">
      <section style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 89px)", borderRight: "1px solid rgba(201,161,90,0.15)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(201,161,90,0.18)" }}>
          <h1 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>{grupo.nombre}</h1>
          <p style={{ marginTop: 3, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
            {grupo.miembros_count} miembros
          </p>
        </div>

        {!grupo.soy_miembro ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)", textAlign: "center" }}>
              Únete al grupo para ver y participar en la conversación.
            </p>
          </div>
        ) : (
          <>
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {mensajes === null ? (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>Cargando…</p>
              ) : mensajes.length === 0 ? (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                  Sé el primero en escribir en este grupo.
                </p>
              ) : (
                mensajes.map((m) => {
                  const esMio = String(m.user_id) === String(usuarioId);
                  const src = avatarSrc(m.user_id, m.avatar_filename, "chica");
                  return (
                    <div key={m.id} style={{ display: "flex", gap: 10, flexDirection: esMio ? "row-reverse" : "row" }}>
                      <div style={{ position: "relative", width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                        <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                      </div>
                      <div style={{ maxWidth: "65%" }}>
                        {!esMio && (
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>{m.nick}</span>
                        )}
                        <div
                          style={{
                            marginTop: 2,
                            padding: "8px 12px",
                            background: esMio ? "var(--gold)" : "var(--surface)",
                            color: esMio ? "var(--bg)" : "var(--text)",
                            fontFamily: "var(--font-body)",
                            fontSize: 13.5,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {m.texto}
                        </div>
                        <div style={{ marginTop: 2, fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-muted)", textAlign: esMio ? "right" : "left" }}>
                          {tiempoRelativo(m.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: "flex", gap: 10, padding: "14px 24px", borderTop: "1px solid rgba(201,161,90,0.18)" }}>
              <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribe un mensaje…"
                maxLength={2000}
                className="input-field"
                style={{ flex: 1 }}
              />
              <button type="button" onClick={enviar} disabled={enviando || !texto.trim()} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={14} />
                Enviar
              </button>
            </div>
          </>
        )}
      </section>

      <aside style={{ padding: "20px 16px", overflowY: "auto" }}>
        <p className="kicker" style={{ letterSpacing: 2 }}>Miembros</p>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {miembros.map((m) => {
            const src = avatarSrc(m.id, m.avatar_filename, m.profile_type);
            return (
              <Link key={m.id} href={`/perfil/${m.nick}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <div style={{ position: "relative", width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{m.nick}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

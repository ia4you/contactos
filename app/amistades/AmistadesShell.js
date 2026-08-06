"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ISLANDS, PROFILE_TYPES, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { mostrarPuntoOnline } from "@/lib/online";
import { EmptyState } from "../components/EmptyState";
import { PuntoOnline } from "../components/PuntoOnline";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const TABS = [
  { id: "amigos", label: "Mis amigos" },
  { id: "solicitudes", label: "Solicitudes" },
  { id: "matches", label: "Matches" },
];

function FilaUsuario({ u, children }) {
  const src = u.avatar_filename ? `/uploads/${u.id}/${u.avatar_filename}` : AVATAR_PLACEHOLDER[u.profile_type];
  return (
    <div className="fila-amistad">
      <Link href={`/perfil/${u.nick}`} style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
          <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
        </div>
        {mostrarPuntoOnline(u) && <PuntoOnline />}
      </Link>
      <div className="fila-amistad__info">
        <Link href={`/perfil/${u.nick}`} className="heading" style={{ fontSize: 16, color: "var(--text)", textDecoration: "none" }}>
          {u.nick}
        </Link>
        <span className="badge-gold" style={{ fontSize: 9 }}>{ISLAND_LABEL[u.island]}</span>
        <span className="badge-gold" style={{ fontSize: 9 }}>{PROFILE_TYPE_LABEL[u.profile_type]}</span>
      </div>
      <div className="fila-amistad__acciones">{children}</div>
    </div>
  );
}

const botonPequeno = { fontSize: 11, padding: "6px 12px" };

export function AmistadesShell() {
  const [tab, setTab] = useState("amigos");
  const [amigos, setAmigos] = useState(null);
  const [recibidas, setRecibidas] = useState(null);
  const [enviadas, setEnviadas] = useState(null);
  const [matches, setMatches] = useState(null);

  function cargarAmistades() {
    fetch("/api/amistades")
      .then((r) => r.json())
      .then((d) => {
        setAmigos(d.amigos || []);
        setRecibidas(d.recibidas || []);
        setEnviadas(d.enviadas || []);
      })
      .catch(() => {
        setAmigos([]);
        setRecibidas([]);
        setEnviadas([]);
      });
  }

  useEffect(() => {
    cargarAmistades();
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches || []))
      .catch(() => setMatches([]));
  }, []);

  async function responder(fromId, accion) {
    setRecibidas((prev) => prev.filter((u) => u.id !== fromId));
    const res = await fetch(`/api/amistades/${fromId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    if (res.ok && accion === "aceptar") cargarAmistades();
  }

  async function eliminarAmigo(userId) {
    if (!window.confirm("¿Eliminar esta amistad?")) return;
    setAmigos((prev) => prev.filter((u) => u.id !== userId));
    await fetch(`/api/amistades/${userId}`, { method: "DELETE" });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="kicker">Comunidad</p>
      <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
        Amistades
      </h1>

      <div className="tab-nav" style={{ marginTop: 28 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`tab-nav-item ${tab === t.id ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        {tab === "amigos" && (
          amigos === null ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
          ) : amigos.length === 0 ? (
            <EmptyState texto="Aún no tienes amigos" />
          ) : (
            <div>
              {amigos.map((u) => (
                <FilaUsuario key={u.id} u={u}>
                  <Link href={`/perfil/${u.nick}`} className="btn-outline-gold" style={botonPequeno}>
                    Ver perfil
                  </Link>
                  <button
                    type="button"
                    onClick={() => eliminarAmigo(u.id)}
                    className="btn-outline-gold"
                    style={{ ...botonPequeno, borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}
                  >
                    Eliminar amistad
                  </button>
                </FilaUsuario>
              ))}
            </div>
          )
        )}

        {tab === "solicitudes" && (
          recibidas === null ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
          ) : (
            <>
              <p className="kicker" style={{ letterSpacing: 3, marginTop: 16 }}>Recibidas</p>
              {recibidas.length === 0 ? (
                <p style={{ marginTop: 10, marginBottom: 32, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
                  No tienes solicitudes pendientes.
                </p>
              ) : (
                <div style={{ marginTop: 6, marginBottom: 32 }}>
                  {recibidas.map((u) => (
                    <FilaUsuario key={u.id} u={u}>
                      <button type="button" onClick={() => responder(u.id, "aceptar")} className="btn-gold" style={botonPequeno}>
                        Aceptar
                      </button>
                      <button
                        type="button"
                        onClick={() => responder(u.id, "rechazar")}
                        className="btn-outline-gold"
                        style={botonPequeno}
                      >
                        Rechazar
                      </button>
                    </FilaUsuario>
                  ))}
                </div>
              )}

              <p className="kicker" style={{ letterSpacing: 3 }}>Enviadas</p>
              {enviadas.length === 0 ? (
                <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
                  No has enviado solicitudes.
                </p>
              ) : (
                <div style={{ marginTop: 6 }}>
                  {enviadas.map((u) => (
                    <FilaUsuario key={u.id} u={u}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--text-muted)" }}>
                        Pendiente
                      </span>
                    </FilaUsuario>
                  ))}
                </div>
              )}
            </>
          )
        )}

        {tab === "matches" && (
          matches === null ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
          ) : matches.length === 0 ? (
            <EmptyState texto="Aún no tienes matches" />
          ) : (
            <div>
              {matches.map((u) => (
                <FilaUsuario key={u.id} u={u}>
                  <Link href={`/perfil/${u.nick}`} className="btn-outline-gold" style={botonPequeno}>
                    Ver perfil
                  </Link>
                </FilaUsuario>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

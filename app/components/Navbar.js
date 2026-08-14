"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Plus, Search, Mail, Heart, Eye, Bell } from "lucide-react";
import { AVATAR_PLACEHOLDER } from "@/lib/constants";

function IconoBadge({ href, icono: Icono, contador, etiqueta, opcional }) {
  return (
    <Link
      href={href}
      aria-label={etiqueta}
      className={opcional ? "navbar-icono-opcional" : undefined}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        flexShrink: 0,
        color: "var(--text-secondary)",
      }}
    >
      <Icono size={21} />
      {contador > 0 && (
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: "#c94b4b",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
          }}
        >
          {contador > 9 ? "9+" : contador}
        </span>
      )}
    </Link>
  );
}

function MenuCrear({ onClose }) {
  return (
    <div className="dropdown-menu" style={{ background: "#1c1416", zIndex: 200, minWidth: 210, left: 0, right: "auto" }}>
      <Link href="/feed?compose=texto" onClick={onClose} className="dropdown-item">
        📝 Publicar texto
      </Link>
      <Link href="/feed?compose=foto" onClick={onClose} className="dropdown-item">
        📷 Subir foto
      </Link>
      <Link href="/anuncios?crear=1" onClick={onClose} className="dropdown-item">
        ✏️ Crear anuncio
      </Link>
      <Link href="/eventos?crear=1" onClick={onClose} className="dropdown-item">
        📅 Crear evento
      </Link>
      <button
        type="button"
        onClick={() => {
          onClose();
          signOut({ callbackUrl: "/" });
        }}
        className="dropdown-item"
        style={{ borderTop: "1px solid rgba(201,161,90,0.18)", color: "#9a3a3a" }}
      >
        🚪 Cerrar sesión
      </button>
    </div>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [menuCrearAbierto, setMenuCrearAbierto] = useState(false);
  const [contadores, setContadores] = useState({
    notificaciones_no_leidas: 0,
    mensajes_no_leidos: 0,
    visitas_nuevas: 0,
    solicitudes_pendientes: 0,
    likes_nuevos: 0,
  });
  const [montado, setMontado] = useState(false);
  const menuCrearRef = useRef(null);

  // useSession() siempre arranca en "loading" tanto en servidor como en el
  // primer render del cliente, así que en teoría no debería haber
  // divergencia — pero para eliminar cualquier posibilidad de hydration
  // mismatch (React #418/#423) forzamos que el primer render del cliente
  // sea idéntico al del servidor (estado "no autenticado") y solo después
  // de montar reflejamos la sesión real, igual que cualquier dato que solo
  // existe en el cliente (localStorage, window, etc.).
  useEffect(() => {
    setMontado(true);
  }, []);

  const autenticado = montado && status === "authenticated";

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/perfil")
      .then((r) => r.json())
      .then((d) => setAvatarUrl(d.avatarUrl))
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    function cargarStatus() {
      fetch("/api/status")
        .then((r) => r.json())
        .then((d) => setContadores((prev) => ({ ...prev, ...d })))
        .catch(() => {});
    }
    cargarStatus();
    const intervalo = setInterval(cargarStatus, 30000);
    return () => clearInterval(intervalo);
  }, [status]);

  useEffect(() => {
    function onClickFuera(e) {
      if (menuCrearRef.current && !menuCrearRef.current.contains(e.target)) {
        setMenuCrearAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  const imagenAvatar =
    avatarUrl || AVATAR_PLACEHOLDER[session?.user?.profileType] || AVATAR_PLACEHOLDER.chica;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid rgba(201,161,90,0.18)",
      }}
    >
      {/* El blur va en un wrapper interno, no en el <header>: backdrop-filter
          en un ancestro crea un nuevo containing block para sus
          descendientes position:fixed, así que un fixed dentro de un
          elemento con blur deja de posicionarse respecto al viewport. */}
      <div
        className="site-header"
        style={{
          background: "rgba(14,10,11,0.82)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href={autenticado ? "/feed" : "/"} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-t.png"
              alt="Contactos"
              className="navbar-logo"
              style={{ height: "40px", width: "auto", objectFit: "contain" }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </Link>

          {autenticado ? (
            <div className="navbar-acciones" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative" }} ref={menuCrearRef}>
                <button
                  type="button"
                  onClick={() => setMenuCrearAbierto((v) => !v)}
                  aria-label="Crear"
                  className="icon-btn"
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Plus size={22} />
                </button>
                {menuCrearAbierto && <MenuCrear onClose={() => setMenuCrearAbierto(false)} />}
              </div>

              <IconoBadge href="/buscar" icono={Search} etiqueta="Buscar" />
              <IconoBadge href="/mensajes" icono={Mail} contador={contadores.mensajes_no_leidos} etiqueta="Mensajes" />
              <IconoBadge href="/likes" icono={Heart} contador={contadores.likes_nuevos} etiqueta="Likes" opcional />
              <IconoBadge href="/visitas" icono={Eye} contador={contadores.visitas_nuevas} etiqueta="Visitas" opcional />
              <IconoBadge href="/notificaciones" icono={Bell} contador={contadores.notificaciones_no_leidas} etiqueta="Notificaciones" />

              <Link
                href="/mi-perfil"
                aria-label="Mi perfil"
                style={{
                  display: "block",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid var(--border-gold)",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={imagenAvatar}
                  alt=""
                  width={36}
                  height={36}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Link href="/buscar" className="nav-top-link">
                Perfiles
              </Link>
              <Link href="/login" className="btn-outline-gold">
                Acceder
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

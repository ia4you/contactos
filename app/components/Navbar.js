"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Plus, Search, Mail, Heart, Eye, Bell, UserCircle, Settings, LogOut } from "lucide-react";
import { AVATAR_PLACEHOLDER, ISLANDS } from "@/lib/constants";
import { UsuarioBadge } from "./UsuarioBadge";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

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

function MenuAvatar({ onClose, avatarSrc, nick, island, esCeo }) {
  return (
    <div className="dropdown-menu" style={{ background: "#1c1416", zIndex: 200, minWidth: 220 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 12px", borderBottom: "1px solid rgba(201,161,90,0.18)" }}>
        <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
            <Image src={avatarSrc} alt="" width={36} height={36} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {esCeo && <UsuarioBadge badgeEspecial="CEO" style={{ fontSize: 7, padding: "1px 4px" }} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="heading" style={{ fontSize: 14, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {nick}
          </p>
          {island && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>{ISLAND_LABEL[island]}</p>
          )}
        </div>
      </div>

      <Link href={`/perfil/${nick}`} onClick={onClose} className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <UserCircle size={15} /> Ver mi perfil
      </Link>
      <Link href="/mi-perfil" onClick={onClose} className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <UserCircle size={15} /> Editar perfil
      </Link>
      <Link href="/ajustes" onClick={onClose} className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Settings size={15} /> Ajustes
      </Link>
      <Link href="/likes" onClick={onClose} className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Heart size={15} /> Mis likes
      </Link>
      <Link href="/visitas" onClick={onClose} className="dropdown-item" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Eye size={15} /> Mis visitas
      </Link>
      <button
        type="button"
        onClick={() => {
          onClose();
          signOut({ callbackUrl: "/" });
        }}
        className="dropdown-item"
        style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid rgba(201,161,90,0.18)", color: "#9a3a3a" }}
      >
        <LogOut size={15} /> Cerrar sesión
      </button>
    </div>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [island, setIsland] = useState(null);
  const [menuCrearAbierto, setMenuCrearAbierto] = useState(false);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);
  const [contadores, setContadores] = useState({
    notificaciones_no_leidas: 0,
    mensajes_no_leidos: 0,
    visitas_nuevas: 0,
    solicitudes_pendientes: 0,
    likes_nuevos: 0,
  });
  const [montado, setMontado] = useState(false);
  const menuCrearRef = useRef(null);
  const menuAvatarRef = useRef(null);

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
      .then((d) => {
        setAvatarUrl(d.avatarUrl);
        setIsland(d.island);
      })
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
    // Páginas como /notificaciones marcan cosas como leídas y disparan este
    // evento para que el badge se actualice al instante, sin esperar al
    // próximo poll de 30s.
    window.addEventListener("contactos:status-actualizado", cargarStatus);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("contactos:status-actualizado", cargarStatus);
    };
  }, [status]);

  useEffect(() => {
    function onClickFuera(e) {
      if (menuCrearRef.current && !menuCrearRef.current.contains(e.target)) {
        setMenuCrearAbierto(false);
      }
      if (menuAvatarRef.current && !menuAvatarRef.current.contains(e.target)) {
        setMenuAvatarAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  const imagenAvatar =
    avatarUrl || AVATAR_PLACEHOLDER[session?.user?.profileType] || AVATAR_PLACEHOLDER.chica;
  const esCeo = String(session?.user?.id) === "2";

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
          <Link href={autenticado ? "/feed" : "/"} style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-cl.svg"
              alt="Contactos"
              className="navbar-logo"
              style={{ height: "40px", width: "auto", objectFit: "contain" }}
              onContextMenu={(e) => e.preventDefault()}
            />
            <span
              className="navbar-logo-texto"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                color: "#D8B47E",
                letterSpacing: "3px",
                whiteSpace: "nowrap",
              }}
            >
              Contactos Liberales
            </span>
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

              <div style={{ position: "relative" }} ref={menuAvatarRef}>
                <button
                  type="button"
                  onClick={() => setMenuAvatarAbierto((v) => !v)}
                  aria-label="Mi cuenta"
                  style={{
                    position: "relative",
                    display: "block",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    overflow: "visible",
                    border: "none",
                    padding: 0,
                    background: "transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border-gold)" }}>
                    <Image
                      src={imagenAvatar}
                      alt=""
                      width={36}
                      height={36}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  {esCeo && <UsuarioBadge badgeEspecial="CEO" style={{ fontSize: 7, padding: "1px 4px" }} />}
                </button>
                {menuAvatarAbierto && (
                  <MenuAvatar
                    onClose={() => setMenuAvatarAbierto(false)}
                    avatarSrc={imagenAvatar}
                    nick={session?.user?.nick}
                    island={island}
                    esCeo={esCeo}
                  />
                )}
              </div>
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

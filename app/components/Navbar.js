"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Menu, X, MessageCircle, Bell, Eye, Users } from "lucide-react";
import { AVATAR_PLACEHOLDER } from "@/lib/constants";
import { MensajesIcono } from "./MensajesIcono";
import { NotificacionesBell } from "./NotificacionesBell";
import { VisitasIcono } from "./VisitasIcono";

function IconoMovil({ href, icono: Icono, contador, etiqueta, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={etiqueta}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        color: "var(--text-secondary)",
      }}
    >
      <Icono size={22} />
      {contador > 0 && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
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

export function Navbar() {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [contadores, setContadores] = useState({ notificaciones_no_leidas: 0, mensajes_no_leidos: 0, visitas_nuevas: 0, solicitudes_pendientes: 0 });
  const [montado, setMontado] = useState(false);
  const menuRef = useRef(null);

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
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
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
          descendientes position:fixed (el panel/overlay del menú móvil de
          más abajo), así que un fixed dentro de un elemento con blur deja
          de posicionarse respecto al viewport y se rompe. La clase
          site-header (con su padding responsive) se mueve aquí también. */}
      <div
        className="site-header"
        style={{
          background: "rgba(14,10,11,0.82)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href={autenticado ? "/feed" : "/"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <span
            className="heading logo-title"
            style={{ fontSize: "24px", letterSpacing: "5px", color: "var(--text)" }}
          >
            CONTACTOS
          </span>
          <span className="logo-subtitle-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)" }} />
          <span
            className="logo-subtitle"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
            }}
          >
            Club Liberal
          </span>
        </Link>

        {autenticado ? (
          <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
            <nav className="desktop-nav-links" style={{ display: "flex", alignItems: "center", gap: "28px" }}>
              <Link href="/feed" className="nav-top-link">
                Feed
              </Link>
              <Link href="/anuncios" className="nav-top-link">
                Anuncios
              </Link>
              <Link href="/amistades" className="nav-top-link">
                Amistades
              </Link>
              <Link href="/eventos" className="nav-top-link">
                Eventos
              </Link>
              <Link href="/grupos" className="nav-top-link">
                Grupos
              </Link>
            </nav>

            <div className="navbar-acciones" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <button
                type="button"
                onClick={() => setMenuMovilAbierto(true)}
                aria-label="Abrir menú"
                className="icon-btn hamburger-menu"
              >
                <Menu size={22} />
              </button>

              <div className="navbar-iconos-desktop" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <Link href="/buscar" aria-label="Buscar" className="icon-btn">
                  <Search size={20} />
                </Link>
                <VisitasIcono contador={contadores.visitas_nuevas} />
                <MensajesIcono contador={contadores.mensajes_no_leidos} />
                <NotificacionesBell
                  contador={contadores.notificaciones_no_leidas}
                  onMarcarLeidas={() => setContadores((prev) => ({ ...prev, notificaciones_no_leidas: 0 }))}
                />

                <div style={{ position: "relative" }} ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuAbierto((v) => !v)}
                    aria-label="Menú de usuario"
                    style={{
                      display: "block",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "1px solid var(--border-gold)",
                      padding: 0,
                      cursor: "pointer",
                      background: "transparent",
                    }}
                  >
                    <Image
                      src={imagenAvatar}
                      alt=""
                      width={36}
                      height={36}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>

                  {menuAbierto && (
                    <div className="dropdown-menu">
                      <Link href="/mi-perfil" onClick={() => setMenuAbierto(false)} className="dropdown-item">
                        Mi perfil
                      </Link>
                      <Link href="/ajustes" onClick={() => setMenuAbierto(false)} className="dropdown-item">
                        Ajustes
                      </Link>
                      {session?.user?.role === "admin" && (
                        <Link href="/admin" onClick={() => setMenuAbierto(false)} className="dropdown-item">
                          Administración
                        </Link>
                      )}
                      <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="dropdown-item">
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <nav className="desktop-nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              <Link href="/" className="nav-top-link">
                Inicio
              </Link>
              <Link href="/buscar" className="nav-top-link">
                Perfiles
              </Link>
            </nav>
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(true)}
              aria-label="Abrir menú"
              className="icon-btn hamburger-menu"
            >
              <Menu size={22} />
            </button>
            <Link href="/login" className="btn-outline-gold navbar-acceder-desktop">
              Acceder
            </Link>
          </div>
        )}
        </div>
      </div>

      {menuMovilAbierto && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.7)" }}
          onClick={() => setMenuMovilAbierto(false)}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 100,
              width: "min(280px, 80vw)",
              background: "#0e0a0b",
              borderRight: "1px solid rgba(201,161,90,0.18)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 24px",
                borderBottom: "1px solid rgba(201,161,90,0.18)",
              }}
            >
              <span className="heading" style={{ fontSize: 18, letterSpacing: 3, color: "var(--text)" }}>
                MENÚ
              </span>
              <button
                type="button"
                onClick={() => setMenuMovilAbierto(false)}
                aria-label="Cerrar menú"
                className="icon-btn"
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: "flex", flexDirection: "column" }}>
              {autenticado ? (
                <>
                  <Link href="/feed" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Feed
                  </Link>
                  <Link href="/anuncios" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Anuncios
                  </Link>
                  <Link href="/amistades" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Amistades
                  </Link>
                  <Link href="/eventos" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Eventos
                  </Link>
                  <Link href="/grupos" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Grupos
                  </Link>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around",
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(201,161,90,0.12)",
                    }}
                  >
                    <IconoMovil
                      href="/mensajes"
                      icono={MessageCircle}
                      contador={contadores.mensajes_no_leidos}
                      etiqueta="Mensajes"
                      onClick={() => setMenuMovilAbierto(false)}
                    />
                    <IconoMovil
                      href="/notificaciones"
                      icono={Bell}
                      contador={contadores.notificaciones_no_leidas}
                      etiqueta="Notificaciones"
                      onClick={() => setMenuMovilAbierto(false)}
                    />
                    <IconoMovil
                      href="/visitas"
                      icono={Eye}
                      contador={contadores.visitas_nuevas}
                      etiqueta="Visitas"
                      onClick={() => setMenuMovilAbierto(false)}
                    />
                    <IconoMovil
                      href="/amistades"
                      icono={Users}
                      contador={contadores.solicitudes_pendientes}
                      etiqueta="Amistades"
                      onClick={() => setMenuMovilAbierto(false)}
                    />
                  </div>

                  <Link href="/buscar" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Buscar
                  </Link>
                  <Link href="/mi-perfil" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Mi perfil
                  </Link>
                  <Link href="/ajustes" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Ajustes
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="mobile-menu-link"
                    style={{ textAlign: "left", background: "none", border: "none", borderBottom: "1px solid rgba(201,161,90,0.12)", cursor: "pointer" }}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Inicio
                  </Link>
                  <Link href="/buscar" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Perfiles
                  </Link>
                  <Link href="/login" onClick={() => setMenuMovilAbierto(false)} className="mobile-menu-link">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </nav>

            {!autenticado && (
              <div style={{ padding: "20px 24px", marginTop: "auto" }}>
                <Link
                  href="/registro"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="btn-gold"
                  style={{ display: "block", textAlign: "center" }}
                >
                  Crear perfil
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

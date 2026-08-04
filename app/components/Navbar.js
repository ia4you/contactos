"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, MessageCircle, Bell } from "lucide-react";
import { AVATAR_PLACEHOLDER } from "@/lib/constants";

export function Navbar() {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/perfil")
      .then((r) => r.json())
      .then((d) => setAvatarUrl(d.avatarUrl))
      .catch(() => {});
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
        background: "rgba(14,10,11,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(201,161,90,0.18)",
        padding: "22px 40px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <span
            className="heading"
            style={{ fontSize: "24px", letterSpacing: "5px", color: "var(--text)" }}
          >
            CONTACTOS
          </span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)" }} />
          <span
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

        {status === "authenticated" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link href="/buscar" aria-label="Buscar" className="icon-btn">
              <Search size={20} />
            </Link>
            <button type="button" aria-label="Mensajes" className="icon-btn">
              <MessageCircle size={20} />
            </button>
            <button type="button" aria-label="Notificaciones" className="icon-btn">
              <Bell size={20} />
            </button>

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
                  <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="dropdown-item">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link href="/" className="nav-top-link">
              Inicio
            </Link>
            <Link href="/buscar" className="nav-top-link">
              Perfiles
            </Link>
            <Link href="/login" className="btn-outline-gold">
              Acceder
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

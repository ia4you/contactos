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
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-borde bg-fondo">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-display text-xl text-champan">
          Contactos
        </Link>

        {status === "authenticated" ? (
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Buscar" className="text-texto-secundario hover:text-texto">
              <Search size={22} />
            </button>
            <button type="button" aria-label="Mensajes" className="text-texto-secundario hover:text-texto">
              <MessageCircle size={22} />
            </button>
            <button type="button" aria-label="Notificaciones" className="text-texto-secundario hover:text-texto">
              <Bell size={22} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuAbierto((v) => !v)}
                className="block h-8 w-8 overflow-hidden rounded-full border border-borde"
                aria-label="Menú de usuario"
              >
                <Image src={imagenAvatar} alt="" width={32} height={32} className="h-full w-full object-cover" />
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-borde bg-surface shadow-xl">
                  <Link
                    href="/mi-perfil"
                    onClick={() => setMenuAbierto(false)}
                    className="block px-4 py-2.5 text-sm text-texto hover:bg-elevada"
                  >
                    Mi perfil
                  </Link>
                  <Link
                    href="/ajustes"
                    onClick={() => setMenuAbierto(false)}
                    className="block px-4 py-2.5 text-sm text-texto hover:bg-elevada"
                  >
                    Ajustes
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full px-4 py-2.5 text-left text-sm text-texto hover:bg-elevada"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-texto-secundario hover:text-texto">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-full bg-burdeos px-5 py-2 text-sm font-medium text-white transition hover:bg-burdeos-hover"
            >
              Crear perfil
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

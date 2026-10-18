"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  House,
  Search,
  Mail,
  Heart,
  Eye,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  SquarePlus,
  Menu,
  Users,
  CalendarDays,
  Megaphone,
  Martini,
  Images,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { AVATAR_PLACEHOLDER, ISLANDS } from "@/lib/constants";
import { UsuarioBadge } from "./UsuarioBadge";
import { RegistroCTA } from "./RegistroCTA";
import { Dialogo } from "./Dialogo";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

// Secciones secundarias: menú del avatar (≥768px) y hoja "Más" (móvil).
const EXPLORAR = [
  { href: "/grupos", texto: "Grupos", icono: Users },
  { href: "/eventos", texto: "Eventos", icono: CalendarDays },
  { href: "/anuncios", texto: "Anuncios", icono: Megaphone },
  { href: "/clubs", texto: "Clubs", icono: Martini },
  { href: "/fotos", texto: "Fotos", icono: Images },
  { href: "/amistades", texto: "Amistades", icono: UserPlus, contador: "solicitudes_pendientes" },
  { href: "/blog", texto: "Blog", icono: BookOpen },
];

function Contador({ valor }) {
  if (!(valor > 0)) return null;
  return (
    <span className="contador" aria-hidden="true">
      {valor > 9 ? "9+" : valor}
    </span>
  );
}

function etiquetaConContador(texto, valor) {
  return valor > 0 ? `${texto} (${valor} nuevos)` : texto;
}

function IconoBadge({ href, icono: Icono, contador, etiqueta, activo, className }) {
  return (
    <Link
      href={href}
      aria-label={etiquetaConContador(etiqueta, contador)}
      aria-current={activo ? "page" : undefined}
      className={`icono-badge ${className || ""}`}
    >
      <Icono size={21} strokeWidth={1.6} aria-hidden="true" />
      <Contador valor={contador} />
    </Link>
  );
}

function MenuAvatar({ id, onClose, avatarSrc, nick, island, esCeo, contadores }) {
  return (
    <div id={id} className="dropdown-menu" style={{ minWidth: 240 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px 14px", borderBottom: "1px solid var(--rule)" }}>
        <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
            <Image src={avatarSrc} alt="" width={40} height={40} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {esCeo && <UsuarioBadge badgeEspecial="CEO" />}
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="tarjeta-feed__nick" style={{ fontSize: 18, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {nick}
          </p>
          {island && <p className="meta">{ISLAND_LABEL[island]}</p>}
        </div>
      </div>

      <Link href={`/perfil/${nick}`} onClick={onClose} className="dropdown-item">
        <UserCircle size={16} aria-hidden="true" /> Ver mi perfil
      </Link>
      <Link href="/mi-perfil" onClick={onClose} className="dropdown-item">
        <UserCircle size={16} aria-hidden="true" /> Editar perfil
      </Link>
      <Link href="/ajustes" onClick={onClose} className="dropdown-item">
        <Settings size={16} aria-hidden="true" /> Ajustes
      </Link>
      <Link href="/likes" onClick={onClose} className="dropdown-item">
        <Heart size={16} aria-hidden="true" /> Mis likes
      </Link>
      <Link href="/visitas" onClick={onClose} className="dropdown-item">
        <Eye size={16} aria-hidden="true" /> Mis visitas
      </Link>

      <p className="kicker dropdown-titulo" style={{ borderTop: "1px solid var(--rule)", marginTop: 6 }}>
        Explorar
      </p>
      {EXPLORAR.map(({ href, texto, icono: Icono, contador }) => (
        <Link key={href} href={href} onClick={onClose} className="dropdown-item">
          <Icono size={16} aria-hidden="true" /> {texto}
          {contador && contadores[contador] > 0 && (
            <span className="contador" style={{ position: "static", marginLeft: "auto" }}>
              {contadores[contador] > 9 ? "9+" : contadores[contador]}
            </span>
          )}
        </Link>
      ))}

      <button
        type="button"
        onClick={() => {
          onClose();
          signOut({ callbackUrl: "/" });
        }}
        className="dropdown-item"
        style={{ borderTop: "1px solid var(--rule)", marginTop: 6, color: "var(--danger)" }}
      >
        <LogOut size={16} aria-hidden="true" /> Cerrar sesión
      </button>
    </div>
  );
}

function HojaMas({ onClose, contadores }) {
  const items = [
    ...EXPLORAR.map((i) => ({ ...i, valor: i.contador ? contadores[i.contador] : 0 })),
    { href: "/likes", texto: "Likes", icono: Heart, valor: contadores.likes_nuevos },
    { href: "/visitas", texto: "Visitas", icono: Eye, valor: contadores.visitas_nuevas },
    { href: "/notificaciones", texto: "Notificaciones", icono: Bell, valor: contadores.notificaciones_no_leidas },
    { href: "/ajustes", texto: "Ajustes", icono: Settings },
  ];
  return (
    <Dialogo onCerrar={onClose} idTitulo="hoja-mas-titulo" variante="hoja">
      <h2 id="hoja-mas-titulo" className="kicker" style={{ padding: "12px 24px 10px" }}>
        Más secciones
      </h2>
      <nav aria-label="Más secciones" style={{ borderTop: "1px solid var(--rule)" }}>
        {items.map(({ href, texto, icono: Icono, valor }) => (
          <Link key={href} href={href} onClick={onClose} className="hoja-item">
            <Icono size={20} strokeWidth={1.6} color="var(--gold)" aria-hidden="true" />
            {texto}
            {valor > 0 && (
              <span className="contador" aria-label={`${valor} nuevos`}>
                {valor > 9 ? "9+" : valor}
              </span>
            )}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => {
            onClose();
            signOut({ callbackUrl: "/" });
          }}
          className="hoja-item"
          style={{ color: "var(--danger)" }}
        >
          <LogOut size={20} strokeWidth={1.6} aria-hidden="true" />
          Cerrar sesión
        </button>
      </nav>
    </Dialogo>
  );
}

// Barra inferior fija, solo en móvil (<768px, ver .nav-inferior en theme.css).
function NavInferior({ pathname, contadores }) {
  const [masAbierto, setMasAbierto] = useState(false);
  const items = [
    { href: "/feed", texto: "Inicio", icono: House, activo: pathname === "/feed" },
    { href: "/buscar", texto: "Perfiles", icono: Search, activo: pathname.startsWith("/buscar") },
    { href: "/feed?compose=texto", texto: "Publicar", icono: SquarePlus, activo: false },
    { href: "/mensajes", texto: "Mensajes", icono: Mail, activo: pathname.startsWith("/mensajes"), valor: contadores.mensajes_no_leidos },
  ];
  return (
    <>
      <nav className="nav-inferior" aria-label="Navegación principal">
        {items.map(({ href, texto, icono: Icono, activo, valor }) => (
          <Link
            key={texto}
            href={href}
            className="nav-inferior__item"
            aria-current={activo ? "page" : undefined}
            aria-label={valor > 0 ? etiquetaConContador(texto, valor) : undefined}
          >
            <Icono size={22} strokeWidth={1.6} aria-hidden="true" />
            <span aria-hidden={valor > 0 ? "true" : undefined}>{texto}</span>
            <Contador valor={valor} />
          </Link>
        ))}
        <button
          type="button"
          className="nav-inferior__item"
          aria-haspopup="dialog"
          aria-expanded={masAbierto}
          onClick={() => setMasAbierto(true)}
        >
          <Menu size={22} strokeWidth={1.6} aria-hidden="true" />
          <span>Más</span>
          <Contador valor={(contadores.likes_nuevos || 0) + (contadores.visitas_nuevas || 0) + (contadores.solicitudes_pendientes || 0)} />
        </button>
      </nav>
      {masAbierto && <HojaMas onClose={() => setMasAbierto(false)} contadores={contadores} />}
    </>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname() || "/";
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [island, setIsland] = useState(null);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);
  const [contadores, setContadores] = useState({
    notificaciones_no_leidas: 0,
    mensajes_no_leidos: 0,
    visitas_nuevas: 0,
    solicitudes_pendientes: 0,
    likes_nuevos: 0,
  });
  const [montado, setMontado] = useState(false);
  const menuAvatarRef = useRef(null);
  const botonAvatarRef = useRef(null);

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
    if (!menuAvatarAbierto) return;
    function onClickFuera(e) {
      if (menuAvatarRef.current && !menuAvatarRef.current.contains(e.target)) {
        setMenuAvatarAbierto(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setMenuAvatarAbierto(false);
        botonAvatarRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickFuera);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuAvatarAbierto]);

  const imagenAvatar =
    avatarUrl || AVATAR_PLACEHOLDER[session?.user?.profileType] || AVATAR_PLACEHOLDER.chica;
  const esCeo = String(session?.user?.id) === "2";

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <p className="site-header__izq">Canarias · Solo +18</p>

          <Link href={autenticado ? "/feed" : "/"} className="site-header__wordmark" aria-label="Contactos, ir al inicio">
            Contactos
          </Link>

          {autenticado ? (
            <nav className="site-header__der" aria-label="Tu actividad">
              <IconoBadge href="/buscar" icono={Search} etiqueta="Buscar perfiles" activo={pathname.startsWith("/buscar")} className="solo-escritorio" />
              <IconoBadge href="/mensajes" icono={Mail} contador={contadores.mensajes_no_leidos} etiqueta="Mensajes" activo={pathname.startsWith("/mensajes")} className="solo-escritorio" />
              <IconoBadge href="/likes" icono={Heart} contador={contadores.likes_nuevos} etiqueta="Likes" activo={pathname.startsWith("/likes")} className="solo-escritorio" />
              <IconoBadge href="/visitas" icono={Eye} contador={contadores.visitas_nuevas} etiqueta="Visitas" activo={pathname.startsWith("/visitas")} className="solo-escritorio" />
              <IconoBadge href="/notificaciones" icono={Bell} contador={contadores.notificaciones_no_leidas} etiqueta="Notificaciones" activo={pathname.startsWith("/notificaciones")} />

              <div style={{ position: "relative" }} ref={menuAvatarRef}>
                <button
                  ref={botonAvatarRef}
                  type="button"
                  onClick={() => setMenuAvatarAbierto((v) => !v)}
                  aria-label="Mi cuenta"
                  aria-haspopup="true"
                  aria-expanded={menuAvatarAbierto}
                  aria-controls="menu-cuenta"
                  className="avatar-boton"
                >
                  <div className="avatar-boton__img">
                    <Image src={imagenAvatar} alt="" width={36} height={36} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  {esCeo && <UsuarioBadge badgeEspecial="CEO" />}
                </button>
                {menuAvatarAbierto && (
                  <MenuAvatar
                    id="menu-cuenta"
                    onClose={() => setMenuAvatarAbierto(false)}
                    avatarSrc={imagenAvatar}
                    nick={session?.user?.nick}
                    island={island}
                    esCeo={esCeo}
                    contadores={contadores}
                  />
                )}
              </div>
            </nav>
          ) : (
            <nav className="site-header__der" aria-label="Acceso">
              <Link href="/blog" className="nav-top-link solo-escritorio" style={{ padding: "0 12px" }}>
                Blog
              </Link>
              <Link href="/login" className="nav-top-link" style={{ padding: "0 12px" }}>
                Acceder
              </Link>
              <RegistroCTA location="navbar" className="btn-gold">
                Crear perfil
              </RegistroCTA>
            </nav>
          )}
        </div>
      </header>
      {autenticado && <NavInferior pathname={pathname} contadores={contadores} />}
    </>
  );
}

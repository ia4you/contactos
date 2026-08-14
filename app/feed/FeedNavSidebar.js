"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Rss,
  FileText,
  UsersRound,
  Image as ImageIcon,
  Megaphone,
  Compass,
  Users,
  Calendar,
  Martini,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";

function ItemLink({ href, icono: Icono, texto, activo }) {
  return (
    <Link href={href} className={`feed-nav-item ${activo ? "activo" : ""}`}>
      <Icono size={16} />
      {texto}
    </Link>
  );
}

function ItemBoton({ icono: Icono, texto, activo, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`feed-nav-item ${activo ? "activo" : ""}`}>
      <Icono size={16} />
      {texto}
    </button>
  );
}

export function FeedNavSidebar({ tab, onCambiarTab, miNick }) {
  return (
    <nav className="feed-nav-sidebar" style={{ background: "#0e0a0b", borderRight: "1px solid rgba(201,161,90,0.18)", padding: "24px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <p className="kicker" style={{ padding: "0 20px", marginBottom: 8 }}>
          Following
        </p>
        <ItemBoton icono={Rss} texto="Toda la actividad" activo={tab === "siguiendo"} onClick={() => onCambiarTab("siguiendo")} />
        {miNick && <ItemLink href={`/perfil/${miNick}`} icono={FileText} texto="Mis publicaciones" />}
        <ItemLink href="/grupos" icono={UsersRound} texto="Grupos" />
        <ItemLink href="/mi-perfil?tab=fotos" icono={ImageIcon} texto="Fotos" />
        <ItemLink href="/anuncios" icono={Megaphone} texto="Escritos/Anuncios" />
      </div>

      <div style={{ marginBottom: 28 }}>
        <p className="kicker" style={{ padding: "0 20px", marginBottom: 8 }}>
          Explorar
        </p>
        <ItemBoton icono={Compass} texto="Para ti" activo={tab === "parati"} onClick={() => onCambiarTab("parati")} />
        <ItemLink href="/buscar" icono={Users} texto="Perfiles" />
        <ItemLink href="/eventos" icono={Calendar} texto="Eventos" />
        <ItemLink href="/clubs" icono={Martini} texto="Clubs" />
      </div>

      <div>
        <p className="kicker" style={{ padding: "0 20px", marginBottom: 8 }}>
          Mi cuenta
        </p>
        <ItemLink href="/mi-perfil" icono={UserCircle} texto="Mi perfil" />
        <ItemLink href="/ajustes" icono={Settings} texto="Ajustes" />
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="feed-nav-item">
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

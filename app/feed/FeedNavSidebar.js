"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserCircle, Settings, LogOut } from "lucide-react";

const LINKS_EXPLORAR = [
  { texto: "Perfiles", href: "/buscar" },
  { texto: "Grupos", href: "/grupos" },
  { texto: "Fotos", href: "/fotos" },
  { texto: "Anuncios", href: "/anuncios" },
  { texto: "Eventos", href: "/eventos" },
  { texto: "Clubs", href: "/clubs" },
  { texto: "Blog", href: "/blog" },
];

function ItemLink({ href, icono: Icono, texto }) {
  return (
    <Link href={href} className="feed-nav-item">
      <Icono size={16} />
      {texto}
    </Link>
  );
}

export function FeedNavSidebar() {
  return (
    <nav className="feed-nav-sidebar" style={{ background: "#0e0a0b", borderRight: "1px solid rgba(201,161,90,0.18)", padding: "24px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <p className="kicker" style={{ padding: "0 20px", marginBottom: 8 }}>
          Explorar
        </p>
        {LINKS_EXPLORAR.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="feed-nav-item-texto"
          >
            {l.texto}
          </Link>
        ))}
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

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, MoreHorizontal } from "lucide-react";
import { ISLANDS, PROFILE_TYPES } from "@/lib/constants";
import { mostrarPuntoOnline } from "@/lib/online";
import { ReportButton } from "../../components/ReportButton";
import { BlockButton } from "../../components/BlockButton";
import { PuntoOnline } from "../../components/PuntoOnline";
import { UsuarioBadge } from "../../components/UsuarioBadge";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

function LineaDatos({ titulo, valores }) {
  if (!valores || valores.length === 0) return null;
  return (
    <p className="perfil-cab__datos">
      <span>{titulo}:</span> {valores.join(" · ")}
    </p>
  );
}

export function PerfilCabecera({
  usuario,
  avatarSrc,
  miembroDesde,
  esPropio,
  estadoInicial,
  compatibilidad,
}) {
  const router = useRouter();
  const [meGusta, setMeGusta] = useState(estadoInicial.meGusta);
  const [match, setMatch] = useState(estadoInicial.match);
  const [amistad, setAmistad] = useState(estadoInicial.amistad); // null | 'enviada' | 'recibida' | 'amigos'
  const [cargandoLike, setCargandoLike] = useState(false);
  const [cargandoAmistad, setCargandoAmistad] = useState(false);
  const [cargandoMensaje, setCargandoMensaje] = useState(false);
  const [corazonAnimado, setCorazonAnimado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const botonMenuRef = useRef(null);
  const online = mostrarPuntoOnline(usuario, esPropio);

  // Menú «⋯»: se cierra con Escape o clic fuera, salvo si el clic o la tecla
  // son de un diálogo abierto desde el propio menú (denunciar, confirmar).
  useEffect(() => {
    if (!menuAbierto) return;
    function onDown(e) {
      if (menuRef.current?.contains(e.target) || e.target.closest?.(".dialogo-fondo")) return;
      setMenuAbierto(false);
    }
    function onKey(e) {
      if (e.key !== "Escape" || document.querySelector(".dialogo-fondo")) return;
      setMenuAbierto(false);
      botonMenuRef.current?.focus();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuAbierto]);

  // El valor inicial ya viene por SSR (estadoInicial), pero se revalida al
  // montar para que el corazón de la cabecera siempre refleje el estado
  // real de /api/likes/perfil/[userId] tal como se pidió.
  useEffect(() => {
    if (esPropio) return;
    fetch(`/api/likes/perfil/${usuario.id}`)
      .then((r) => r.json())
      .then((d) => {
        setMeGusta(d.meGusta);
        if (d.match) setMatch(true);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id, esPropio]);

  async function toggleLike() {
    if (cargandoLike) return;
    setCargandoLike(true);
    const res = await fetch("/api/likes/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_id: usuario.id }),
    });
    const data = await res.json().catch(() => null);
    setCargandoLike(false);
    if (res.ok && data) {
      setMeGusta(data.meGusta);
      if (data.match) setMatch(true);
      setCorazonAnimado(true);
      setTimeout(() => setCorazonAnimado(false), 350);
    }
  }

  async function solicitarAmistad() {
    setCargandoAmistad(true);
    const res = await fetch("/api/amistades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_id: usuario.id }),
    });
    const data = await res.json().catch(() => null);
    setCargandoAmistad(false);
    if (res.ok && data) {
      setAmistad(data.status === "accepted" ? "amigos" : "enviada");
    }
  }

  async function responderAmistad(accion) {
    setCargandoAmistad(true);
    const res = await fetch(`/api/amistades/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    setCargandoAmistad(false);
    if (res.ok) {
      setAmistad(accion === "aceptar" ? "amigos" : null);
    }
  }

  async function enviarMensaje() {
    setCargandoMensaje(true);
    const res = await fetch("/api/mensajes/iniciar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user_id: usuario.id }),
    });
    const data = await res.json().catch(() => null);
    setCargandoMensaje(false);
    if (res.ok && data?.conversacionId) {
      router.push(`/mensajes?con=${data.conversacionId}`);
    }
  }

  const meta = [
    PROFILE_TYPE_LABEL[usuario.profile_type],
    ISLAND_LABEL[usuario.island],
    `Miembro desde ${miembroDesde}`,
    usuario.verified && "Verificado",
    !esPropio && match && "Match",
    !esPropio && amistad === "amigos" && "Amigos",
  ].filter(Boolean);

  const bio = (texto) => <p className="perfil-cab__bio">{texto}</p>;

  return (
    <header className="perfil-cab">
      <div className="perfil-cab__inner">
        <div className="perfil-cab__avatar">
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
            <Image sizes="120px" src={avatarSrc} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
          </div>
          {online && <PuntoOnline size={16} />}
        </div>

        <div className="perfil-cab__textos">
          <h1 className="perfil-cab__nick">
            {usuario.nick}
            <UsuarioBadge
              badgeEspecial={usuario.badge_especial}
              isDemo={usuario.is_demo}
              style={{ position: "static", border: "none", alignSelf: "center" }}
            />
          </h1>
          <p className="perfil-cab__meta">{meta.join(" · ")}</p>
          {compatibilidad && <p className="perfil-cab__afinidad">{compatibilidad.pct} % de afinidad</p>}

          {usuario.profile_type === "pareja" ? (
            <>
              {usuario.her_bio && bio(<><strong>Ella:</strong> {usuario.her_bio}</>)}
              {usuario.his_bio && bio(<><strong>Él:</strong> {usuario.his_bio}</>)}
            </>
          ) : (
            usuario.bio && bio(usuario.bio)
          )}

          <LineaDatos titulo="Género" valores={usuario.genero} />
          <LineaDatos titulo="Orientación" valores={usuario.orientacion} />
          <LineaDatos titulo="Rol" valores={usuario.rol} />

          {!esPropio && (
            <div className="perfil-cab__acciones">
              <button
                type="button"
                onClick={toggleLike}
                disabled={cargandoLike}
                aria-pressed={meGusta}
                className={meGusta ? "btn-outline-gold" : "btn-gold"}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Heart
                  size={15}
                  fill={meGusta ? "currentColor" : "none"}
                  className={corazonAnimado ? "corazon-pop" : undefined}
                  aria-hidden="true"
                />
                {meGusta ? "Te gusta" : "Dar like"}
              </button>
              <button type="button" onClick={enviarMensaje} disabled={cargandoMensaje} className="btn-outline-gold">
                Enviar mensaje
              </button>

              <div ref={menuRef} style={{ position: "relative" }}>
                <button
                  ref={botonMenuRef}
                  type="button"
                  onClick={() => setMenuAbierto((v) => !v)}
                  aria-label="Más acciones"
                  aria-haspopup="true"
                  aria-expanded={menuAbierto}
                  aria-controls="perfil-mas-acciones"
                  className="icon-btn perfil-cab__mas"
                >
                  <MoreHorizontal size={20} aria-hidden="true" />
                </button>
                {/* hidden y no desmontado: el diálogo de denuncia vive dentro */}
                <div id="perfil-mas-acciones" className="dropdown-menu" hidden={!menuAbierto} style={{ top: "calc(100% + 6px)" }}>
                  {amistad === "amigos" ? null : amistad === "enviada" ? (
                    <button type="button" disabled className="dropdown-item" style={{ cursor: "not-allowed", opacity: 0.6 }}>
                      Solicitud de amistad enviada
                    </button>
                  ) : amistad === "recibida" ? (
                    <>
                      <button type="button" onClick={() => responderAmistad("aceptar")} disabled={cargandoAmistad} className="dropdown-item">
                        Aceptar amistad
                      </button>
                      <button type="button" onClick={() => responderAmistad("rechazar")} disabled={cargandoAmistad} className="dropdown-item">
                        Rechazar amistad
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={solicitarAmistad} disabled={cargandoAmistad} className="dropdown-item">
                      Solicitar amistad
                    </button>
                  )}
                  <ReportButton reportedUserId={usuario.id} label="Denunciar perfil" className="dropdown-item" style={{ color: "var(--danger)" }} />
                  <BlockButton blockedId={usuario.id} label="Bloquear" className="dropdown-item" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

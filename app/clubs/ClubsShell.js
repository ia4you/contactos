"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Martini } from "lucide-react";
import { ISLANDS } from "@/lib/constants";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

// Solo estas 5 tienen clubs — no tiene sentido ofrecer un filtro para
// La Gomera, El Hierro o La Graciosa cuando ninguno de los 9 clubs está ahí.
const FILTROS_ISLA = [
  { value: "todas", label: "Todas" },
  { value: "gran_canaria", label: "Gran Canaria" },
  { value: "tenerife", label: "Tenerife" },
  { value: "lanzarote", label: "Lanzarote" },
  { value: "fuerteventura", label: "Fuerteventura" },
  { value: "la_palma", label: "La Palma" },
];

function ModalProximamente({ club, onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(14,10,11,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 420, background: "var(--surface)", border: "1px solid var(--border-gold)", padding: 28, textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
          {club.nombre}
        </h3>
        <p style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          Próximamente — estamos recopilando información de este club.
        </p>
        <button type="button" onClick={onClose} className="btn-outline-gold" style={{ marginTop: 22 }}>
          Entendido
        </button>
      </div>
    </div>
  );
}

function TarjetaDestacada({ club }) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="destacada"
      style={{
        position: "relative",
        aspectRatio: "16 / 9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 28,
        overflow: "hidden",
        textDecoration: "none",
        border: "1px solid var(--border-gold)",
      }}
    >
      <Image src={club.foto1} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,10,11,0.1) 0%, rgba(14,10,11,0.92) 100%)" }} />

      <div style={{ position: "relative" }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--font-body)",
            background: "var(--gold)",
            color: "var(--bg)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            padding: "4px 10px",
            marginBottom: 12,
          }}
        >
          Destacado
        </span>

        <h2 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
          {club.nombre}
        </h2>

        <div style={{ marginTop: 8 }}>
          <span className="badge-gold">{ISLAND_LABEL[club.isla]}</span>
        </div>

        {club.descripcion && (
          <p
            style={{
              marginTop: 10,
              maxWidth: 520,
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--text-secondary)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {club.descripcion}
          </p>
        )}

        {club.horario && (
          <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{club.horario}</p>
        )}

        <span className="btn-gold" style={{ display: "inline-block", marginTop: 16 }}>
          Ver club
        </span>
      </div>
    </Link>
  );
}

function TarjetaClub({ club, onVerMas }) {
  const esImplementado = club.slug === "club-ebano";

  const contenido = (
    <>
      <Martini size={22} color="var(--gold)" />
      <h3 className="heading" style={{ marginTop: 12, fontSize: 20, color: "var(--gold)" }}>
        {club.nombre}
      </h3>
      <div style={{ marginTop: 8 }}>
        <span className="badge-gold">{ISLAND_LABEL[club.isla]}</span>
      </div>
      {club.horario && (
        <p style={{ marginTop: 8, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>{club.horario}</p>
      )}
      <span style={{ display: "inline-block", marginTop: 14, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--gold)" }}>
        Ver más información →
      </span>
    </>
  );

  const estiloTarjeta = {
    display: "block",
    background: "#1c1416",
    border: "1px solid rgba(201,161,90,0.2)",
    padding: 20,
    textDecoration: "none",
    cursor: "pointer",
  };

  if (esImplementado) {
    return (
      <Link href={`/clubs/${club.slug}`} style={estiloTarjeta}>
        {contenido}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onVerMas(club)} style={{ ...estiloTarjeta, textAlign: "left", width: "100%" }}>
      {contenido}
    </button>
  );
}

export function ClubsShell({ clubs, proximamenteSlug }) {
  const [islaFiltro, setIslaFiltro] = useState("todas");
  const [modalClub, setModalClub] = useState(null);

  useEffect(() => {
    if (!proximamenteSlug) return;
    const club = clubs.find((c) => c.slug === proximamenteSlug);
    if (club) setModalClub(club);
  }, [proximamenteSlug, clubs]);

  const destacado = clubs.find((c) => c.destacado);
  const normales = clubs.filter((c) => !c.destacado);

  const normalesFiltrados =
    islaFiltro === "todas" ? normales : normales.filter((c) => c.isla === islaFiltro);
  const destacadoVisible = destacado && (islaFiltro === "todas" || destacado.isla === islaFiltro);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="kicker">Clubs liberales en Canarias</p>
      <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
        Espacios discretos y seguros en las 8 islas
      </h1>

      <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
        {FILTROS_ISLA.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setIslaFiltro(f.value)}
            className={`fetiche-chip ${islaFiltro === f.value ? "active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="clubs-grid" style={{ marginTop: 32 }}>
        {destacadoVisible && <TarjetaDestacada club={destacado} />}
        {normalesFiltrados.map((club) => (
          <TarjetaClub key={club.id} club={club} onVerMas={setModalClub} />
        ))}
      </div>

      {!destacadoVisible && normalesFiltrados.length === 0 && (
        <p style={{ marginTop: 40, textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
          No hay clubs en esta isla todavía.
        </p>
      )}

      {modalClub && <ModalProximamente club={modalClub} onClose={() => setModalClub(null)} />}
    </div>
  );
}

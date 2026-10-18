"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AVATAR_PLACEHOLDER, avatarSrc } from "@/lib/constants";
import { CrearHistoriaModal } from "./CrearHistoriaModal";
import { HistoriaViewer } from "./HistoriaViewer";

function agrupar(historias, meId) {
  const porUsuario = new Map();
  for (const h of historias) {
    if (!porUsuario.has(h.user_id)) {
      porUsuario.set(h.user_id, {
        userId: h.user_id,
        nick: h.nick,
        profileType: h.profile_type,
        avatarFilename: h.avatar_filename,
        historias: [],
      });
    }
    porUsuario.get(h.user_id).historias.push(h);
  }
  const grupos = [...porUsuario.values()];
  const miGrupo = grupos.find((g) => g.userId === meId) || null;
  const otros = grupos.filter((g) => g.userId !== meId);
  return { miGrupo, otros };
}

const estiloBoton = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  width: 76,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
};

const estiloNombre = {
  fontSize: 12,
  color: "var(--text-secondary)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "100%",
};

export function HistoriasFranja({ usuario, avatarUrl }) {
  const [historias, setHistorias] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [visor, setVisor] = useState(null); // { grupos, indiceGrupo }

  function cargar() {
    fetch("/api/historias")
      .then((r) => r.json())
      .then((d) => setHistorias(d.historias || []))
      .catch(() => setHistorias([]));
  }

  useEffect(() => {
    cargar();
  }, []);

  if (historias === null) return null;

  const { miGrupo, otros } = agrupar(historias, usuario.id);
  if (!miGrupo && otros.length === 0) return null;

  const todosLosGrupos = miGrupo ? [miGrupo, ...otros] : otros;

  function abrirGrupo(indice) {
    setVisor({ grupos: todosLosGrupos, indiceGrupo: indice });
  }

  function onHistoriaCreada() {
    setModalCrearAbierto(false);
    cargar();
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <ul aria-label="Historias" className="scroll-sin-barra" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
        <li>
          <button
            type="button"
            onClick={() => (miGrupo ? abrirGrupo(0) : setModalCrearAbierto(true))}
            aria-label={miGrupo ? "Ver tu historia" : "Crear una historia"}
            style={estiloBoton}
          >
            <div className={`historia-marco ${miGrupo ? "historia-marco--nueva" : "historia-marco--crear"}`}>
              {miGrupo ? (
                <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                  <Image sizes="64px"
                    src={avatarUrl || AVATAR_PLACEHOLDER[usuario.profile_type]}
                    alt=""
                    fill
                    unoptimized={false}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "var(--surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--gold)",
                  }}
                >
                  <Plus size={22} aria-hidden="true" />
                </div>
              )}
            </div>
            <span style={estiloNombre}>Tu historia</span>
          </button>
        </li>

        {otros.map((g, i) => {
          const src = avatarSrc(g.userId, g.avatarFilename, g.profileType);
          const noVistas = g.historias.some((h) => !h.vista);
          return (
            <li key={g.userId}>
              <button
                type="button"
                onClick={() => abrirGrupo(miGrupo ? i + 1 : i)}
                aria-label={`Ver historia de ${g.nick}${noVistas ? " (sin ver)" : ""}`}
                style={estiloBoton}
              >
                <div className={`historia-marco${noVistas ? " historia-marco--nueva" : ""}`}>
                  <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                    <Image sizes="64px" src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                  </div>
                </div>
                <span style={estiloNombre}>{g.nick}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {modalCrearAbierto && (
        <CrearHistoriaModal onClose={() => setModalCrearAbierto(false)} onCreada={onHistoriaCreada} />
      )}

      {visor && (
        <HistoriaViewer
          grupos={visor.grupos}
          indiceGrupoInicial={visor.indiceGrupo}
          meId={usuario.id}
          onClose={() => setVisor(null)}
        />
      )}
    </div>
  );
}

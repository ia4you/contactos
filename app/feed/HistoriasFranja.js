"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AVATAR_PLACEHOLDER } from "@/lib/constants";
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
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
        <button
          type="button"
          onClick={() => (miGrupo ? abrirGrupo(0) : setModalCrearAbierto(true))}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            width: 68,
            flexShrink: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: miGrupo ? "2px solid var(--gold)" : "2px dashed rgba(201,161,90,0.4)",
              padding: 2,
            }}
          >
            {miGrupo ? (
              <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                <Image
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
                  borderRadius: "50%",
                  background: "var(--surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gold)",
                }}
              >
                <Plus size={22} />
              </div>
            )}
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)" }}>Tu historia</span>
        </button>

        {otros.map((g, i) => {
          const src = g.avatarFilename ? `/uploads/${g.userId}/${g.avatarFilename}` : AVATAR_PLACEHOLDER[g.profileType];
          const noVistas = g.historias.some((h) => !h.vista);
          return (
            <button
              key={g.userId}
              type="button"
              onClick={() => abrirGrupo(miGrupo ? i + 1 : i)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                width: 68,
                flexShrink: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: noVistas ? "2px solid var(--gold)" : "2px solid rgba(244,234,217,0.2)",
                  padding: 2,
                }}
              >
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
                  <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                </div>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {g.nick}
              </span>
            </button>
          );
        })}
      </div>

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

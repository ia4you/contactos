"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ISLANDS, PROFILE_TYPES } from "@/lib/constants";
import { tiempoRelativo } from "@/lib/tiempo";
import { Dialogo } from "../components/Dialogo";
import { useConfirmar } from "../components/Confirmar";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

const FILTROS = [
  { id: "todas", label: "Todas" },
  { id: "activas", label: "Activas" },
  { id: "suspendidas", label: "Suspendidas" },
  { id: "pendientes", label: "Pendientes de borrado" },
];

const estiloCelda = { padding: "10px 12px", color: "var(--text-secondary)", verticalAlign: "top" };
const estiloBoton = { fontSize: 12, padding: "5px 10px", whiteSpace: "nowrap" };

function estadoDe(u) {
  if (u.role === "admin") return "admin";
  if (u.suspended_at) return "suspendida";
  if (u.deleted_at) return "pendiente";
  return "activa";
}

function Estado({ u }) {
  const estado = estadoDe(u);
  if (estado === "admin") return <span style={{ color: "var(--gold)" }}>Admin</span>;
  if (estado === "activa") return <span style={{ color: "var(--online)" }}>Activa</span>;
  if (estado === "suspendida") {
    return (
      <span style={{ color: "var(--danger)" }}>
        Suspendida {tiempoRelativo(u.suspended_at)}
        {u.suspended_reason && (
          <span style={{ display: "block", color: "var(--text-muted)", maxWidth: 260 }}>Motivo: {u.suspended_reason}</span>
        )}
      </span>
    );
  }
  return <span style={{ color: "var(--gold)" }}>Eliminada por su titular {tiempoRelativo(u.deleted_at)}</span>;
}

export function AdminUsuarios() {
  const confirmar = useConfirmar();
  const [filtro, setFiltro] = useState("todas");
  const [usuarios, setUsuarios] = useState(null);
  const [dialogo, setDialogo] = useState(null); // { tipo: "suspender" | "eliminar", usuario }
  const [aviso, setAviso] = useState("");

  function cargar(estado = filtro) {
    fetch(`/api/admin/usuarios?estado=${estado}`)
      .then((r) => r.json())
      .then((d) => setUsuarios(d.usuarios || []))
      .catch(() => setUsuarios([]));
  }

  useEffect(() => {
    setUsuarios(null);
    cargar(filtro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  async function accion(url, opciones, textoOk) {
    const res = await fetch(url, opciones);
    const data = await res.json().catch(() => null);
    if (!res.ok) return data?.error || "No se pudo completar la acción.";
    setDialogo(null);
    setAviso(textoOk);
    cargar();
    return null;
  }

  const suspender = (u, motivo) =>
    accion(
      `/api/admin/usuarios/${u.id}/suspender`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ motivo }) },
      `Cuenta de ${u.nick} suspendida. Sus sesiones abiertas se cerrarán en menos de un minuto.`
    );

  const eliminar = (u, confirmacionNick) =>
    accion(
      `/api/admin/usuarios/${u.id}`,
      { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmacionNick }) },
      `Cuenta de ${u.nick} eliminada definitivamente.`
    );

  async function reactivar(u) {
    if (!(await confirmar({ mensaje: `¿Reactivar la cuenta de ${u.nick}?`, detalle: "Volverá a aparecer en la web y podrá iniciar sesión.", accion: "Reactivar", peligro: false }))) return;
    const error = await accion(`/api/admin/usuarios/${u.id}/reactivar`, { method: "PATCH" }, `Cuenta de ${u.nick} reactivada.`);
    if (error) setAviso(error);
  }

  return (
    <div>
      <div role="group" aria-label="Filtrar cuentas" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className="btn-outline-gold"
            style={estiloBoton}
          >
            {f.label}
          </button>
        ))}
      </div>

      {aviso && (
        <p role="status" style={{ marginBottom: 16, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          {aviso}
        </p>
      )}

      {usuarios === null ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
      ) : usuarios.length === 0 ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>No hay cuentas en este filtro.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                {["Nick", "Isla", "Tipo", "Alta", "Última act.", "Fotos", "Estado", "Acciones"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-muted)", fontSize: 12, letterSpacing: "0.04em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const estado = estadoDe(u);
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--rule)" }}>
                    <td style={{ ...estiloCelda, color: "var(--text)" }}>{u.nick}</td>
                    <td style={estiloCelda}>{ISLAND_LABEL[u.island]}</td>
                    <td style={estiloCelda}>{PROFILE_TYPE_LABEL[u.profile_type]}</td>
                    <td style={estiloCelda}>{tiempoRelativo(u.created_at)}</td>
                    <td style={estiloCelda}>{u.last_active ? tiempoRelativo(u.last_active) : "—"}</td>
                    <td style={estiloCelda}>{u.fotos_count}</td>
                    <td style={estiloCelda}>
                      <Estado u={u} />
                    </td>
                    <td style={estiloCelda}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/perfil/${u.nick}`} className="btn-outline-gold" style={estiloBoton}>
                          Ver perfil
                        </Link>
                        {estado === "activa" && (
                          <button type="button" onClick={() => setDialogo({ tipo: "suspender", usuario: u })} className="btn-outline-gold btn-peligro" style={estiloBoton}>
                            Suspender
                          </button>
                        )}
                        {estado === "suspendida" && (
                          <button type="button" onClick={() => reactivar(u)} className="btn-outline-gold" style={estiloBoton}>
                            Reactivar
                          </button>
                        )}
                        {(estado === "suspendida" || estado === "pendiente") && (
                          <button type="button" onClick={() => setDialogo({ tipo: "eliminar", usuario: u })} className="btn-outline-gold btn-peligro" style={estiloBoton}>
                            Eliminar definitivamente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialogo?.tipo === "suspender" && (
        <DialogoSuspender usuario={dialogo.usuario} onCerrar={() => setDialogo(null)} onConfirmar={suspender} />
      )}
      {dialogo?.tipo === "eliminar" && (
        <DialogoEliminar usuario={dialogo.usuario} onCerrar={() => setDialogo(null)} onConfirmar={eliminar} />
      )}
    </div>
  );
}

function PieDialogo({ onCerrar, enviando, deshabilitado, texto, textoEnviando }) {
  return (
    <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 10 }}>
      <button type="button" onClick={onCerrar} className="btn-outline-gold" style={{ fontSize: 12 }}>
        Cancelar
      </button>
      <button
        type="submit"
        disabled={deshabilitado || enviando}
        className="btn-outline-gold btn-peligro"
        style={{ fontSize: 12, opacity: deshabilitado || enviando ? 0.45 : 1 }}
      >
        {enviando ? textoEnviando : texto}
      </button>
    </div>
  );
}

function useEnvio(onConfirmar, usuario) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  async function enviar(valor) {
    setEnviando(true);
    setError("");
    const err = await onConfirmar(usuario, valor);
    setEnviando(false);
    if (err) setError(err);
  }
  return { enviando, error, enviar };
}

function DialogoSuspender({ usuario, onCerrar, onConfirmar }) {
  const [motivo, setMotivo] = useState("");
  const { enviando, error, enviar } = useEnvio(onConfirmar, usuario);
  return (
    <Dialogo onCerrar={onCerrar} idTitulo="suspender-titulo">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(motivo);
        }}
      >
        <h2 id="suspender-titulo" className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
          Suspender a {usuario.nick}
        </h2>
        <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          Deja de aparecer en la web, no puede iniciar sesión y sus sesiones abiertas se cierran. Se puede reactivar.
        </p>
        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">Motivo (opcional, solo lo ven los administradores)</span>
          <textarea
            rows={3}
            maxLength={500}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="input-field"
            style={{ resize: "vertical" }}
            autoFocus
          />
        </label>
        {error && <p role="alert" style={{ marginTop: 12, fontSize: 14, color: "var(--danger)" }}>{error}</p>}
        <PieDialogo onCerrar={onCerrar} enviando={enviando} texto="Suspender" textoEnviando="Suspendiendo…" />
      </form>
    </Dialogo>
  );
}

function DialogoEliminar({ usuario, onCerrar, onConfirmar }) {
  const [nick, setNick] = useState("");
  const { enviando, error, enviar } = useEnvio(onConfirmar, usuario);
  const coincide = nick === usuario.nick;
  return (
    <Dialogo onCerrar={onCerrar} idTitulo="eliminar-titulo">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (coincide) enviar(nick);
        }}
      >
        <h2 id="eliminar-titulo" className="heading" style={{ fontSize: 22, color: "var(--text)" }}>
          Eliminar definitivamente a {usuario.nick}
        </h2>
        <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--danger)" }}>No se puede deshacer.</strong> Se borran sus fotos del disco, publicaciones,
          historias, comentarios, likes, mensajes, visitas, amistades, bloqueos, anuncios y eventos. Las denuncias contra
          esta cuenta se conservan solo con su nick y la fecha.
        </p>
        <label style={{ display: "block", marginTop: 18 }}>
          <span className="label-field">
            Escribe <strong style={{ color: "var(--text)" }}>{usuario.nick}</strong> para confirmar
          </span>
          <input
            type="text"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            className="input-field"
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </label>
        {error && <p role="alert" style={{ marginTop: 12, fontSize: 14, color: "var(--danger)" }}>{error}</p>}
        <PieDialogo
          onCerrar={onCerrar}
          enviando={enviando}
          deshabilitado={!coincide}
          texto="Eliminar definitivamente"
          textoEnviando="Eliminando…"
        />
      </form>
    </Dialogo>
  );
}

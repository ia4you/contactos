"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload } from "lucide-react";
import { ISLANDS, LOOKING_FOR_OPTIONS, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { EmptyState } from "../components/EmptyState";

const ESTADO_BADGE = {
  pending: { texto: "En revisión", color: "#c9a15a" },
  approved: { texto: "Aprobada", color: "#4a9a6a" },
  rejected: { texto: "Rechazada", color: "#9a3a3a" },
};

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

export function PerfilForm({ usuario, fotosIniciales }) {
  const [seccion, setSeccion] = useState("datos");

  const [bio, setBio] = useState(usuario.bio || "");
  const [island, setIsland] = useState(usuario.island);
  const [lookingFor, setLookingFor] = useState(usuario.looking_for || []);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [fotos, setFotos] = useState(fotosIniciales);
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const inputFileRef = useRef(null);

  const avatarFoto = fotos.find((f) => f.is_avatar && f.status === "approved");
  const avatarSrc = avatarFoto
    ? `/uploads/${usuario.id}/${avatarFoto.filename}`
    : AVATAR_PLACEHOLDER[usuario.profile_type];

  function toggleLookingFor(valor) {
    setLookingFor((lf) => (lf.includes(valor) ? lf.filter((v) => v !== valor) : [...lf, valor]));
  }

  async function guardarPerfil(e) {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, island, lookingFor }),
    });
    setGuardando(false);
    if (res.ok) setGuardado(true);
  }

  async function subirFoto(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setErrorFoto("");
    setSubiendo(true);

    const formData = new FormData();
    formData.append("file", archivo);

    const res = await fetch("/api/perfil/fotos", { method: "POST", body: formData });
    const data = await res.json();
    setSubiendo(false);
    if (inputFileRef.current) inputFileRef.current.value = "";

    if (!res.ok) {
      setErrorFoto(data.error || "No se pudo subir la foto.");
      return;
    }
    setFotos((f) => [data.foto, ...f]);
  }

  async function borrarFoto(id) {
    setFotos((f) => f.filter((foto) => foto.id !== id));
    await fetch(`/api/perfil/fotos?id=${id}`, { method: "DELETE" });
  }

  async function marcarAvatar(id) {
    setFotos((f) => f.map((foto) => ({ ...foto, is_avatar: foto.id === id })));
    await fetch("/api/perfil/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: id }),
    });
  }

  async function togglePrivada(id, valorActual) {
    setFotos((f) => f.map((foto) => (foto.id === id ? { ...foto, is_private: !valorActual } : foto)));
    await fetch("/api/perfil/fotos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: id, isPrivate: !valorActual }),
    });
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0" }}>
      <div className="perfil-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 81px)" }}>
        <aside
          style={{
            background: "var(--bg-secondary)",
            borderRight: "1px solid rgba(201,161,90,0.18)",
            padding: "40px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ position: "relative", width: 120, height: 120, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border-gold)" }}>
            <Image src={avatarSrc} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
          </div>
          <h1 className="heading" style={{ marginTop: 20, fontSize: 22, color: "var(--text)" }}>
            {usuario.nick}
          </h1>

          <span className="badge-gold" style={{ marginTop: 12 }}>
            {ISLAND_LABEL[usuario.island]}
          </span>

          <nav style={{ marginTop: 40, width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            <button
              type="button"
              onClick={() => setSeccion("datos")}
              className={`nav-link-vertical ${seccion === "datos" ? "active" : ""}`}
              style={{ textAlign: "left" }}
            >
              Mis datos
            </button>
            <button
              type="button"
              onClick={() => setSeccion("fotos")}
              className={`nav-link-vertical ${seccion === "fotos" ? "active" : ""}`}
              style={{ textAlign: "left" }}
            >
              Mis fotos
            </button>
            <Link href="/mi-perfil/eliminar" className="nav-link-vertical" style={{ color: "#9a3a3a" }}>
              Eliminar cuenta
            </Link>
          </nav>
        </aside>

        <section style={{ padding: "48px 40px" }}>
          {seccion === "datos" ? (
            <form onSubmit={guardarPerfil} style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 className="heading" style={{ fontSize: 24, color: "var(--text)" }}>
                Mis datos
              </h2>

              <label>
                <span className="label-field">Biografía</span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field"
                  style={{ resize: "none" }}
                />
              </label>

              <label>
                <span className="label-field">Isla</span>
                <select value={island} onChange={(e) => setIsland(e.target.value)} className="input-field">
                  {ISLANDS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="label-field">¿Qué buscas?</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {LOOKING_FOR_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}
                    >
                      <input
                        type="checkbox"
                        checked={lookingFor.includes(o.value)}
                        onChange={() => toggleLookingFor(o.value)}
                        className="checkbox-gold"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button type="submit" disabled={guardando} className="btn-outline-gold">
                  {guardando ? "Guardando…" : "Guardar cambios"}
                </button>
                {guardado && (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)" }}>Guardado.</span>
                )}
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <h2 className="heading" style={{ fontSize: 24, color: "var(--text)" }}>
                  Mis fotos
                </h2>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px dashed rgba(201,161,90,0.5)",
                    color: "var(--text-secondary)",
                    padding: "10px 18px",
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    cursor: "pointer",
                    transition: "border-color 0.2s ease, color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--gold)";
                    e.currentTarget.style.color = "var(--gold)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,161,90,0.5)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <Upload size={15} />
                  {subiendo ? "Subiendo…" : "Subir foto"}
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    style={{ display: "none" }}
                    disabled={subiendo}
                    onChange={subirFoto}
                  />
                </label>
              </div>
              {errorFoto && (
                <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{errorFoto}</p>
              )}

              {fotos.length === 0 ? (
                <EmptyState texto="Aún no has subido ninguna foto" />
              ) : (
                <div
                  style={{
                    marginTop: 32,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 14,
                  }}
                  className="fotos-grid"
                >
                  {fotos.map((foto) => {
                    const badge = ESTADO_BADGE[foto.status];
                    const atenuada = foto.status !== "approved";
                    return (
                      <div
                        key={foto.id}
                        className="group"
                        style={{
                          position: "relative",
                          aspectRatio: "1 / 1",
                          overflow: "hidden",
                          border: "1px solid var(--border-gold)",
                        }}
                      >
                        <Image
                          src={`/uploads/${usuario.id}/${foto.filename}`}
                          alt=""
                          fill
                          unoptimized={false}
                          style={{ objectFit: "cover", opacity: atenuada ? 0.6 : 1 }}
                        />
                        {badge && (
                          <span
                            style={{
                              position: "absolute",
                              left: 6,
                              top: 6,
                              fontFamily: "var(--font-body)",
                              fontSize: 9,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              padding: "3px 7px",
                              border: `1px solid ${badge.color}`,
                              color: badge.color,
                              background: "rgba(14,10,11,0.7)",
                            }}
                          >
                            {badge.texto}
                          </span>
                        )}
                        {foto.is_avatar && (
                          <span
                            style={{
                              position: "absolute",
                              right: 6,
                              top: 6,
                              fontFamily: "var(--font-body)",
                              fontSize: 9,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              padding: "3px 7px",
                              background: "var(--gold)",
                              color: "var(--bg)",
                            }}
                          >
                            Avatar
                          </span>
                        )}

                        <div
                          className="fotos-grid__overlay"
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            background: "rgba(14,10,11,0.75)",
                            padding: 8,
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => marcarAvatar(foto.id)}
                            disabled={foto.is_avatar}
                            style={{
                              width: "100%",
                              border: "1px solid var(--border-gold)",
                              background: "transparent",
                              color: "var(--text)",
                              padding: "6px",
                              fontFamily: "var(--font-body)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              cursor: "pointer",
                              opacity: foto.is_avatar ? 0.4 : 1,
                            }}
                          >
                            Avatar
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePrivada(foto.id, foto.is_private)}
                            style={{
                              width: "100%",
                              border: "1px solid var(--border-gold)",
                              background: "transparent",
                              color: "var(--text)",
                              padding: "6px",
                              fontFamily: "var(--font-body)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              cursor: "pointer",
                            }}
                          >
                            {foto.is_private ? "Privada ✓" : "Privada"}
                          </button>
                          <button
                            type="button"
                            onClick={() => borrarFoto(foto.id)}
                            style={{
                              width: "100%",
                              border: "1px solid rgba(154,58,58,0.5)",
                              background: "transparent",
                              color: "#e07a7a",
                              padding: "6px",
                              fontFamily: "var(--font-body)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              cursor: "pointer",
                            }}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

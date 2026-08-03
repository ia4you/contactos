"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload } from "lucide-react";
import { ISLANDS, PROFILE_TYPES, LOOKING_FOR_OPTIONS, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { EmptyState } from "../components/EmptyState";

const ESTADO_BADGE = {
  pending: { texto: "En revisión", clase: "bg-yellow-500/20 text-yellow-300" },
  approved: { texto: "Aprobada", clase: "bg-emerald-500/20 text-emerald-300" },
  rejected: { texto: "Rechazada", clase: "bg-red-500/20 text-red-300" },
};

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));
const PROFILE_TYPE_LABEL = Object.fromEntries(PROFILE_TYPES.map((p) => [p.value, p.label]));

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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <aside className="flex flex-col items-center rounded-xl border border-borde bg-surface p-6 text-center md:items-start md:text-left">
          <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full border border-borde">
            <Image src={avatarSrc} alt="" fill className="object-cover" />
          </div>
          <h1 className="mt-4 font-display text-xl font-semibold text-texto">{usuario.nick}</h1>

          <div className="mt-3 flex flex-wrap gap-2 md:justify-start">
            <span className="rounded-full bg-champan/15 px-3 py-1 text-xs text-champan">
              {ISLAND_LABEL[usuario.island]}
            </span>
            <span className="rounded-full bg-burdeos/20 px-3 py-1 text-xs text-burdeos">
              {PROFILE_TYPE_LABEL[usuario.profile_type]}
            </span>
          </div>

          <nav className="mt-8 flex w-full flex-col gap-1">
            <button
              type="button"
              onClick={() => setSeccion("datos")}
              className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                seccion === "datos" ? "bg-elevada text-texto" : "text-texto-secundario hover:text-texto"
              }`}
            >
              Mis datos
            </button>
            <button
              type="button"
              onClick={() => setSeccion("fotos")}
              className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                seccion === "fotos" ? "bg-elevada text-texto" : "text-texto-secundario hover:text-texto"
              }`}
            >
              Mis fotos
            </button>
            <Link
              href="/mi-perfil/eliminar"
              className="rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-elevada"
            >
              Eliminar cuenta
            </Link>
          </nav>
        </aside>

        <section className="rounded-xl border border-borde bg-surface p-6">
          {seccion === "datos" ? (
            <form onSubmit={guardarPerfil} className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-texto">Mis datos</h2>

              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-texto-secundario">Biografía</span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="campo h-auto resize-none py-3"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-texto-secundario">Isla</span>
                <select value={island} onChange={(e) => setIsland(e.target.value)} className="campo">
                  {ISLANDS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset>
                <legend className="mb-2 text-xs font-medium text-texto-secundario">¿Qué buscas?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {LOOKING_FOR_OPTIONS.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 text-sm text-texto">
                      <input
                        type="checkbox"
                        checked={lookingFor.includes(o.value)}
                        onChange={() => toggleLookingFor(o.value)}
                        className="h-4 w-4 accent-burdeos"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={guardando}
                className="rounded-full bg-burdeos px-6 py-2.5 font-body font-semibold text-white transition hover:bg-burdeos-hover disabled:opacity-60"
              >
                {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
              {guardado && <span className="ml-3 text-sm text-champan">Guardado.</span>}
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-texto">Mis fotos</h2>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-burdeos px-4 py-2 text-sm text-texto transition hover:bg-burdeos/10">
                  <Upload size={16} />
                  {subiendo ? "Subiendo…" : "Subir foto"}
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={subiendo}
                    onChange={subirFoto}
                  />
                </label>
              </div>
              {errorFoto && <p className="mt-2 text-sm text-red-400">{errorFoto}</p>}

              {fotos.length === 0 ? (
                <EmptyState texto="Aún no has subido ninguna foto" />
              ) : (
                <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-4">
                  {fotos.map((foto) => {
                    const badge = ESTADO_BADGE[foto.status];
                    const atenuada = foto.status !== "approved";
                    return (
                      <div
                        key={foto.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-borde"
                      >
                        <Image
                          src={`/uploads/${usuario.id}/${foto.filename}`}
                          alt=""
                          fill
                          className={`object-cover transition ${atenuada ? "opacity-60" : ""}`}
                        />
                        {badge && (
                          <span
                            className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] ${badge.clase}`}
                          >
                            {badge.texto}
                          </span>
                        )}
                        {foto.is_avatar && (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-burdeos px-2 py-0.5 text-[10px] text-white">
                            Avatar
                          </span>
                        )}

                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/70 p-2 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => marcarAvatar(foto.id)}
                            disabled={foto.is_avatar}
                            className="w-full rounded-md border border-borde bg-surface/80 py-1 text-[11px] text-texto disabled:opacity-40"
                          >
                            Avatar
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePrivada(foto.id, foto.is_private)}
                            className="w-full rounded-md border border-borde bg-surface/80 py-1 text-[11px] text-texto"
                          >
                            {foto.is_private ? "Privada ✓" : "Privada"}
                          </button>
                          <button
                            type="button"
                            onClick={() => borrarFoto(foto.id)}
                            className="w-full rounded-md border border-red-400/40 bg-surface/80 py-1 text-[11px] text-red-400"
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

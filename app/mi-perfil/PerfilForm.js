"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ISLANDS, LOOKING_FOR_OPTIONS } from "@/lib/constants";
import { LogoutButton } from "../components/LogoutButton";

const ESTADO_BADGE = {
  pending: { texto: "En revisión", clase: "bg-champan/20 text-champan" },
  approved: { texto: "Aprobada", clase: "bg-emerald-500/20 text-emerald-300" },
  rejected: { texto: "Rechazada", clase: "bg-red-500/20 text-red-300" },
};

export function PerfilForm({ usuario, fotosIniciales }) {
  const [bio, setBio] = useState(usuario.bio || "");
  const [island, setIsland] = useState(usuario.island);
  const [lookingFor, setLookingFor] = useState(usuario.looking_for || []);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [fotos, setFotos] = useState(fotosIniciales);
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const inputFileRef = useRef(null);

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
    <main className="mx-auto max-w-2xl px-6 py-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-champan">Mi perfil</h1>
          <p className="mt-1 text-sm text-[#F2EDE4]/60">
            {usuario.nick} · {usuario.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <form onSubmit={guardarPerfil} className="mt-10 space-y-6">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#F2EDE4]/80">Biografía</span>
          <textarea
            rows={4}
            maxLength={2000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="campo resize-none"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#F2EDE4]/80">Isla</span>
          <select value={island} onChange={(e) => setIsland(e.target.value)} className="campo">
            {ISLANDS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-[#F2EDE4]/80">¿Qué buscas?</legend>
          <div className="grid grid-cols-2 gap-2">
            {LOOKING_FOR_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm text-[#F2EDE4]/80">
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
          className="rounded-full bg-burdeos px-6 py-2.5 font-body font-semibold text-[#F2EDE4] transition hover:bg-burdeos-light disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        {guardado && <span className="ml-3 text-sm text-champan">Guardado.</span>}
      </form>

      <section className="mt-14 border-t border-champan/15 pt-8">
        <h2 className="font-display text-xl font-semibold text-champan">Mis fotos</h2>

        <label className="mt-4 inline-block cursor-pointer rounded-full border border-champan/30 px-5 py-2 text-sm text-[#F2EDE4]/80 transition hover:border-champan/60">
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
        {errorFoto && <p className="mt-2 text-sm text-red-400">{errorFoto}</p>}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {fotos.map((foto) => {
            const badge = ESTADO_BADGE[foto.status];
            return (
              <div key={foto.id} className="overflow-hidden rounded-xl border border-champan/15">
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/uploads/${usuario.id}/${foto.filename}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {badge && (
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs ${badge.clase}`}>
                      {badge.texto}
                    </span>
                  )}
                  {foto.is_avatar && (
                    <span className="absolute right-2 top-2 rounded-full bg-burdeos px-2 py-0.5 text-xs text-[#F2EDE4]">
                      Avatar
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 p-2 text-xs">
                  <button
                    type="button"
                    onClick={() => marcarAvatar(foto.id)}
                    disabled={foto.is_avatar}
                    className="w-full rounded-md border border-champan/20 py-1 text-[#F2EDE4]/70 disabled:opacity-40"
                  >
                    Usar como avatar
                  </button>
                  <label className="flex items-center gap-1.5 text-[#F2EDE4]/70">
                    <input
                      type="checkbox"
                      checked={foto.is_private}
                      onChange={() => togglePrivada(foto.id, foto.is_private)}
                      className="h-3.5 w-3.5 accent-burdeos"
                    />
                    Privada
                  </label>
                  <button
                    type="button"
                    onClick={() => borrarFoto(foto.id)}
                    className="w-full rounded-md border border-red-400/30 py-1 text-red-400"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-14 border-t border-champan/15 pt-8">
        <Link href="/mi-perfil/eliminar" className="text-sm text-red-400 underline underline-offset-4">
          Eliminar mi cuenta
        </Link>
      </div>
    </main>
  );
}

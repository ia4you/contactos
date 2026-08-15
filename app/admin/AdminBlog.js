"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { slugify } from "@/lib/slug";
import { EmptyState } from "../components/EmptyState";

const VACIO = { id: null, titulo: "", slug: "", extracto: "", contenido: "", foto: null };

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function AdminBlog() {
  const [posts, setPosts] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [slugTocado, setSlugTocado] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [guardando, setGuardando] = useState(null);
  const [error, setError] = useState("");
  const inputFileRef = useRef(null);

  function cargar() {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => setPosts([]));
  }

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function nuevoArticulo() {
    setForm(VACIO);
    setSlugTocado(false);
    setArchivo(null);
    setPreviewUrl(null);
    setError("");
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  function editar(post) {
    setForm({
      id: post.id,
      titulo: post.titulo,
      slug: post.slug,
      extracto: post.extracto || "",
      contenido: post.contenido || "",
      foto: post.foto || null,
    });
    setSlugTocado(true);
    setArchivo(null);
    setPreviewUrl(null);
    setError("");
    if (inputFileRef.current) inputFileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cambiarTitulo(titulo) {
    setForm((f) => ({ ...f, titulo, slug: slugTocado ? f.slug : slugify(titulo) }));
  }

  function seleccionarArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivo(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function guardar(publicado) {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setError("Título y contenido son obligatorios.");
      return;
    }
    setGuardando(publicado ? "publicar" : "borrador");
    setError("");

    const body = new FormData();
    body.append("titulo", form.titulo.trim());
    body.append("slug", form.slug.trim() || slugify(form.titulo));
    body.append("extracto", form.extracto.trim());
    body.append("contenido", form.contenido);
    body.append("publicado", String(publicado));
    if (archivo) body.append("file", archivo);

    const url = form.id ? `/api/admin/blog/${form.id}` : "/api/admin/blog";
    const res = await fetch(url, { method: form.id ? "PATCH" : "POST", body });
    const data = await res.json().catch(() => null);
    setGuardando(null);

    if (!res.ok) {
      setError(data?.error || "No se pudo guardar el artículo.");
      return;
    }
    nuevoArticulo();
    cargar();
  }

  async function despublicar(id) {
    const body = new FormData();
    body.append("publicado", "false");
    await fetch(`/api/admin/blog/${id}`, { method: "PATCH", body });
    cargar();
  }

  async function eliminar(id) {
    if (!window.confirm("¿Eliminar este artículo? No se puede deshacer.")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (form.id === id) nuevoArticulo();
  }

  return (
    <div>
      <div style={{ background: "#141414", border: "1px solid #2a2a2a", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="heading" style={{ fontSize: 20, color: "var(--text)" }}>
            {form.id ? "Editar artículo" : "Nuevo artículo"}
          </h2>
          {form.id && (
            <button type="button" onClick={nuevoArticulo} className="btn-outline-gold" style={{ fontSize: 11, padding: "6px 12px" }}>
              Cancelar edición
            </button>
          )}
        </div>

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <label>
            <span className="label-field">Título</span>
            <input
              type="text"
              maxLength={100}
              value={form.titulo}
              onChange={(e) => cambiarTitulo(e.target.value)}
              className="input-field"
            />
          </label>

          <label>
            <span className="label-field">Slug</span>
            <input
              type="text"
              maxLength={100}
              value={form.slug}
              onChange={(e) => {
                setSlugTocado(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
              className="input-field"
            />
            <span style={{ marginTop: 4, display: "block", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>
              /blog/{slugify(form.slug) || "…"}
            </span>
          </label>

          <label>
            <span className="label-field">Extracto ({form.extracto.length}/300)</span>
            <textarea
              maxLength={300}
              rows={3}
              value={form.extracto}
              onChange={(e) => setForm((f) => ({ ...f, extracto: e.target.value }))}
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </label>

          <label>
            <span className="label-field">Contenido</span>
            <textarea
              rows={14}
              value={form.contenido}
              onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
              className="input-field"
              style={{ resize: "vertical", fontFamily: "var(--font-body)" }}
            />
          </label>

          <label>
            <span className="label-field">Foto</span>
            <input ref={inputFileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={seleccionarArchivo} />
          </label>

          {(previewUrl || form.foto) && (
            <div style={{ position: "relative", width: 240, aspectRatio: "16 / 9", overflow: "hidden", border: "1px solid #2a2a2a" }}>
              <Image src={previewUrl || `/uploads/blog/${form.foto}`} alt="" fill unoptimized style={{ objectFit: "cover" }} />
            </div>
          )}

          {error && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#e07a7a" }}>{error}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => guardar(false)}
              disabled={!!guardando}
              className="btn-outline-gold"
            >
              {guardando === "borrador" ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              type="button"
              onClick={() => guardar(true)}
              disabled={!!guardando}
              className="btn-gold"
            >
              {guardando === "publicar" ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 className="heading" style={{ fontSize: 20, color: "var(--text)", marginBottom: 16 }}>
          Artículos
        </h2>

        {posts === null ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>Cargando…</p>
        ) : posts.length === 0 ? (
          <EmptyState texto="Todavía no hay artículos" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#141414",
                  border: "1px solid #2a2a2a",
                  padding: 18,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)" }}>{p.titulo}</p>
                    <span
                      className="badge-gold"
                      style={{
                        fontSize: 9,
                        ...(p.publicado ? {} : { background: "transparent", border: "1px solid var(--text-muted)", color: "var(--text-muted)" }),
                      }}
                    >
                      {p.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>
                    {formatearFecha(p.publicado_at || p.created_at)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button type="button" onClick={() => editar(p)} className="btn-outline-gold" style={{ fontSize: 11, padding: "8px 14px" }}>
                    Editar
                  </button>
                  {p.publicado && (
                    <button type="button" onClick={() => despublicar(p.id)} className="btn-outline-gold" style={{ fontSize: 11, padding: "8px 14px" }}>
                      Despublicar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => eliminar(p.id)}
                    className="btn-outline-gold"
                    style={{ fontSize: 11, padding: "8px 14px", borderColor: "rgba(154,58,58,0.5)", color: "#e07a7a" }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

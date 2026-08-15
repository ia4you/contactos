"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const LIMITE = 9;

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function TarjetaBlog({ post }) {
  return (
    <article style={{ background: "#141414", border: "1px solid #2a2a2a" }}>
      <Link href={`/blog/${post.slug}`} style={{ display: "block", position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
        {post.foto ? (
          <Image
            src={`/uploads/blog/${post.foto}`}
            alt=""
            fill
            unoptimized={false}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#1c1416" }} />
        )}
      </Link>
      <div style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>
          {formatearFecha(post.publicado_at)}
        </p>
        <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
          <h2 className="heading" style={{ marginTop: 8, fontSize: 20, color: "var(--text)" }}>
            {post.titulo}
          </h2>
        </Link>
        {post.extracto && (
          <p style={{ marginTop: 10, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
            {post.extracto}
          </p>
        )}
        <Link href={`/blog/${post.slug}`} className="btn-outline-gold" style={{ marginTop: 16, display: "inline-block" }}>
          Leer más
        </Link>
      </div>
    </article>
  );
}

export function BlogShell({ postsIniciales, hasMoreInicial }) {
  const [posts, setPosts] = useState(postsIniciales);
  const [offset, setOffset] = useState(postsIniciales.length);
  const [hasMore, setHasMore] = useState(hasMoreInicial);
  const [cargando, setCargando] = useState(false);

  async function verMas() {
    setCargando(true);
    const res = await fetch(`/api/blog?offset=${offset}`);
    const data = await res.json().catch(() => null);
    setCargando(false);
    if (!res.ok || !data) return;
    setPosts((prev) => [...prev, ...data.posts]);
    setHasMore(data.hasMore);
    setOffset(offset + LIMITE);
  }

  return (
    <>
      <div className="blog-grid">
        {posts.map((p) => (
          <TarjetaBlog key={p.id} post={p} />
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button type="button" onClick={verMas} disabled={cargando} className="btn-outline-gold">
            {cargando ? "Cargando…" : "Ver más"}
          </button>
        </div>
      )}
    </>
  );
}

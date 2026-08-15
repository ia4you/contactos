import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { Footer } from "../../components/Footer";
import { ArticuloFoto } from "./ArticuloFoto";

async function obtenerPost(slug) {
  const { rows } = await query(
    `SELECT id, titulo, slug, extracto, contenido, foto, publicado_at
       FROM blog_posts
      WHERE slug = $1 AND publicado = true`,
    [slug]
  );
  return rows[0] || null;
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata({ params }) {
  const post = await obtenerPost(params.slug);
  if (!post) return {};

  const url = `https://contactos.turel.es/blog/${post.slug}`;
  const description = post.extracto || post.contenido.slice(0, 160);
  const imagen = post.foto ? `https://contactos.turel.es/uploads/blog/${post.foto}` : undefined;

  return {
    title: `${post.titulo} | Blog Contactos Liberales Canarias`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.titulo,
      description,
      url,
      images: imagen ? [{ url: imagen, width: 1600, height: 900, alt: post.titulo }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.titulo,
      description,
      images: imagen ? [imagen] : undefined,
    },
  };
}

export default async function ArticuloBlog({ params }) {
  const post = await obtenerPost(params.slug);
  if (!post) notFound();

  return (
    <main>
      <section style={{ padding: "24px 24px 0", maxWidth: 860, margin: "0 auto" }}>
        <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span className="heading" style={{ fontSize: 16, letterSpacing: 3, color: "var(--text)" }}>
            ← CONTACTOS BLOG
          </span>
        </Link>
      </section>

      {post.foto && <ArticuloFoto foto={post.foto} alt="" />}

      <article style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px 0" }}>
        <p className="kicker">Blog</p>
        <h1 className="heading" style={{ marginTop: 12, fontFamily: "var(--font-display)", fontSize: 36, color: "var(--text)" }}>
          {post.titulo}
        </h1>
        <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>
          {formatearFecha(post.publicado_at)}
        </p>

        <div
          style={{
            marginTop: 32,
            fontFamily: "var(--font-body)",
            fontSize: 16,
            lineHeight: 1.8,
            color: "var(--text-secondary)",
            whiteSpace: "pre-wrap",
          }}
        >
          {post.contenido}
        </div>
      </article>

      <section style={{ maxWidth: 780, margin: "64px auto 0", padding: "40px 24px", textAlign: "center", borderTop: "1px solid rgba(201,161,90,0.18)" }}>
        <h2 className="heading" style={{ fontSize: 24, color: "var(--text)" }}>
          Únete a la comunidad liberal de Canarias
        </h2>
        <div style={{ marginTop: 20 }}>
          <Link href="/registro" className="btn-gold">
            Crear mi perfil
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

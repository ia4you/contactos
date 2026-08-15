import Link from "next/link";
import { query } from "@/lib/db";
import { Footer } from "../components/Footer";
import { BlogShell } from "./BlogShell";

const LIMITE = 9;

export const metadata = {
  title: "Blog | Contactos Liberales Canarias",
  description:
    "Artículos sobre el ambiente liberal en Canarias: guías, experiencias y consejos para parejas y personas del ambiente en las islas.",
  alternates: { canonical: "https://contactos.turel.es/blog" },
  openGraph: {
    title: "Blog | Contactos Liberales Canarias",
    description: "Artículos sobre el ambiente liberal en Canarias.",
    url: "https://contactos.turel.es/blog",
  },
};

export default async function Blog() {
  const { rows } = await query(
    `SELECT id, titulo, slug, extracto, foto, publicado_at
       FROM blog_posts
      WHERE publicado = true
      ORDER BY publicado_at DESC
      LIMIT $1`,
    [LIMITE + 1]
  );
  const hasMore = rows.length > LIMITE;
  const posts = rows.slice(0, LIMITE);

  return (
    <main>
      <section style={{ padding: "96px 24px 40px", maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span className="heading" style={{ fontSize: 20, letterSpacing: 4, color: "var(--text)" }}>
            CONTACTOS
          </span>
        </Link>

        <p className="kicker" style={{ marginTop: 32 }}>
          Blog
        </p>
        <h1 className="heading" style={{ marginTop: 16, fontSize: "clamp(30px, 5vw, 46px)", color: "var(--text)" }}>
          El ambiente liberal en Canarias
        </h1>
      </section>

      <section style={{ padding: "0 24px 96px", maxWidth: 1200, margin: "0 auto" }}>
        {posts.length === 0 ? (
          <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-muted)" }}>
            Todavía no hay artículos publicados.
          </p>
        ) : (
          <BlogShell postsIniciales={posts} hasMoreInicial={hasMore} />
        )}
      </section>

      <Footer />
    </main>
  );
}

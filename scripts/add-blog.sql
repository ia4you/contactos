CREATE TABLE IF NOT EXISTS blog_posts (
  id serial PRIMARY KEY,
  titulo text NOT NULL,
  slug text NOT NULL UNIQUE,
  contenido text NOT NULL,
  extracto text,
  foto text,
  publicado boolean NOT NULL DEFAULT false,
  publicado_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

BEGIN;

-- Avisos de grupos que se inyectan en el feed general (visibles para todos,
-- no solo miembros), siguiendo el mismo patrón que anuncios/eventos/blog_posts
-- en GET /api/feed/publicaciones: se traen los más recientes y se mezclan por
-- created_at solo en la primera página de la pestaña "Para ti".
CREATE TABLE IF NOT EXISTS grupo_feed_eventos (
  id serial PRIMARY KEY,
  grupo_id integer NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('creado','nueva_entrada')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_grupo_feed_eventos_grupo_id ON grupo_feed_eventos(grupo_id);
CREATE INDEX IF NOT EXISTS ix_grupo_feed_eventos_created_at ON grupo_feed_eventos(created_at DESC);

COMMIT;

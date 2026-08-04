BEGIN;

-- Publicaciones del feed (fotos + textos)
CREATE TABLE IF NOT EXISTS publicaciones (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('foto','texto')),
  contenido text, -- texto libre máx 500 chars, o pie de foto
  photo_id integer REFERENCES photos(id) ON DELETE CASCADE, -- solo si tipo='foto'
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Me gusta en publicaciones
CREATE TABLE IF NOT EXISTS publicacion_likes (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publicacion_id integer NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, publicacion_id)
);

-- Comentarios en publicaciones
CREATE TABLE IF NOT EXISTS comentarios (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publicacion_id integer NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Anuncios
CREATE TABLE IF NOT EXISTS anuncios (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  busco text[] NOT NULL DEFAULT '{}', -- parejas/chicas/chicos/amistad
  island island_enum NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days',
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS ix_publicaciones_user_id ON publicaciones(user_id);
CREATE INDEX IF NOT EXISTS ix_publicaciones_created_at ON publicaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS ix_anuncios_island ON anuncios(island);
CREATE INDEX IF NOT EXISTS ix_anuncios_expires_at ON anuncios(expires_at);

COMMIT;

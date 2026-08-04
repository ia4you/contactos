BEGIN;

-- Likes en fotos (diferente a likes en perfiles que ya existe)
CREATE TABLE IF NOT EXISTS foto_likes (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_id integer NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, photo_id)
);

-- Matches (se generan automáticamente cuando hay like mutuo)
CREATE TABLE IF NOT EXISTS matches (
  user1_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user1_id, user2_id),
  CHECK (user1_id < user2_id) -- garantiza unicidad sin duplicados
);

-- Solicitudes de amistad
CREATE TABLE IF NOT EXISTS amistades (
  from_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  PRIMARY KEY (from_id, to_id)
);

-- Conversaciones de mensajes
CREATE TABLE IF NOT EXISTS conversaciones (
  id serial PRIMARY KEY,
  user1_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  UNIQUE (user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id serial PRIMARY KEY,
  conversacion_id integer NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE,
  sender_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  texto text NOT NULL,
  leido boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('like_perfil','like_foto','match','mensaje','visita','amistad_recibida','amistad_aceptada')),
  from_user_id integer REFERENCES users(id) ON DELETE CASCADE,
  entity_id integer, -- foto_id, mensaje_id, etc según tipo
  leida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_foto_likes_photo_id ON foto_likes(photo_id);
CREATE INDEX IF NOT EXISTS ix_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS ix_notificaciones_user ON notificaciones(user_id, leida, created_at DESC);

COMMIT;

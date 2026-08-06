BEGIN;

-- Historias (caducan en 24h)
CREATE TABLE IF NOT EXISTS historias (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('foto','texto')),
  contenido text,
  photo_id integer REFERENCES photos(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Vistas de historias
CREATE TABLE IF NOT EXISTS historia_vistas (
  historia_id integer NOT NULL REFERENCES historias(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (historia_id, user_id)
);

-- Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text,
  isla island_enum NOT NULL,
  lugar text,
  fecha_evento timestamptz NOT NULL,
  aforo integer,
  tipo text NOT NULL DEFAULT 'quedada' CHECK (tipo IN ('quedada','fiesta','club','otro')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Asistencia a eventos
CREATE TABLE IF NOT EXISTS evento_asistentes (
  evento_id integer NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'apuntado' CHECK (status IN ('apuntado','interesado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (evento_id, user_id)
);

-- Grupos por isla
CREATE TABLE IF NOT EXISTS grupos (
  id serial PRIMARY KEY,
  nombre text NOT NULL,
  descripcion text,
  isla island_enum,
  creador_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grupo_miembros (
  grupo_id integer NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rol text NOT NULL DEFAULT 'miembro' CHECK (rol IN ('admin','miembro')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (grupo_id, user_id)
);

CREATE TABLE IF NOT EXISTS grupo_mensajes (
  id serial PRIMARY KEY,
  grupo_id integer NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Último online (actualizar en cada request autenticado)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active timestamptz;

-- Índices
CREATE INDEX IF NOT EXISTS ix_historias_expires ON historias(expires_at);
CREATE INDEX IF NOT EXISTS ix_eventos_isla ON eventos(isla);
CREATE INDEX IF NOT EXISTS ix_eventos_fecha ON eventos(fecha_evento);

-- Grupos por isla predefinidos (uno por cada isla)
INSERT INTO grupos (nombre, descripcion, isla, creador_id)
SELECT 'Gran Canaria Liberal', 'Comunidad liberal de Gran Canaria', 'gran_canaria', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO grupos (nombre, descripcion, isla, creador_id)
SELECT 'Tenerife Liberal', 'Comunidad liberal de Tenerife', 'tenerife', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO grupos (nombre, descripcion, isla, creador_id)
SELECT 'Lanzarote Liberal', 'Comunidad liberal de Lanzarote', 'lanzarote', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO grupos (nombre, descripcion, isla, creador_id)
SELECT 'Fuerteventura Liberal', 'Comunidad liberal de Fuerteventura', 'fuerteventura', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO grupos (nombre, descripcion, isla, creador_id)
SELECT 'La Palma Liberal', 'Comunidad liberal de La Palma', 'la_palma', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO grupos (nombre, descripcion, isla, creador_id)
SELECT 'La Gomera Liberal', 'Comunidad liberal de La Gomera', 'la_gomera', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO grupos (nombre, descripcion, isla, creador_id)
SELECT 'El Hierro Liberal', 'Comunidad liberal de El Hierro', 'el_hierro', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO grupos (nombre, descripcion, isla, creador_id)
SELECT 'La Graciosa Liberal', 'Comunidad liberal de La Graciosa', 'la_graciosa', id FROM users WHERE role='admin' LIMIT 1;

COMMIT;

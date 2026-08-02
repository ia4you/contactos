-- contactos.turel.es — esquema inicial (Sprint 1)
-- Ejecutar con:
--   docker exec -i contactos-db psql -U contactos -d contactos < scripts/schema.sql

BEGIN;

-- ── Tipos enumerados ────────────────────────────────────────────────────────

CREATE TYPE profile_type_enum AS ENUM ('pareja', 'chica', 'chico');

CREATE TYPE island_enum AS ENUM (
  'gran_canaria',
  'tenerife',
  'lanzarote',
  'fuerteventura',
  'la_palma',
  'la_gomera',
  'el_hierro',
  'la_graciosa'
);

CREATE TYPE user_role_enum AS ENUM ('user', 'admin');

CREATE TYPE photo_status_enum AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE access_status_enum AS ENUM ('requested', 'granted', 'denied');

CREATE TYPE report_status_enum AS ENUM ('open', 'resolved');

CREATE TYPE email_token_purpose_enum AS ENUM ('verify_email', 'reset_password');

-- ── users ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id                serial PRIMARY KEY,
  email             text NOT NULL UNIQUE,
  password_hash     text NOT NULL,
  nick              text NOT NULL,
  profile_type      profile_type_enum NOT NULL,
  island            island_enum NOT NULL,
  bio               text,
  -- Perfil 'pareja': her_birthdate = fecha de nacimiento de ella, his_birthdate
  -- = fecha de nacimiento de él. Perfil individual ('chica' o 'chico'): se usa
  -- her_birthdate como único campo de fecha de nacimiento (his_birthdate queda
  -- NULL); el nombre de columna no implica género, es una reutilización del
  -- mismo campo para simplificar el esquema.
  her_birthdate     date,
  his_birthdate     date,
  looking_for       text[] NOT NULL DEFAULT '{}',
  verified          boolean NOT NULL DEFAULT false,
  role              user_role_enum NOT NULL DEFAULT 'user',
  email_verified_at timestamptz,
  gdpr_consent_at   timestamptz NOT NULL,
  last_seen         timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

-- Unicidad de nick insensible a mayúsculas/minúsculas.
CREATE UNIQUE INDEX ux_users_nick_lower ON users (lower(nick));

CREATE INDEX ix_users_island ON users (island);
CREATE INDEX ix_users_profile_type ON users (profile_type);

-- ── photos ──────────────────────────────────────────────────────────────────

CREATE TABLE photos (
  id         serial PRIMARY KEY,
  user_id    integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  filename   text NOT NULL,
  is_private boolean NOT NULL DEFAULT false,
  is_avatar  boolean NOT NULL DEFAULT false,
  status     photo_status_enum NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_photos_user_id ON photos (user_id);

-- ── photo_access ────────────────────────────────────────────────────────────

CREATE TABLE photo_access (
  owner_id    integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  viewer_id   integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status      access_status_enum NOT NULL DEFAULT 'requested',
  created_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  PRIMARY KEY (owner_id, viewer_id)
);

-- ── likes ───────────────────────────────────────────────────────────────────

CREATE TABLE likes (
  from_id    integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_id      integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (from_id, to_id)
);

CREATE INDEX ix_likes_to_id ON likes (to_id);

-- ── visits ──────────────────────────────────────────────────────────────────

CREATE TABLE visits (
  visitor_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  visited_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  visited_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (visitor_id, visited_id)
);

CREATE INDEX ix_visits_visited_id ON visits (visited_id);

-- ── reports ─────────────────────────────────────────────────────────────────

CREATE TABLE reports (
  id          serial PRIMARY KEY,
  reporter_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reported_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reason      text,
  status      report_status_enum NOT NULL DEFAULT 'open',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── verification_requests ───────────────────────────────────────────────────

CREATE TABLE verification_requests (
  id          serial PRIMARY KEY,
  user_id     integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  filename    text NOT NULL,
  status      photo_status_enum NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- ── email_tokens ────────────────────────────────────────────────────────────

CREATE TABLE email_tokens (
  token      text PRIMARY KEY,
  user_id    integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  purpose    email_token_purpose_enum NOT NULL,
  expires_at timestamptz NOT NULL
);

COMMIT;

-- contactos.turel.es — Sprint 2C: columnas para /ajustes + tabla blocks.
-- Ejecutar con:
--   docker exec -i contactos-db psql -U contactos -d contactos < scripts/add-ajustes.sql

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS estado_relacion text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sitios_web text[] NOT NULL DEFAULT '{}';

ALTER TABLE users ADD COLUMN IF NOT EXISTS show_in_search boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_last_seen boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS only_verified boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

COMMIT;

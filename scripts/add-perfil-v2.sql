-- contactos.turel.es — Sprint 2A v2: genero/orientacion/rol + lista de
-- fetiches ampliada (28 en vez de 24).
-- Ejecutar con:
--   docker exec -i contactos-db psql -U contactos -d contactos < scripts/add-perfil-v2.sql

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS genero text[] NOT NULL DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS orientacion text[] NOT NULL DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS rol text[] NOT NULL DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS her_bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS his_bio text;

CREATE TABLE IF NOT EXISTS fetiches (
  id serial PRIMARY KEY,
  nombre text NOT NULL,
  categoria text NOT NULL
);

CREATE TABLE IF NOT EXISTS user_fetiches (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fetiche_id integer NOT NULL REFERENCES fetiches(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, fetiche_id)
);

-- La tabla ya existía del Sprint 2A con 24 fetiches; se vacía antes de
-- insertar la lista ampliada de 28 para no duplicar filas (user_fetiches
-- cae en cascada, pero ya estaba vacía tras el TRUNCATE de users).
TRUNCATE fetiches RESTART IDENTITY CASCADE;

INSERT INTO fetiches (nombre, categoria) VALUES
('Intercambio de parejas', 'Ambiente'),
('Soft swinging', 'Ambiente'),
('Full swap', 'Ambiente'),
('Voyeurismo', 'Ambiente'),
('Exhibicionismo', 'Ambiente'),
('Tríos', 'Ambiente'),
('Grupos', 'Ambiente'),
('Fiestas liberales', 'Ambiente'),
('BDSM', 'Prácticas'),
('Bondage', 'Prácticas'),
('Dominación', 'Prácticas'),
('Sumisión', 'Prácticas'),
('Role play', 'Prácticas'),
('Tantra', 'Prácticas'),
('Masajes sensuales', 'Prácticas'),
('Juguetes', 'Prácticas'),
('Látex y cuero', 'Prácticas'),
('Impacto', 'Prácticas'),
('Solo parejas', 'Preferencias'),
('Bisexual', 'Preferencias'),
('Hotwife', 'Preferencias'),
('Cuckold', 'Preferencias'),
('Amistad liberal', 'Preferencias'),
('Conversación discreta', 'Preferencias'),
('Conocer en eventos', 'Preferencias'),
('Relación abierta', 'Preferencias'),
('Fotografía erótica', 'Preferencias'),
('Naturismo', 'Preferencias');

COMMIT;

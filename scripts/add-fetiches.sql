-- contactos.turel.es — Sprint 2A: fetiches/gustos + her_bio/his_bio
-- Ejecutar con:
--   docker exec -i contactos-db psql -U contactos -d contactos < scripts/add-fetiches.sql

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS her_bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS his_bio text;

CREATE TABLE fetiches (
  id serial PRIMARY KEY,
  nombre text NOT NULL,
  categoria text NOT NULL
);

CREATE TABLE user_fetiches (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fetiche_id integer NOT NULL REFERENCES fetiches(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, fetiche_id)
);

-- Categorías y fetiches base
INSERT INTO fetiches (nombre, categoria) VALUES
-- Ambiente
('Intercambio de parejas', 'Ambiente'),
('Soft swinging', 'Ambiente'),
('Full swap', 'Ambiente'),
('Voyeurismo', 'Ambiente'),
('Exhibicionismo', 'Ambiente'),
('Tríos', 'Ambiente'),
('Grupos', 'Ambiente'),
('Fiestas liberales', 'Ambiente'),

-- Prácticas
('BDSM', 'Prácticas'),
('Bondage', 'Prácticas'),
('Dominación', 'Prácticas'),
('Sumisión', 'Prácticas'),
('Role play', 'Prácticas'),
('Tantra', 'Prácticas'),
('Masajes sensuales', 'Prácticas'),
('Juguetes', 'Prácticas'),

-- Preferencias
('Solo parejas', 'Preferencias'),
('Bisexual', 'Preferencias'),
('Hotwife', 'Preferencias'),
('Cuckold', 'Preferencias'),
('Amistad liberal', 'Preferencias'),
('Conversación discreta', 'Preferencias'),
('Conocer en eventos', 'Preferencias'),
('Relación abierta', 'Preferencias');

COMMIT;

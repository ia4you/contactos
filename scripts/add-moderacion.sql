-- contactos.turel.es — moderación de contenido (filtro local + IA Groq async)
-- Ejecutar con:
--   docker exec -i contactos-db psql -U contactos -d contactos < scripts/add-moderacion.sql

ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS revision_pendiente boolean NOT NULL DEFAULT false;
ALTER TABLE comentarios ADD COLUMN IF NOT EXISTS revision_pendiente boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS revision_pendiente boolean NOT NULL DEFAULT false;

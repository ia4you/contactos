-- contactos.turel.es — pie de foto (caption) para photos.
-- Ejecutar con:
--   docker exec -i contactos-db psql -U contactos -d contactos < scripts/add-photo-caption.sql

ALTER TABLE photos ADD COLUMN IF NOT EXISTS caption text;

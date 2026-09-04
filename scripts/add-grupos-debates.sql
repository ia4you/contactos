BEGIN;

-- "Acerca de y normas": la tabla grupos ya tiene `descripcion` (Acerca de).
-- Añadimos `normas` para el mismo apartado.
ALTER TABLE grupos ADD COLUMN IF NOT EXISTS normas text;

-- Los "Debates" de grupo reutilizan la tabla `publicaciones` ya existente
-- (que ya tiene publicacion_likes y comentarios asociados vía FK a publicaciones.id).
-- Añadimos grupo_id (nullable: NULL = publicación normal del feed, con valor = debate de grupo)
-- y titulo (nullable: los posts del feed general no tienen título, los debates sí).
ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS grupo_id integer REFERENCES grupos(id) ON DELETE CASCADE;
ALTER TABLE publicaciones ADD COLUMN IF NOT EXISTS titulo text;

CREATE INDEX IF NOT EXISTS ix_publicaciones_grupo_id ON publicaciones(grupo_id);

COMMIT;

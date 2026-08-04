BEGIN;

ALTER TABLE notificaciones DROP CONSTRAINT notificaciones_tipo_check;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_tipo_check
  CHECK (tipo IN ('like_perfil','like_foto','match','mensaje','visita','amistad_recibida','amistad_aceptada','like_publicacion','comentario'));

COMMIT;

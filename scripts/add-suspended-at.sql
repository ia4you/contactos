-- contactos.turel.es — separar suspensión de borrado, invalidar sesiones,
-- conservar denuncias de cuentas borradas y registrar acciones de admin.
-- Ejecutar con:
--   docker exec -i contactos-db psql -U contactos -d contactos -v ON_ERROR_STOP=1 < scripts/add-suspended-at.sql
--
-- Solo cambia el esquema. Pasar las suspensiones antiguas (hoy guardadas en
-- deleted_at) a suspended_at es un paso aparte y revisable:
-- scripts/migrar-suspensiones.sql.

BEGIN;

-- Suspensión (admin), distinta de la auto-eliminación (deleted_at), que es
-- la única que purga scripts/purge-deleted.js a los 30 días.
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason text;

-- Se incrementa al suspender, eliminar y cambiar/restablecer la contraseña;
-- el JWT guarda la versión con la que se emitió y deja de valer si no coincide.
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0;

-- Denuncias: sobreviven al borrado definitivo de cualquiera de las dos
-- cuentas (FK a NULL) y guardan en texto quién era la cuenta denunciada.
ALTER TABLE reports ALTER COLUMN reporter_id DROP NOT NULL;
ALTER TABLE reports ALTER COLUMN reported_id DROP NOT NULL;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reported_id_fkey;
ALTER TABLE reports ADD CONSTRAINT reports_reporter_id_fkey
  FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE SET NULL;
ALTER TABLE reports ADD CONSTRAINT reports_reported_id_fkey
  FOREIGN KEY (reported_id) REFERENCES users (id) ON DELETE SET NULL;
-- p. ej. «Ana_GC · cuenta eliminada el 18/10/2026»
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reported_constancia text;

-- groq_usage tenía la FK sin ON DELETE, lo que impedía borrar a cualquiera
-- que hubiera usado la IA. Se conserva el consumo, sin el usuario.
ALTER TABLE groq_usage DROP CONSTRAINT IF EXISTS groq_usage_user_id_fkey;
ALTER TABLE groq_usage ADD CONSTRAINT groq_usage_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL;

-- Registro simple de acciones de administración.
CREATE TABLE IF NOT EXISTS admin_log (
  id            serial PRIMARY KEY,
  admin_id      integer REFERENCES users (id) ON DELETE SET NULL,
  accion        text NOT NULL,
  nick_afectado text NOT NULL,
  detalle       text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_admin_log_created_at ON admin_log (created_at DESC);

COMMIT;

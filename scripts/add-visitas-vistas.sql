BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS visitas_vistas_at timestamptz;
COMMIT;

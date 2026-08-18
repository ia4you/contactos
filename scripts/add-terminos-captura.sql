-- contactos.turel.es — consentimiento sobre capturas/reproducción de contenido ajeno, en el registro.
-- Ejecutar con:
--   docker exec -i contactos-db psql -U contactos -d contactos < scripts/add-terminos-captura.sql
--
-- Nullable a propósito (a diferencia de gdpr_consent_at, que es NOT NULL
-- desde el schema inicial): los usuarios ya registrados no han aceptado
-- este texto nuevo, así que no tiene sentido forzarles un valor por defecto.
-- Los registros nuevos siempre lo rellenan con now() en el POST de registro.
ALTER TABLE users ADD COLUMN IF NOT EXISTS acepto_terminos_captura timestamptz;

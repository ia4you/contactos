-- contactos.turel.es — pasar las suspensiones antiguas de deleted_at a
-- suspended_at. Requiere scripts/add-suspended-at.sql.
--
-- Hasta ahora suspender (admin) y auto-eliminarse hacían lo mismo
-- (deleted_at = now()) y no queda constancia de cuál fue cuál. Se distinguen
-- con una heurística, por eso este paso va aparte y se revisa antes:
--
--   * Auto-eliminación: el usuario borra su cuenta desde una petición con
--     sesión, y esa misma petición actualiza last_active (callback session de
--     lib/auth.js). last_active y deleted_at quedan a segundos de distancia.
--   * Suspensión: la pone un admin en cualquier momento; last_active del
--     suspendido queda lejos de deleted_at (antes, o después si siguió usando
--     la web con su sesión abierta, que es el fallo S1).
--
-- Regla: se trata como AUTO-ELIMINACIÓN solo si |last_active - deleted_at| <=
-- 2 minutos Y no tiene denuncias en contra. Todo lo demás (incluido
-- last_active NULL) se trata como SUSPENSIÓN, que es lo conservador: una
-- suspensión no se purga y un admin puede borrarla a mano después.
--
-- 1) Revisar primero (solo lectura):
--   docker exec -i contactos-db psql -U contactos -d contactos -c "
--     SELECT u.id, u.nick, u.deleted_at, u.last_active,
--            round(extract(epoch FROM (u.last_active - u.deleted_at)))::int AS segundos,
--            (SELECT count(*) FROM reports r WHERE r.reported_id = u.id) AS denuncias,
--            CASE WHEN u.last_active IS NOT NULL
--                  AND abs(extract(epoch FROM (u.last_active - u.deleted_at))) <= 120
--                  AND NOT EXISTS (SELECT 1 FROM reports r WHERE r.reported_id = u.id)
--                 THEN 'auto-eliminación' ELSE 'suspensión' END AS clasificacion
--       FROM users u WHERE u.deleted_at IS NOT NULL ORDER BY u.deleted_at"
--
-- 2) Si la clasificación es correcta, ejecutar este archivo:
--   docker exec -i contactos-db psql -U contactos -d contactos -v ON_ERROR_STOP=1 < scripts/migrar-suspensiones.sql
--    Si alguna fila está mal clasificada, corregirla a mano en vez de usar
--    este archivo (UPDATE users SET suspended_at = deleted_at, deleted_at = NULL WHERE id IN (...)).

BEGIN;

UPDATE users u
   SET suspended_at = u.deleted_at,
       suspended_reason = 'Suspensión anterior a la separación suspensión/borrado',
       deleted_at = NULL,
       session_version = u.session_version + 1
 WHERE u.deleted_at IS NOT NULL
   AND u.suspended_at IS NULL
   AND NOT (
         u.last_active IS NOT NULL
     AND abs(extract(epoch FROM (u.last_active - u.deleted_at))) <= 120
     AND NOT EXISTS (SELECT 1 FROM reports r WHERE r.reported_id = u.id)
   );

COMMIT;

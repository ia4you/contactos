import { query } from "./db";

export async function crearNotificacion(userId, tipo, fromUserId, entityId = null) {
  await query(
    `INSERT INTO notificaciones (user_id, tipo, from_user_id, entity_id) VALUES ($1, $2, $3, $4)`,
    [userId, tipo, fromUserId, entityId]
  );
}

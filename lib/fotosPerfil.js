// Reglas de la foto de perfil. `db` es cualquier objeto con .query (Pool o
// Client de pg). Invariante: un usuario nunca se queda sin avatar por sus
// propias acciones (ni borrando el avatar ni su última foto).

// Marca `photoId` como avatar en UNA sola sentencia (nunca hay estado
// intermedio sin avatar). Solo si la foto es del usuario y está approved.
export async function fijarAvatar(db, userId, photoId) {
  const id = Number(photoId);
  if (!Number.isInteger(id)) return false;
  const { rowCount } = await db.query(
    `UPDATE photos SET is_avatar = (id = $1)
      WHERE user_id = $2
        AND EXISTS (SELECT 1 FROM photos WHERE id = $1 AND user_id = $2 AND status = 'approved')`,
    [id, userId]
  );
  return rowCount > 0;
}

// Devuelve { filename } si se borró, o { error, status } si no se permite.
export async function borrarFoto(db, userId, photoId) {
  const id = Number(photoId);
  if (!Number.isInteger(id)) return { error: "Falta el id de la foto.", status: 400 };

  const { rows } = await db.query(
    `SELECT is_avatar FROM photos WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!rows[0]) return { error: "Foto no encontrada.", status: 404 };
  if (rows[0].is_avatar) {
    return {
      error: "Tu foto de perfil no se puede borrar, súbela de nuevo para sustituirla.",
      status: 409,
    };
  }

  // La guarda "no es la última foto" va dentro del propio DELETE para que
  // dos borrados simultáneos no puedan dejar al usuario sin fotos.
  const { rows: borradas } = await db.query(
    `DELETE FROM photos
      WHERE id = $1 AND user_id = $2 AND is_avatar = false
        AND (SELECT count(*) FROM photos WHERE user_id = $2) > 1
      RETURNING filename`,
    [id, userId]
  );
  if (!borradas[0]) {
    return { error: "No puedes borrar tu última foto.", status: 409 };
  }
  return { filename: borradas[0].filename };
}

export async function tieneAvatar(db, userId) {
  const { rows } = await db.query(
    `SELECT EXISTS (SELECT 1 FROM photos WHERE user_id = $1 AND is_avatar AND status = 'approved') AS ok`,
    [userId]
  );
  return rows[0].ok;
}

// El avatar obligatorio se exige solo a cuentas creadas desde esta fecha (día
// en que se hizo obligatoria la foto en el alta, commit e13cd55). Las
// anteriores se dieron de alta sin ese requisito, así que se consideran
// "cumplidas" y no se les bloquea el acceso aunque no tengan avatar.
export const FECHA_CORTE_AVATAR = new Date("2026-09-25T00:00:00Z");

// Valor del claim `tieneAvatar` del JWT (lo lee el gate de middleware.js).
export async function cumpleRequisitoAvatar(db, userId) {
  const { rows } = await db.query(
    `SELECT created_at,
            EXISTS (SELECT 1 FROM photos WHERE user_id = $1 AND is_avatar AND status = 'approved') AS avatar
       FROM users WHERE id = $1`,
    [userId]
  );
  const u = rows[0];
  return Boolean(u) && (new Date(u.created_at) < FECHA_CORTE_AVATAR || u.avatar);
}

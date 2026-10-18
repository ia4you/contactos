import { borrarCuenta } from "./borrarCuenta";

// Acciones de /admin → Usuarios. Cada una devuelve { ok: true } o
// { error, status } para que la ruta lo convierta en respuesta. `db` es el
// pool de lib/db.js (o el de los tests).

async function cargarObjetivo(db, adminId, userId) {
  if (!Number.isInteger(userId)) return { error: "Id inválido.", status: 400 };
  if (String(userId) === String(adminId)) return { error: "No puedes aplicarte esta acción a ti mismo.", status: 400 };
  const { rows } = await db.query(
    `SELECT id, nick, role, deleted_at, suspended_at FROM users WHERE id = $1`,
    [userId]
  );
  const u = rows[0];
  if (!u) return { error: "Usuario no encontrado.", status: 404 };
  if (u.role === "admin") return { error: "No se puede aplicar a un administrador.", status: 400 };
  return { usuario: u };
}

function registrar(db, adminId, accion, nick, detalle = null) {
  return db.query(`INSERT INTO admin_log (admin_id, accion, nick_afectado, detalle) VALUES ($1, $2, $3, $4)`, [
    adminId,
    accion,
    nick,
    detalle,
  ]);
}

// Suspender: deja de verse en toda la web, no puede iniciar sesión y sus
// sesiones abiertas caducan (session_version + 1). No toca deleted_at, así
// que la purga de 30 días nunca la borra.
export async function suspenderCuenta(db, { adminId, userId, motivo }) {
  const r = await cargarObjetivo(db, adminId, userId);
  if (r.error) return r;
  if (r.usuario.suspended_at) return { error: "La cuenta ya está suspendida.", status: 409 };
  if (r.usuario.deleted_at) return { error: "La cuenta ya está pendiente de borrado.", status: 409 };
  const texto = typeof motivo === "string" && motivo.trim() ? motivo.trim().slice(0, 500) : null;
  await db.query(
    `UPDATE users SET suspended_at = now(), suspended_reason = $2, session_version = session_version + 1 WHERE id = $1`,
    [userId, texto]
  );
  await registrar(db, adminId, "suspender", r.usuario.nick, texto);
  return { ok: true };
}

// Reactivar: vuelve a ser visible y puede iniciar sesión de nuevo. Las
// sesiones de antes de la suspensión siguen invalidadas (otra versión).
export async function reactivarCuenta(db, { adminId, userId }) {
  const r = await cargarObjetivo(db, adminId, userId);
  if (r.error) return r;
  if (!r.usuario.suspended_at) return { error: "La cuenta no está suspendida.", status: 409 };
  await db.query(`UPDATE users SET suspended_at = NULL, suspended_reason = NULL WHERE id = $1`, [userId]);
  await registrar(db, adminId, "reactivar", r.usuario.nick);
  return { ok: true };
}

// Borrado definitivo desde el panel: solo cuentas suspendidas o pendientes de
// borrado (auto-eliminadas), y solo si se confirma escribiendo el nick.
export async function eliminarCuentaDefinitivamente(db, { adminId, userId, confirmacionNick }) {
  const r = await cargarObjetivo(db, adminId, userId);
  if (r.error) return r;
  if (!r.usuario.suspended_at && !r.usuario.deleted_at) {
    return { error: "Solo se pueden eliminar cuentas suspendidas o pendientes de borrado.", status: 409 };
  }
  if (confirmacionNick !== r.usuario.nick) {
    return { error: "El nick de confirmación no coincide.", status: 400 };
  }
  await borrarCuenta(db, userId, { adminId, accion: "eliminar definitivamente" });
  return { ok: true };
}

// CommonJS a propósito: además de Next (que lo importa sin problema), lo
// carga scripts/purge-deleted.js con el Node 18 del contenedor, que no
// acepta sintaxis ESM en un .js. Por eso las rutas de subida se calculan
// aquí en vez de importar lib/uploads.js (ESM); son las mismas.
const fs = require("node:fs/promises");
const path = require("node:path");

const directorioSubidasUsuario = (id) => path.join(process.cwd(), "public", "uploads", String(id));
const directorioSubidasEventos = () => path.join(process.cwd(), "public", "uploads", "eventos");

const DIAS_PURGA = 30;

// Borra definitivamente una cuenta. `pool` es un pg.Pool (lib/db.js o el del
// script). En una transacción:
//  - las denuncias contra la cuenta guardan su nick y la fecha en
//    reports.reported_constancia (las FK de reports pasan a NULL);
//  - DELETE de users: el resto (fotos, publicaciones, historias,
//    comentarios, likes, mensajes, visitas, amistades, bloqueos, anuncios,
//    eventos, asistencias, grupos creados…) cae por ON DELETE CASCADE;
//  - una línea en admin_log.
// Después, ya confirmada la transacción, los archivos: public/uploads/<id>/ y
// las fotos de sus eventos. Si el disco fallara quedarían archivos sueltos
// (inofensivos), nunca filas apuntando a fotos ya borradas.
// Devuelve { nick } o null si la cuenta no existe.
async function borrarCuenta(pool, userId, { adminId = null, accion = "purga automática" } = {}) {
  const cliente = await pool.connect();
  let nick;
  let fotosEventos;
  try {
    await cliente.query("BEGIN");
    const { rows } = await cliente.query(`SELECT nick FROM users WHERE id = $1 FOR UPDATE`, [userId]);
    if (!rows[0]) {
      await cliente.query("ROLLBACK");
      return null;
    }
    nick = rows[0].nick;

    const { rows: eventos } = await cliente.query(
      `SELECT foto FROM eventos WHERE user_id = $1 AND foto IS NOT NULL`,
      [userId]
    );
    fotosEventos = eventos.map((e) => e.foto);

    const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "Atlantic/Canary" });
    await cliente.query(`UPDATE reports SET reported_constancia = $2 WHERE reported_id = $1`, [
      userId,
      `${nick} · cuenta eliminada el ${fecha}`,
    ]);
    await cliente.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await cliente.query(`INSERT INTO admin_log (admin_id, accion, nick_afectado) VALUES ($1, $2, $3)`, [
      adminId,
      accion,
      nick,
    ]);
    await cliente.query("COMMIT");
  } catch (err) {
    await cliente.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    cliente.release();
  }

  await fs.rm(directorioSubidasUsuario(userId), { recursive: true, force: true });
  await Promise.all(
    fotosEventos.map((f) => fs.rm(path.join(directorioSubidasEventos(), path.basename(f)), { force: true }))
  );
  return { nick };
}

// Purga las auto-eliminaciones (deleted_at) de hace más de DIAS_PURGA días.
// Nunca toca suspensiones: una cuenta suspendida tiene deleted_at NULL.
async function purgarAutoEliminadas(pool, { log = console.log } = {}) {
  const { rows } = await pool.query(
    `SELECT id FROM users
      WHERE deleted_at IS NOT NULL
        AND suspended_at IS NULL
        AND deleted_at < now() - make_interval(days => $1)`,
    [DIAS_PURGA]
  );
  let borradas = 0;
  for (const { id } of rows) {
    try {
      if (await borrarCuenta(pool, id)) borradas += 1;
    } catch (err) {
      // Una cuenta que falle no detiene al resto; se reintentará mañana.
      log(`[purga] Error al borrar la cuenta ${id}: ${err.message}`);
    }
  }
  if (borradas > 0) log(`[purga] ${borradas} cuenta(s) auto-eliminada(s) hace más de ${DIAS_PURGA} días borradas.`);
  return borradas;
}

module.exports = { DIAS_PURGA, borrarCuenta, purgarAutoEliminadas };

// Borra definitivamente las cuentas auto-eliminadas (deleted_at) hace más de
// 30 días, con la misma lógica que el panel de admin y la purga diaria de
// instrumentation.js (lib/borrarCuenta.js). Nunca toca cuentas suspendidas.
//
// La purga ya se ejecuta sola una vez al día; este script queda para
// lanzarla a mano dentro del contenedor de producción:
//   docker exec <contenedor> node scripts/purge-deleted.js
const { Pool } = require("pg");
const { purgarAutoEliminadas } = require("../lib/borrarCuenta.js");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const n = await purgarAutoEliminadas(pool);
    if (n === 0) console.log("No hay cuentas pendientes de purga.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Error en la purga de cuentas eliminadas:", err);
  process.exit(1);
});

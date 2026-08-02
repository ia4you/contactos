// Borra definitivamente las cuentas marcadas con deleted_at hace más de 30
// días: fotos en disco + filas en BD (las tablas relacionadas se eliminan
// en cascada por las FK ON DELETE CASCADE definidas en scripts/schema.sql).
//
// Pensado para ejecutarse dentro del contenedor de producción (donde
// process.env.DATABASE_URL ya está definido por dokploy), vía:
//   docker exec <contenedor> node scripts/purge-deleted.js
const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const { rows: usuarios } = await pool.query(
    `SELECT id FROM users WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '30 days'`
  );

  if (usuarios.length === 0) {
    console.log("No hay cuentas pendientes de purga.");
    await pool.end();
    return;
  }

  for (const usuario of usuarios) {
    const dirSubidas = path.join(process.cwd(), "public", "uploads", String(usuario.id));
    await fs.rm(dirSubidas, { recursive: true, force: true });

    await pool.query(`DELETE FROM users WHERE id = $1`, [usuario.id]);
    console.log(`Purgado usuario ${usuario.id} (archivos y filas en cascada eliminados).`);
  }

  console.log(`Purga completada: ${usuarios.length} cuenta(s) eliminada(s) definitivamente.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Error en la purga de cuentas eliminadas:", err);
  process.exit(1);
});

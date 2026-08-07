// Soft-delete de eventos caducados (fecha_evento en el pasado): marca
// deleted_at = now() en vez de borrar la fila, igual que el resto de
// entidades del sitio (users, publicaciones, anuncios...).
//
// Pensado para ejecutarse dentro del contenedor de producción (donde
// process.env.DATABASE_URL ya está definido por dokploy), vía:
//   docker exec <contenedor> node scripts/cleanup-eventos.js
// También se ejecuta automáticamente al arrancar el servidor — ver
// lib/startup.js + instrumentation.js — así que esta ejecución manual solo
// hace falta para forzar la limpieza sin esperar a un reinicio/deploy.
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const { rowCount } = await pool.query(
    `UPDATE eventos SET deleted_at = now() WHERE fecha_evento < now() AND deleted_at IS NULL`
  );
  console.log(`Limpieza de eventos caducados: ${rowCount} evento(s) marcados como eliminados.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Error al limpiar eventos caducados:", err);
  process.exit(1);
});

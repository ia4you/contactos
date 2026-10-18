// Se ejecuta una vez al arrancar el servidor (requiere
// experimental.instrumentationHook en next.config.js). Next.js invoca
// register() tanto para el runtime nodejs como para el edge (el que usa
// middleware.js) — la limpieza usa `pg`, que no existe en edge, así que se
// restringe explícitamente al runtime nodejs.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { limpiarEventosCaducados } = await import("@/lib/startup");
    await limpiarEventosCaducados();

    // Borrado definitivo diario de cuentas auto-eliminadas hace más de 30
    // días (nunca suspendidas). Antes dependía de lanzar a mano
    // scripts/purge-deleted.js.
    const { programarPurgaDiaria } = await import("@/lib/purgaDiaria");
    programarPurgaDiaria();
  }
}

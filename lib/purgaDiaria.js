import { pool } from "./db";
import { purgarAutoEliminadas } from "./borrarCuenta";

const UN_DIA_MS = 24 * 60 * 60 * 1000;
let enCurso = false;

// Purga de auto-eliminaciones de más de 30 días (política de privacidad).
// La guardia evita que dos ejecuciones se solapen si una tarda más de lo
// previsto. ponytail: un setInterval por proceso; con varias réplicas cada
// una purgaría (es idempotente, solo duplica trabajo). Pasar a un cron único
// si algún día hay más de un contenedor.
export async function ejecutarPurga() {
  if (enCurso) return 0;
  enCurso = true;
  try {
    return await purgarAutoEliminadas(pool, { log: (m) => console.log(m) });
  } catch (err) {
    console.error("[purga] Error en la purga diaria:", err);
    return 0;
  } finally {
    enCurso = false;
  }
}

export function programarPurgaDiaria() {
  // Primera pasada un minuto después de arrancar (sin retrasar el arranque)
  // y luego una vez al día.
  setTimeout(ejecutarPurga, 60_000).unref?.();
  setInterval(ejecutarPurga, UN_DIA_MS).unref?.();
}

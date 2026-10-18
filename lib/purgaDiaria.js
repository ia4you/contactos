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

// Primera pasada una hora después de arrancar y luego una vez al día. La hora
// de margen es para el primer despliegue: hasta ejecutar
// scripts/migrar-suspensiones.sql, las suspensiones antiguas siguen en
// deleted_at y la purga las tomaría por auto-eliminaciones (ver
// RESUMEN_ADMIN.md). Con despliegues más frecuentes que cada hora la purga no
// llegaría a correr; no es el caso hoy.
const PRIMERA_PASADA_MS = 60 * 60 * 1000;

export function programarPurgaDiaria() {
  setTimeout(ejecutarPurga, PRIMERA_PASADA_MS).unref?.();
  setInterval(ejecutarPurga, UN_DIA_MS).unref?.();
}

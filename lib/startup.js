import { query } from "@/lib/db";

export async function limpiarEventosCaducados() {
  try {
    const { rowCount } = await query(
      `UPDATE eventos SET deleted_at = now() WHERE fecha_evento < now() AND deleted_at IS NULL`
    );
    if (rowCount > 0) {
      console.log(`[startup] Limpieza de eventos caducados: ${rowCount} evento(s) marcados como eliminados.`);
    }
  } catch (err) {
    console.error("[startup] Error al limpiar eventos caducados:", err);
  }
}

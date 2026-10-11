// Recomprime a WebP (máx. 1200px, calidad 80) las fotos de usuario que se
// subieron antes de que historias y publicaciones pasaran por sharp: siguen
// siendo el jpg/png original del móvil, con sus metadatos EXIF (incluida la
// posible ubicación GPS). Las subidas nuevas ya se convierten al subirlas,
// así que esto solo hace falta una vez.
//
// Por cada fila de `photos` que no es .webp: escribe el .webp con un nombre
// nuevo, actualiza photos.filename y mueve el original a
// public/uploads/_backup-recompresion/{userId}/ (fuera de lo que sirve
// app/uploads/[userId], que solo acepta ids numéricos). Borrar esa carpeta
// cuando se haya comprobado que todo se ve bien: los originales tienen EXIF.
//
// Sin argumentos solo lista lo que haría. Dentro del contenedor:
//   docker exec <contenedor> node scripts/recomprimir-fotos.js
//   docker exec <contenedor> node scripts/recomprimir-fotos.js --aplicar
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const sharp = require("sharp");

async function recomprimir(pool, dirUploads, aplicar) {
  const { rows } = await pool.query(
    `SELECT id, user_id, filename FROM photos WHERE filename NOT ILIKE '%.webp' ORDER BY id`
  );
  const resumen = { convertidas: 0, faltan: 0, errores: 0, antes: 0, despues: 0 };

  for (const foto of rows) {
    const origen = path.join(dirUploads, String(foto.user_id), foto.filename);
    const stat = await fs.stat(origen).catch(() => null);
    if (!stat) {
      console.log(`[falta] photo ${foto.id}: ${origen}`);
      resumen.faltan++;
      continue;
    }

    const nombreNuevo = `${crypto.randomUUID()}.webp`;
    const destino = path.join(dirUploads, String(foto.user_id), nombreNuevo);
    try {
      const datos = await sharp(origen)
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      resumen.antes += stat.size;
      resumen.despues += datos.length;
      console.log(`photo ${foto.id}: ${foto.filename} ${(stat.size / 1024).toFixed(0)}KB -> ${nombreNuevo} ${(datos.length / 1024).toFixed(0)}KB`);
      if (!aplicar) continue;

      await fs.writeFile(destino, datos);
      // Condicionado al nombre antiguo por si la fila cambió mientras tanto.
      const { rowCount } = await pool.query(`UPDATE photos SET filename = $1 WHERE id = $2 AND filename = $3`, [
        nombreNuevo,
        foto.id,
        foto.filename,
      ]);
      if (rowCount !== 1) {
        await fs.unlink(destino).catch(() => {});
        throw new Error("la fila cambió durante la recompresión, se deja como estaba");
      }
      const dirBackup = path.join(dirUploads, "_backup-recompresion", String(foto.user_id));
      await fs.mkdir(dirBackup, { recursive: true });
      await fs.rename(origen, path.join(dirBackup, foto.filename));
      resumen.convertidas++;
    } catch (err) {
      console.error(`[error] photo ${foto.id}: ${err.message}`);
      resumen.errores++;
    }
  }

  const mb = (b) => (b / 1024 / 1024).toFixed(1);
  console.log(
    `${aplicar ? "Hecho" : "Simulación (usa --aplicar para ejecutar)"}: ${rows.length} fotos, ` +
      `${mb(resumen.antes)}MB -> ${mb(resumen.despues)}MB, ${resumen.faltan} sin archivo, ${resumen.errores} errores.`
  );
  return resumen;
}

module.exports = { recomprimir };

if (require.main === module) {
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  recomprimir(pool, path.join(process.cwd(), "public", "uploads"), process.argv.includes("--aplicar"))
    .then(() => pool.end())
    .catch((err) => {
      console.error("Error en la recompresión:", err);
      process.exit(1);
    });
}

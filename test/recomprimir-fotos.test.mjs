import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { recomprimir } from "../scripts/recomprimir-fotos.js";

// Pool falso: una sola fila en memoria, suficiente para el SELECT y el UPDATE del script.
function poolFalso(fila) {
  return {
    async query(sql, params) {
      if (sql.startsWith("SELECT")) return { rows: fila.filename.endsWith(".webp") ? [] : [{ ...fila }] };
      if (params[2] !== fila.filename) return { rowCount: 0 };
      fila.filename = params[0];
      return { rowCount: 1 };
    },
  };
}

test("recomprime a webp 1200px sin EXIF, actualiza la fila y guarda el original aparte", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "recomprimir-"));
  await fs.mkdir(path.join(dir, "7"));
  await sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#a33" } })
    .jpeg()
    .withMetadata({ exif: { IFD0: { Make: "Movil" } } })
    .toFile(path.join(dir, "7", "orig.jpg"));
  const fila = { id: 1, user_id: 7, filename: "orig.jpg" };

  await recomprimir(poolFalso(fila), dir, false);
  assert.equal(fila.filename, "orig.jpg", "la simulación no debe tocar nada");

  const r = await recomprimir(poolFalso(fila), dir, true);
  assert.equal(r.convertidas, 1);
  assert.match(fila.filename, /\.webp$/);
  const meta = await sharp(path.join(dir, "7", fila.filename)).metadata();
  assert.equal(meta.width, 1200);
  assert.equal(meta.exif, undefined);
  await fs.access(path.join(dir, "_backup-recompresion", "7", "orig.jpg"));
  await assert.rejects(fs.access(path.join(dir, "7", "orig.jpg")));
  await fs.rm(dir, { recursive: true });
});

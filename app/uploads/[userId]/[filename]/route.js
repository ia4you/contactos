import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { directorioSubidasUsuario } from "@/lib/uploads";

const EXTENSION_A_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// Servido por un route handler en vez de public/uploads/: en producción,
// `next start` construye en el build una lista fija de los archivos
// estáticos de public/, así que cualquier foto escrita ahí en caliente
// (después de arrancar el servidor) nunca se llega a servir — devuelve 404
// aunque el archivo exista físicamente en disco. Un route handler hace una
// lectura real del filesystem en cada petición, sin ese problema.
export async function GET(req, { params }) {
  const { userId, filename } = params;

  if (!/^\d+$/.test(userId) || filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Ruta no válida." }, { status: 400 });
  }

  const extension = filename.split(".").pop().toLowerCase();
  const mime = EXTENSION_A_MIME[extension];
  if (!mime) {
    return NextResponse.json({ error: "Tipo de archivo no admitido." }, { status: 400 });
  }

  const ruta = path.join(directorioSubidasUsuario(userId), filename);

  let datos;
  try {
    datos = await fs.readFile(ruta);
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  return new NextResponse(datos, {
    headers: {
      "Content-Type": mime,
      // Los nombres de archivo son UUIDs generados una vez: el mismo
      // nombre nunca cambia de contenido, así que se cachea de forma
      // agresiva tanto en el navegador como en el optimizador de next/image.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

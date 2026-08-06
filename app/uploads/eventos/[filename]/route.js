import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { directorioSubidasEventos } from "@/lib/uploads";

const EXTENSION_A_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// Mismo motivo que /uploads/[userId]/[filename]: next start sirve public/
// desde una lista fija generada en el build, así que las fotos de eventos
// subidas en caliente devolverían 404 si se sirvieran como estáticas.
export async function GET(req, { params }) {
  const { filename } = params;

  if (filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Ruta no válida." }, { status: 400 });
  }

  const extension = filename.split(".").pop().toLowerCase();
  const mime = EXTENSION_A_MIME[extension];
  if (!mime) {
    return NextResponse.json({ error: "Tipo de archivo no admitido." }, { status: 400 });
  }

  const ruta = path.join(directorioSubidasEventos(), filename);

  let datos;
  try {
    datos = await fs.readFile(ruta);
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  return new NextResponse(datos, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

import path from "node:path";

// Coincide con la ruta pedida en el encargo: /app/public/uploads/{user_id}/
// — process.cwd() resuelve a /app dentro del contenedor de producción.
export function directorioSubidasUsuario(userId) {
  return path.join(process.cwd(), "public", "uploads", String(userId));
}

export function directorioSubidasEventos() {
  return path.join(process.cwd(), "public", "uploads", "eventos");
}

export const MIME_A_EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_TAMANO_FOTO = 5 * 1024 * 1024;

// Misma fórmula que calcularCompletitud(), en SQL, para poder filtrar
// dentro de una consulta (usada en /api/buscar y /api/recomendaciones).
// Requiere que la tabla de usuarios esté aliasada como "u" en la consulta.
export const COMPLETITUD_SQL = `(
  (CASE WHEN EXISTS (SELECT 1 FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved') THEN 25 ELSE 0 END) +
  (CASE WHEN COALESCE(length(u.bio), 0) > 20 OR COALESCE(length(u.her_bio), 0) > 20 OR COALESCE(length(u.his_bio), 0) > 20 THEN 20 ELSE 0 END) +
  (CASE WHEN (SELECT count(*) FROM user_fetiches WHERE user_id = u.id) >= 3 THEN 20 ELSE 0 END) +
  (CASE WHEN array_length(u.genero, 1) > 0 AND array_length(u.orientacion, 1) > 0 AND array_length(u.rol, 1) > 0 THEN 20 ELSE 0 END) +
  (CASE WHEN EXISTS (SELECT 1 FROM photos WHERE user_id = u.id AND is_avatar = false AND status = 'approved') THEN 15 ELSE 0 END)
)`;

export function calcularCompletitud(usuario, fotos, gustosCount) {
  let pct = 0;
  const pendientes = [];

  const avatarOk = fotos.some((f) => f.is_avatar && f.status === "approved");
  if (avatarOk) pct += 25;
  else pendientes.push("una foto de perfil");

  const bioLarga = [usuario.bio, usuario.her_bio, usuario.his_bio].some((b) => b && b.trim().length > 20);
  if (bioLarga) pct += 20;
  else pendientes.push("descripción");

  if (gustosCount >= 3) pct += 20;
  else pendientes.push("al menos 3 gustos");

  const identidadOk = usuario.genero?.length > 0 && usuario.orientacion?.length > 0 && usuario.rol?.length > 0;
  if (identidadOk) pct += 20;
  else pendientes.push("género, orientación y rol");

  const fotoExtra = fotos.some((f) => !f.is_avatar && f.status === "approved");
  if (fotoExtra) pct += 15;
  else pendientes.push("una foto adicional");

  return { pct, siguientePaso: pendientes[0] || null };
}

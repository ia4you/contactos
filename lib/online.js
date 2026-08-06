export const ONLINE_MINUTOS = 15;

export function esOnline(lastActive) {
  if (!lastActive) return false;
  return new Date(lastActive).getTime() > Date.now() - ONLINE_MINUTOS * 60 * 1000;
}

// Combina "está online" con la privacidad del usuario mostrado: el propio
// usuario siempre se ve a sí mismo online; a terceros solo si tiene
// show_last_seen activado (por defecto true).
export function mostrarPuntoOnline(user, esPropio = false) {
  if (!esOnline(user?.last_active)) return false;
  return esPropio || user?.show_last_seen !== false;
}

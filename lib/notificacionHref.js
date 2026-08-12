// Destino al hacer click en una notificación. De momento solo like_foto
// tiene un destino específico (la foto exacta dentro del propio perfil);
// el resto de tipos no navega a ningún sitio todavía.
export function hrefNotificacion(n, miNick) {
  if (n.tipo === "like_foto" && miNick && n.entity_id) {
    return `/perfil/${miNick}#foto-${n.entity_id}`;
  }
  return null;
}

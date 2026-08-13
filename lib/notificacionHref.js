// Destino al hacer click en una notificación. De momento solo like_foto
// tiene un destino específico: la foto exacta dentro del propio panel de
// gestión de fotos (no el perfil público — es el dueño de la foto quien
// recibe esta notificación, no un visitante), el resto de tipos no
// navega a ningún sitio todavía.
export function hrefNotificacion(n) {
  if (n.tipo === "like_foto" && n.entity_id) {
    return `/mi-perfil?tab=fotos#foto-${n.entity_id}`;
  }
  return null;
}

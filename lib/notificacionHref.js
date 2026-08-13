// Destino al hacer click en una notificación. n.nick es el nick de
// from_user_id (quien generó la notificación), tal como lo devuelve
// GET /api/notificaciones. like_publicacion y comentario aún no navegan
// a ningún sitio.
export function hrefNotificacion(n) {
  switch (n.tipo) {
    case "like_foto":
      return n.entity_id ? `/mi-perfil?tab=fotos#foto-${n.entity_id}` : null;
    case "visita":
    case "amistad_recibida":
    case "amistad_aceptada":
    case "like_perfil":
    case "match":
      return n.nick ? `/perfil/${n.nick}` : null;
    case "mensaje":
      return "/mensajes";
    default:
      return null;
  }
}

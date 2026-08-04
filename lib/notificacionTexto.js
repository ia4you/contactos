export function textoNotificacion(n) {
  const nick = n.nick || "Alguien";
  switch (n.tipo) {
    case "like_perfil":
      return `${nick} ha dado like a tu perfil`;
    case "like_foto":
      return `${nick} ha dado like a tu foto`;
    case "match":
      return `¡Match con ${nick}! Ya podéis hablaros`;
    case "mensaje":
      return `${nick} te ha enviado un mensaje`;
    case "visita":
      return `${nick} ha visitado tu perfil`;
    case "amistad_recibida":
      return `${nick} quiere ser tu amigo/a`;
    case "amistad_aceptada":
      return `${nick} ha aceptado tu solicitud de amistad`;
    default:
      return "Nueva notificación";
  }
}

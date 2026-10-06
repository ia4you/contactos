// Una línea JSON por evento de fotos, para poder reconstruir después quién
// hizo qué (grep '"evento":"foto"'). Sin contraseñas, emails ni contenido.
export function auditarFoto(req, { userId, photoId = null, accion, resultado = "ok" }) {
  console.log(
    JSON.stringify({
      evento: "foto",
      ts: new Date().toISOString(),
      user_id: userId,
      photo_id: photoId,
      accion,
      resultado,
      ip: req.headers.get("x-forwarded-for"),
      user_agent: req.headers.get("user-agent")?.slice(0, 200) ?? null,
    })
  );
}

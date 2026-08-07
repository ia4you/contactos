export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/feed",
          "/mensajes",
          "/ajustes",
          "/mi-perfil",
          "/amistades",
          "/visitas",
          "/notificaciones",
          "/api/",
          "/buscar",
          "/grupos",
          "/eventos",
          "/anuncios",
          "/perfil/",
        ],
      },
    ],
    sitemap: "https://contactos.turel.es/sitemap.xml",
  };
}

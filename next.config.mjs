/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Sin esto, las imágenes de public/images (servidas con max-age=0) salen
    // del optimizador con max-age=60 y el navegador las revalida cada minuto.
    // Las de /uploads ya llevan su propio max-age de un año, que manda.
    minimumCacheTTL: 86400,
  },
  experimental: {
    instrumentationHook: true,
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "Content-Disposition", value: "inline" },
        ],
      },
    ];
  },
};

export default nextConfig;

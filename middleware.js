import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const GATE_COOKIE = "edad_confirmada";
const PROTECTED_ROUTES = ["/mi-perfil", "/feed", "/mensajes", "/ajustes", "/amistades", "/visitas", "/notificaciones", "/buscar", "/grupos", "/eventos", "/anuncios", "/explorar", "/perfil", "/admin", "/clubs", "/likes", "/fotos"];

// Sin la cookie de confirmación de edad, ninguna ruta del sitio es visible
// salvo "/" (que muestra la pantalla de verificación de edad en vez de la
// landing) y los assets estáticos necesarios para renderizarla.
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // El optimizador de next/image hace una petición interna al propio
  // servidor para leer el archivo original (p.ej. /images/banner-hero.png)
  // y esa petición interna no lleva la cookie del navegador — si el gate la
  // bloqueaba, next/image recibía un redirect en vez de la imagen y fallaba
  // con "isn't a valid image, received null". Los assets estáticos de
  // public/ no son "contenido del sitio", así que quedan siempre fuera del
  // gate, igual que _next/api/icons.
  const esEstatico =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico";

  // robots.txt, sitemap.xml y las páginas /canarias/[isla] son contenido
  // público pensado para rastreadores (Googlebot nunca lleva la cookie de
  // edad): si el gate los redirigiera a "/", un crawler solo vería
  // redirects en vez del contenido real y el SEO no serviría de nada.
  const esPublicoSeo =
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/canarias") ||
    pathname.startsWith("/blog") ||
    /^\/google[a-z0-9]+\.html$/.test(pathname);

  if (esEstatico || esPublicoSeo) {
    return NextResponse.next();
  }

  const gateOk = req.cookies.get(GATE_COOKIE)?.value === "1";
  if (!gateOk && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const esProtegida = PROTECTED_ROUTES.some((ruta) => pathname.startsWith(ruta));
  if (esProtegida) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  const response = NextResponse.next();
  if (esProtegida) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

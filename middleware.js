import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const GATE_COOKIE = "edad_confirmada";
const PROTECTED_ROUTES = ["/mi-perfil"];

// Sin la cookie de confirmación de edad, ninguna ruta del sitio es visible
// salvo "/" (que muestra la pantalla de verificación de edad en vez de la
// landing) y los assets estáticos necesarios para renderizarla.
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const esEstatico =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico";

  if (esEstatico) {
    return NextResponse.next();
  }

  const gateOk = req.cookies.get(GATE_COOKIE)?.value === "1";
  if (!gateOk && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (PROTECTED_ROUTES.some((ruta) => pathname.startsWith(ruta))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

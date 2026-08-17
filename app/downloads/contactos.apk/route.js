import { NextResponse } from "next/server";

// Placeholder: todavía no hemos subido el APK real. En cuanto exista como
// archivo estático en public/downloads/contactos.apk, Next lo servirá
// directamente desde ahí (los estáticos de public/ tienen prioridad sobre
// los route handlers) y este redirect deja de usarse sin que haga falta
// tocar nada más.
export async function GET() {
  return NextResponse.redirect("https://contactos.turel.es");
}

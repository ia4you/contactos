import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { auditarFoto } from "@/lib/auditoria";
import { fijarAvatar } from "@/lib/fotosPerfil";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.photoId) {
    return NextResponse.json({ error: "Falta el id de la foto." }, { status: 400 });
  }

  // El user_id sale de la sesión, nunca del cliente; solo fotos approved.
  const ok = await fijarAvatar({ query }, session.user.id, body.photoId);
  auditarFoto(req, {
    userId: session.user.id,
    photoId: body.photoId,
    accion: "cambiar_avatar",
    resultado: ok ? "ok" : "denegado",
  });
  if (!ok) {
    return NextResponse.json({ error: "Foto no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

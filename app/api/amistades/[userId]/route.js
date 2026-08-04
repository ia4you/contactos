import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { crearNotificacion } from "@/lib/notificaciones";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const fromId = Number(params.userId);
  const meId = Number(session.user.id);
  const accion = (await req.json().catch(() => null))?.accion;
  if (!Number.isInteger(fromId) || !["aceptar", "rechazar"].includes(accion)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const nuevoStatus = accion === "aceptar" ? "accepted" : "rejected";
  const { rowCount } = await query(
    `UPDATE amistades SET status = $1, resolved_at = now()
      WHERE from_id = $2 AND to_id = $3 AND status = 'pending'`,
    [nuevoStatus, fromId, meId]
  );

  if (!rowCount) {
    return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }

  if (accion === "aceptar") {
    await crearNotificacion(fromId, "amistad_aceptada", meId);
  }

  return NextResponse.json({ status: nuevoStatus });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const otroId = Number(params.userId);
  const meId = Number(session.user.id);
  if (!Number.isInteger(otroId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rowCount } = await query(
    `DELETE FROM amistades
      WHERE status = 'accepted'
        AND ((from_id = $1 AND to_id = $2) OR (from_id = $2 AND to_id = $1))`,
    [meId, otroId]
  );

  if (!rowCount) {
    return NextResponse.json({ error: "No sois amigos." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);
  const grupoId = Number(params.id);
  const targetId = Number(params.userId);
  if (!Number.isInteger(grupoId) || !Number.isInteger(targetId)) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }

  const { rows: rolRows } = await query(
    `SELECT rol FROM grupo_miembros WHERE grupo_id = $1 AND user_id = $2`,
    [grupoId, meId]
  );
  if (rolRows[0]?.rol !== "admin") {
    return NextResponse.json({ error: "Solo los administradores pueden expulsar miembros." }, { status: 403 });
  }

  const { rows: targetRows } = await query(
    `SELECT rol FROM grupo_miembros WHERE grupo_id = $1 AND user_id = $2`,
    [grupoId, targetId]
  );
  const target = targetRows[0];
  if (!target) {
    return NextResponse.json({ error: "Ese usuario no es miembro del grupo." }, { status: 404 });
  }

  if (target.rol === "admin") {
    const { rows: adminCountRows } = await query(
      `SELECT count(*)::int AS n FROM grupo_miembros WHERE grupo_id = $1 AND rol = 'admin'`,
      [grupoId]
    );
    if (adminCountRows[0].n <= 1) {
      return NextResponse.json({ error: "No puedes expulsar al único administrador del grupo." }, { status: 400 });
    }
  }

  await query(`DELETE FROM grupo_miembros WHERE grupo_id = $1 AND user_id = $2`, [grupoId, targetId]);

  return NextResponse.json({ ok: true });
}

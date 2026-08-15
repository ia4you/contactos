import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

const NICK_REGEX = /^[a-zA-Z0-9_-]+$/;
const DIAS_ESPERA = 30;

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const nick = typeof body?.nick === "string" ? body.nick.trim() : "";

  if (nick.length < 3 || nick.length > 20) {
    return NextResponse.json({ error: "El nick debe tener entre 3 y 20 caracteres." }, { status: 400 });
  }
  if (!NICK_REGEX.test(nick)) {
    return NextResponse.json({ error: "Solo se permiten letras, números, guiones y guiones bajos." }, { status: 400 });
  }

  const { rows } = await query(`SELECT nick_changed_at FROM users WHERE id = $1`, [session.user.id]);
  const nickChangedAt = rows[0]?.nick_changed_at;
  if (nickChangedAt && new Date(nickChangedAt) > new Date(Date.now() - DIAS_ESPERA * 24 * 60 * 60 * 1000)) {
    const disponibleEl = new Date(new Date(nickChangedAt).getTime() + DIAS_ESPERA * 24 * 60 * 60 * 1000);
    return NextResponse.json(
      { error: "Solo puedes cambiar tu nick una vez al mes.", disponibleEl: disponibleEl.toISOString() },
      { status: 400 }
    );
  }

  try {
    await query(`UPDATE users SET nick = $1, nick_changed_at = now() WHERE id = $2`, [nick, session.user.id]);
  } catch (err) {
    if (err.constraint?.includes("nick")) {
      return NextResponse.json({ error: "Ese nick ya está en uso." }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true, nick });
}

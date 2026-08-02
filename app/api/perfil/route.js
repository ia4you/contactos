import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { ISLANDS, LOOKING_FOR_OPTIONS } from "@/lib/constants";

const ISLAND_VALUES = ISLANDS.map((i) => i.value);
const LOOKING_FOR_VALUES = LOOKING_FOR_OPTIONS.map((l) => l.value);

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { bio, island, lookingFor } = body ?? {};

  if (!ISLAND_VALUES.includes(island)) {
    return NextResponse.json({ error: "Isla no válida." }, { status: 400 });
  }
  if (
    !Array.isArray(lookingFor) ||
    lookingFor.length === 0 ||
    !lookingFor.every((v) => LOOKING_FOR_VALUES.includes(v))
  ) {
    return NextResponse.json({ error: "Selecciona al menos una opción en \"qué buscas\"." }, { status: 400 });
  }

  await query(
    `UPDATE users SET bio = $1, island = $2, looking_for = $3 WHERE id = $4`,
    [typeof bio === "string" ? bio.slice(0, 2000) : null, island, lookingFor, session.user.id]
  );

  return NextResponse.json({ ok: true });
}

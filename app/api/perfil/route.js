import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  ISLANDS,
  LOOKING_FOR_OPTIONS,
  GENERO_OPTIONS,
  GENERO_MAX,
  ORIENTACION_OPTIONS,
  ORIENTACION_MAX,
  ROL_OPTIONS,
  ROL_MAX,
} from "@/lib/constants";

const ISLAND_VALUES = ISLANDS.map((i) => i.value);
const LOOKING_FOR_VALUES = LOOKING_FOR_OPTIONS.map((l) => l.value);

function validarMultiSelect(valores, opciones, max) {
  return (
    Array.isArray(valores) &&
    valores.length <= max &&
    valores.every((v) => opciones.includes(v))
  );
}

// Usado por el Navbar para mostrar el avatar real (foto aprobada y marcada
// como avatar) sin tener que meter la ruta de la foto en el JWT, que
// quedaría obsoleta en cuanto el usuario suba o cambie de avatar sin volver
// a iniciar sesión.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { rows } = await query(
    `SELECT filename FROM photos WHERE user_id = $1 AND is_avatar = true AND status = 'approved' LIMIT 1`,
    [session.user.id]
  );

  const avatarUrl = rows[0] ? `/uploads/${session.user.id}/${rows[0].filename}` : null;
  return NextResponse.json({ avatarUrl });
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { bio, herBio, hisBio, island, lookingFor, genero, orientacion, rol } = body ?? {};

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
  if (!validarMultiSelect(genero, GENERO_OPTIONS, GENERO_MAX)) {
    return NextResponse.json({ error: `Selecciona como máximo ${GENERO_MAX} opciones de género.` }, { status: 400 });
  }
  if (!validarMultiSelect(orientacion, ORIENTACION_OPTIONS, ORIENTACION_MAX)) {
    return NextResponse.json({ error: `Selecciona como máximo ${ORIENTACION_MAX} opciones de orientación.` }, { status: 400 });
  }
  if (!validarMultiSelect(rol, ROL_OPTIONS, ROL_MAX)) {
    return NextResponse.json({ error: `Selecciona como máximo ${ROL_MAX} opciones de rol.` }, { status: 400 });
  }

  const limpiar = (v) => (typeof v === "string" ? v.slice(0, 2000) : null);

  await query(
    `UPDATE users
        SET bio = $1, her_bio = $2, his_bio = $3, island = $4, looking_for = $5,
            genero = $6, orientacion = $7, rol = $8
      WHERE id = $9`,
    [
      limpiar(bio),
      limpiar(herBio),
      limpiar(hisBio),
      island,
      lookingFor,
      genero,
      orientacion,
      rol,
      session.user.id,
    ]
  );

  return NextResponse.json({ ok: true });
}

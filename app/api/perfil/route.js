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
import { contieneVulgaridad, MENSAJE_RECHAZO } from "@/lib/filtroVulgar";
import { moderarConGroqEnSegundoPlano } from "@/lib/moderacionIA";

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
  const { rows: userRows } = await query(`SELECT island FROM users WHERE id = $1`, [session.user.id]);

  const avatarUrl = rows[0] ? `/uploads/${session.user.id}/${rows[0].filename}` : null;
  return NextResponse.json({ avatarUrl, island: userRows[0]?.island ?? null });
}

// Actualización parcial: /mi-perfil sigue enviando bio/isla/qué-busco/
// género/orientación/rol todo junto en un solo PATCH, pero /ajustes reparte
// esos mismos campos en varias sub-secciones que solo envían lo suyo — así
// que aquí solo se valida y actualiza lo que realmente venga en el body.
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const columnas = [];
  const valores = [];

  function set(columna, valor) {
    valores.push(valor);
    columnas.push(`${columna} = $${valores.length}`);
  }

  const limpiarTexto = (v, max = 2000) => (typeof v === "string" ? v.slice(0, max) : null);

  // Textos de bio a moderar con Groq tras el guardado (fire-and-forget),
  // solo los campos que realmente vengan en este PATCH y no queden vacíos.
  const biosParaModerar = [];

  for (const [campoBody, columna] of [["bio", "bio"], ["herBio", "her_bio"], ["hisBio", "his_bio"]]) {
    if (!(campoBody in body)) continue;
    const texto = limpiarTexto(body[campoBody]);
    if (texto && contieneVulgaridad(texto)) {
      return NextResponse.json({ error: MENSAJE_RECHAZO }, { status: 400 });
    }
    set(columna, texto);
    if (texto) biosParaModerar.push(texto);
  }

  if ("island" in body) {
    if (!ISLAND_VALUES.includes(body.island)) {
      return NextResponse.json({ error: "Isla no válida." }, { status: 400 });
    }
    set("island", body.island);
  }

  if ("lookingFor" in body) {
    const lookingFor = body.lookingFor;
    if (
      !Array.isArray(lookingFor) ||
      lookingFor.length === 0 ||
      !lookingFor.every((v) => LOOKING_FOR_VALUES.includes(v))
    ) {
      return NextResponse.json({ error: "Selecciona al menos una opción en \"qué buscas\"." }, { status: 400 });
    }
    set("looking_for", lookingFor);
  }

  if ("genero" in body) {
    if (!validarMultiSelect(body.genero, GENERO_OPTIONS, GENERO_MAX)) {
      return NextResponse.json({ error: `Selecciona como máximo ${GENERO_MAX} opciones de género.` }, { status: 400 });
    }
    set("genero", body.genero);
  }

  if ("orientacion" in body) {
    if (!validarMultiSelect(body.orientacion, ORIENTACION_OPTIONS, ORIENTACION_MAX)) {
      return NextResponse.json({ error: `Selecciona como máximo ${ORIENTACION_MAX} opciones de orientación.` }, { status: 400 });
    }
    set("orientacion", body.orientacion);
  }

  if ("rol" in body) {
    if (!validarMultiSelect(body.rol, ROL_OPTIONS, ROL_MAX)) {
      return NextResponse.json({ error: `Selecciona como máximo ${ROL_MAX} opciones de rol.` }, { status: 400 });
    }
    set("rol", body.rol);
  }

  if ("estadoRelacion" in body) set("estado_relacion", limpiarTexto(body.estadoRelacion, 200));

  if ("sitiosWeb" in body) {
    const sitiosWeb = body.sitiosWeb;
    if (!Array.isArray(sitiosWeb) || sitiosWeb.length > 3 || !sitiosWeb.every((v) => typeof v === "string")) {
      return NextResponse.json({ error: "Máximo 3 sitios web." }, { status: 400 });
    }
    set(
      "sitios_web",
      sitiosWeb.map((v) => v.trim().slice(0, 300)).filter(Boolean)
    );
  }

  if ("showInSearch" in body) {
    if (typeof body.showInSearch !== "boolean") {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }
    set("show_in_search", body.showInSearch);
  }

  if ("showLastSeen" in body) {
    if (typeof body.showLastSeen !== "boolean") {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }
    set("show_last_seen", body.showLastSeen);
  }

  if ("onlyVerified" in body) {
    if (typeof body.onlyVerified !== "boolean") {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }
    set("only_verified", body.onlyVerified);
  }

  if (columnas.length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  valores.push(session.user.id);
  await query(
    `UPDATE users SET ${columnas.join(", ")} WHERE id = $${valores.length}`,
    valores
  );

  if (biosParaModerar.length > 0) {
    // Fire-and-forget: la bio ya quedó guardada; se juntan en una sola
    // llamada a Groq en vez de una por campo.
    moderarConGroqEnSegundoPlano({
      texto: biosParaModerar.join("\n\n"),
      tabla: "users",
      id: session.user.id,
      endpoint: "/api/perfil:bio",
      userId: session.user.id,
    }).catch((err) => console.error("Error en moderarConGroqEnSegundoPlano:", err));
  }

  return NextResponse.json({ ok: true });
}

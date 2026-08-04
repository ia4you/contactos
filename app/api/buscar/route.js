import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  ISLANDS,
  PROFILE_TYPES,
  LOOKING_FOR_OPTIONS,
  ORIENTACION_OPTIONS,
} from "@/lib/constants";

const PROFILE_TYPE_VALUES = PROFILE_TYPES.map((p) => p.value);
const ISLAND_VALUES = ISLANDS.map((i) => i.value);
const LOOKING_FOR_VALUES = LOOKING_FOR_OPTIONS.map((l) => l.value);

const LIMITE = 24;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;

  const tipos = params.getAll("tipos").filter((v) => PROFILE_TYPE_VALUES.includes(v));
  const islas = params.getAll("islas").filter((v) => ISLAND_VALUES.includes(v));
  const orientaciones = params.getAll("orientaciones").filter((v) => ORIENTACION_OPTIONS.includes(v));
  const lookingFor = params.getAll("looking_for").filter((v) => LOOKING_FOR_VALUES.includes(v));
  const feticheIds = params
    .getAll("fetiche_ids")
    .map((v) => Number(v))
    .filter((v) => Number.isInteger(v));

  const edadMinRaw = params.get("edad_min");
  const edadMaxRaw = params.get("edad_max");
  const edadMin = edadMinRaw ? Number(edadMinRaw) : null;
  const edadMax = edadMaxRaw ? Number(edadMaxRaw) : null;

  const orden = params.get("orden") === "gustos" ? "gustos" : "recientes";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const offset = (page - 1) * LIMITE;

  const condiciones = [
    "u.deleted_at IS NULL",
    "u.email_verified_at IS NOT NULL",
    "u.show_in_search = true",
    "u.id != $1",
    "EXISTS (SELECT 1 FROM photos p WHERE p.user_id = u.id AND p.status = 'approved' AND p.is_private = false)",
    // Bloqueo en cualquier dirección: si yo he bloqueado a alguien, o me ha
    // bloqueado a mí, no debe aparecer en mis resultados.
    "NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))",
  ];
  const valores = [session.user.id];

  function agregar(condicionFn, valor) {
    valores.push(valor);
    condiciones.push(condicionFn(valores.length));
  }

  if (tipos.length) agregar((n) => `u.profile_type::text = ANY($${n}::text[])`, tipos);
  if (islas.length) agregar((n) => `u.island::text = ANY($${n}::text[])`, islas);
  if (orientaciones.length) agregar((n) => `u.orientacion && $${n}::text[]`, orientaciones);
  if (lookingFor.length) agregar((n) => `u.looking_for && $${n}::text[]`, lookingFor);
  if (feticheIds.length) {
    agregar(
      (n) => `EXISTS (SELECT 1 FROM user_fetiches uf WHERE uf.user_id = u.id AND uf.fetiche_id = ANY($${n}::int[]))`,
      feticheIds
    );
  }
  if (Number.isFinite(edadMin)) agregar((n) => `date_part('year', age(u.her_birthdate)) >= $${n}`, edadMin);
  if (Number.isFinite(edadMax)) agregar((n) => `date_part('year', age(u.her_birthdate)) <= $${n}`, edadMax);

  const ordenSql =
    orden === "gustos"
      ? "gustos_comunes DESC, u.last_seen DESC NULLS LAST"
      : "u.last_seen DESC NULLS LAST";

  const limiteIdx = valores.length + 1;
  const offsetIdx = valores.length + 2;
  valores.push(LIMITE + 1, offset);

  const sql = `
    SELECT
      u.id, u.nick, u.profile_type, u.island, u.verified,
      (SELECT p.filename FROM photos p
         WHERE p.user_id = u.id AND p.status = 'approved' AND p.is_private = false
         ORDER BY p.is_avatar DESC, p.created_at DESC
         LIMIT 1) AS filename,
      (SELECT count(*)::int FROM user_fetiches uf1
         JOIN user_fetiches uf2 ON uf1.fetiche_id = uf2.fetiche_id
        WHERE uf1.user_id = u.id AND uf2.user_id = $1) AS gustos_comunes
    FROM users u
    WHERE ${condiciones.join(" AND ")}
    ORDER BY ${ordenSql}
    LIMIT $${limiteIdx} OFFSET $${offsetIdx}
  `;

  const { rows } = await query(sql, valores);

  const hasMore = rows.length > LIMITE;
  const perfiles = rows.slice(0, LIMITE);

  return NextResponse.json({ perfiles, hasMore });
}

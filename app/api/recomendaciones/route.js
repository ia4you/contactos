import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import groq from "@/lib/groq";
import { registrarUsoGroq } from "@/lib/groqUsage";
import { COMPLETITUD_SQL, UMBRAL_BUSQUEDA } from "@/lib/completitud";

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

function bioDe(u) {
  return u.bio || u.her_bio || u.his_bio || "";
}

// Mismo cálculo que la sección "Por qué conectáis" del perfil: % de gustos
// del VISITANTE que también tiene el candidato. Groq nunca decide este
// número — solo redacta el texto explicativo — para que el porcentaje sea
// siempre coherente entre el widget de recomendaciones y el perfil.
function calcularAfinidad(gustosVisitante, gustosCandidato) {
  if (!gustosVisitante.length) return 0;
  const candidato = gustosCandidato || [];
  const comunes = gustosVisitante.filter((g) => candidato.includes(g)).length;
  return Math.round((comunes / gustosVisitante.length) * 100);
}

async function obtenerCandidatos(meId, island) {
  const { rows } = await query(
    `SELECT u.id, u.nick, u.profile_type, u.island, u.orientacion, u.rol, u.looking_for,
            u.bio, u.her_bio, u.his_bio, u.last_active, u.show_last_seen,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename,
            COALESCE((SELECT array_agg(f.nombre) FROM user_fetiches uf JOIN fetiches f ON f.id = uf.fetiche_id WHERE uf.user_id = u.id), '{}') AS gustos
       FROM users u
      WHERE u.id != $1
        AND u.deleted_at IS NULL
        AND u.email_verified_at IS NOT NULL
        AND EXISTS (SELECT 1 FROM photos WHERE user_id = u.id AND status = 'approved')
        AND ${COMPLETITUD_SQL} >= ${UMBRAL_BUSQUEDA}
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
        AND NOT EXISTS (SELECT 1 FROM matches m WHERE m.user1_id = LEAST($1, u.id) AND m.user2_id = GREATEST($1, u.id))
      ORDER BY u.last_active DESC NULLS LAST
      LIMIT 30`,
    [meId]
  );
  return rows;
}

function construirPrompt(usuario, gustosUsuario, candidatos) {
  const candidatosJson = candidatos.map((c) => ({
    id: c.id,
    nick: c.nick,
    profile_type: c.profile_type,
    island: c.island,
    orientacion: c.orientacion,
    rol: c.rol,
    looking_for: c.looking_for,
    gustos: c.gustos,
    bio: bioDe(c).slice(0, 200),
  }));

  return `Eres un sistema de recomendación para una red social liberal adulta en Canarias.
Analiza el perfil del usuario y los candidatos disponibles y devuelve los 6 más compatibles.

USUARIO:
- Tipo: ${usuario.profile_type}
- Isla: ${usuario.island}
- Busca: ${(usuario.looking_for || []).join(", ")}
- Orientación: ${(usuario.orientacion || []).join(", ")}
- Rol: ${(usuario.rol || []).join(", ")}
- Gustos: ${gustosUsuario.join(", ")}
- Bio: ${bioDe(usuario).slice(0, 300) || "(sin bio)"}

CANDIDATOS (formato JSON):
${JSON.stringify(candidatosJson)}

Devuelve SOLO un JSON válido con este formato exacto, sin texto adicional:
{
  "recomendaciones": [
    {
      "user_id": 123,
      "score": 85,
      "razon_corta": "Tenéis 8 gustos en común",
      "razon_detallada": "Os conecta el bondage, la bisexualidad y estar en Gran Canaria. Buscáis cosas complementarias."
    }
  ]
}

Ordena por score descendente. El score va de 0 a 100 basado en:
- Gustos compartidos o complementarios (40%)
- Compatibilidad de orientación y rol (30%)
- Misma isla o isla cercana (20%)
- Compatibilidad de looking_for (10%)

Considera complementarios: Dominante/Sumiso, Voyeur/Exhibicionista, Hotwife/Cuckold.`;
}

async function llamarGroqConTimeout(prompt, ms) {
  const llamada = groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  return Promise.race([llamada, timeout]);
}

async function fallback(meId, island, gustosUsuario) {
  const { rows } = await query(
    `SELECT u.id, u.nick, u.profile_type, u.island,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename,
            u.last_active, u.show_last_seen,
            COALESCE((SELECT array_agg(f.nombre) FROM user_fetiches uf JOIN fetiches f ON f.id = uf.fetiche_id WHERE uf.user_id = u.id), '{}') AS gustos
       FROM users u
      WHERE u.id != $1
        AND u.deleted_at IS NULL
        AND u.email_verified_at IS NOT NULL
        AND u.island = $2
        AND EXISTS (SELECT 1 FROM photos WHERE user_id = u.id AND status = 'approved')
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
        AND NOT EXISTS (SELECT 1 FROM matches m WHERE m.user1_id = LEAST($1, u.id) AND m.user2_id = GREATEST($1, u.id))
      ORDER BY u.created_at DESC
      LIMIT 6`,
    [meId, island]
  );

  return rows.map((r) => ({
    user_id: r.id,
    nick: r.nick,
    profile_type: r.profile_type,
    island: r.island,
    avatar_filename: r.avatar_filename,
    last_active: r.last_active,
    show_last_seen: r.show_last_seen,
    score: calcularAfinidad(gustosUsuario, r.gustos),
    razon_corta: null,
    razon_detallada: null,
  }));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const cacheado = cache.get(meId);
  if (cacheado && cacheado.expiresAt > Date.now()) {
    return NextResponse.json({ recomendaciones: cacheado.data, cache: true });
  }

  const { rows: userRows } = await query(
    `SELECT id, nick, profile_type, island, orientacion, rol, looking_for, bio, her_bio, his_bio
       FROM users WHERE id = $1`,
    [meId]
  );
  const usuario = userRows[0];
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const { rows: gustosRows } = await query(
    `SELECT f.nombre FROM user_fetiches uf JOIN fetiches f ON f.id = uf.fetiche_id WHERE uf.user_id = $1`,
    [meId]
  );
  const gustosUsuario = gustosRows.map((g) => g.nombre);

  if (gustosUsuario.length === 0) {
    return NextResponse.json({ recomendaciones: [], sinGustos: true });
  }

  const candidatos = await obtenerCandidatos(meId, usuario.island);
  if (candidatos.length === 0) {
    return NextResponse.json({ recomendaciones: [] });
  }

  const candidatosPorId = Object.fromEntries(candidatos.map((c) => [c.id, c]));

  let recomendaciones;
  try {
    const prompt = construirPrompt(usuario, gustosUsuario, candidatos);
    const respuesta = await llamarGroqConTimeout(prompt, 5000);
    const contenido = respuesta.choices[0].message.content;
    const parseado = JSON.parse(contenido);

    registrarUsoGroq(meId, "/api/recomendaciones", respuesta.usage?.total_tokens);

    const vistos = new Set();
    recomendaciones = (parseado.recomendaciones || [])
      .filter((r) => {
        // Groq a veces repite el mismo user_id en la lista; nos quedamos
        // solo con la primera aparición (mayor score, al venir ordenado).
        if (!candidatosPorId[r.user_id] || vistos.has(r.user_id)) return false;
        vistos.add(r.user_id);
        return true;
      })
      .slice(0, 6)
      .map((r) => {
        const c = candidatosPorId[r.user_id];
        return {
          user_id: c.id,
          nick: c.nick,
          profile_type: c.profile_type,
          island: c.island,
          avatar_filename: c.avatar_filename,
          last_active: c.last_active,
          show_last_seen: c.show_last_seen,
          score: calcularAfinidad(gustosUsuario, c.gustos),
          razon_corta: r.razon_corta,
          razon_detallada: r.razon_detallada,
        };
      });

    if (recomendaciones.length === 0) throw new Error("Groq no devolvió recomendaciones válidas.");
  } catch (err) {
    console.error("Fallo de Groq en /api/recomendaciones, usando fallback:", err.message);
    recomendaciones = await fallback(meId, usuario.island, gustosUsuario);
  }

  cache.set(meId, { data: recomendaciones, expiresAt: Date.now() + CACHE_TTL_MS });

  return NextResponse.json({ recomendaciones });
}

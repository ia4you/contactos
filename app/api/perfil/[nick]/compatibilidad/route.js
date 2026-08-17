import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import groq from "@/lib/groq";
import { registrarUsoGroq } from "@/lib/groqUsage";
import { gustosComplementarios } from "@/lib/gustos";

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map();

async function gustosDe(userId) {
  const { rows } = await query(
    `SELECT f.nombre FROM user_fetiches uf JOIN fetiches f ON f.id = uf.fetiche_id WHERE uf.user_id = $1`,
    [userId]
  );
  return rows.map((r) => r.nombre);
}

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const meId = Number(session.user.id);

  const { rows: targetRows } = await query(
    `SELECT id, nick, profile_type, island FROM users WHERE lower(nick) = lower($1) AND deleted_at IS NULL`,
    [params.nick]
  );
  const target = targetRows[0];
  if (!target) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }
  if (target.id === meId) {
    return NextResponse.json({ gustosCompartidos: [], gustosComplementarios: [], explicacion: null });
  }

  const [gustosVisitante, gustosObjetivo] = await Promise.all([gustosDe(meId), gustosDe(target.id)]);

  if (gustosVisitante.length === 0) {
    return NextResponse.json({ gustosCompartidos: [], gustosComplementarios: [], explicacion: null });
  }

  const compartidos = gustosVisitante.filter((g) => gustosObjetivo.includes(g));
  const complementarios = gustosComplementarios(gustosVisitante, gustosObjetivo);

  const cacheKey = `${Math.min(meId, target.id)}_${Math.max(meId, target.id)}`;
  const cacheado = cache.get(cacheKey);
  if (cacheado && cacheado.expiresAt > Date.now()) {
    return NextResponse.json({ gustosCompartidos: compartidos, gustosComplementarios: complementarios, explicacion: cacheado.explicacion });
  }

  let explicacion = null;
  try {
    const { rows: meRows } = await query(`SELECT profile_type, island, orientacion, rol FROM users WHERE id = $1`, [meId]);
    const yo = meRows[0];

    const prompt = `Analiza estos dos perfiles de una red social liberal adulta y genera una explicación
breve y atractiva de por qué podrían conectar bien. Máximo 2 frases, tono positivo
y discreto. Devuelve SOLO el texto, sin JSON ni formato adicional.

PERFIL A: tipo ${yo.profile_type}, isla ${yo.island}, orientación ${(yo.orientacion || []).join(", ")}, rol ${(yo.rol || []).join(", ")}
PERFIL B: tipo ${target.profile_type}, isla ${target.island}

Gustos compartidos: ${compartidos.join(", ") || "ninguno"}
Gustos complementarios: ${complementarios.map(([a, b]) => `${a}/${b}`).join(", ") || "ninguno"}`;

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000));
    const respuesta = await Promise.race([
      groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        temperature: 0.3,
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
      timeout,
    ]);

    explicacion = respuesta.choices[0].message.content.trim();
    registrarUsoGroq(meId, "/api/perfil/[nick]/compatibilidad", respuesta.usage?.total_tokens);
  } catch (err) {
    console.error("Fallo de Groq en compatibilidad de perfil, mostrando solo gustos:", err.message);
    explicacion = null;
  }

  cache.set(cacheKey, { explicacion, expiresAt: Date.now() + CACHE_TTL_MS });

  return NextResponse.json({ gustosCompartidos: compartidos, gustosComplementarios: complementarios, explicacion });
}

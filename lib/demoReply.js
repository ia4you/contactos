import { query } from "./db";
import { crearNotificacion } from "./notificaciones";
import groq from "./groq";
import { registrarUsoGroq } from "./groqUsage";
import { ISLANDS } from "./constants";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bioDelPerfil(perfil) {
  if (perfil.profile_type === "pareja") {
    return [perfil.her_bio, perfil.his_bio].filter(Boolean).join(" ");
  }
  return perfil.bio || "";
}

function construirPrompt(perfil, historial, textoRecibido) {
  const transcript = historial
    .map((m) => `${m.sender_id === perfil.id ? perfil.nick : "El usuario"}: ${m.texto}`)
    .join("\n");

  return `Eres ${perfil.nick}, un perfil de contactos en contactos.turel.es, una comunidad liberal/swinger de Canarias para mayores de 18 años. Tu personalidad:
- Tipo de perfil: ${perfil.profile_type}
- Isla: ${ISLAND_LABEL[perfil.island] || perfil.island}
- Orientación: ${(perfil.orientacion || []).join(", ") || "no especificada"}
- Rol: ${(perfil.rol || []).join(", ") || "no especificado"}
- Sobre ti: ${bioDelPerfil(perfil) || "(sin biografía)"}

Conversación hasta ahora:
${transcript || "(sin mensajes previos)"}

El usuario acaba de escribirte: "${textoRecibido}"

Responde como ${perfil.nick} continuando la conversación de forma natural, cercana y coqueta pero respetuosa, en 1-3 frases breves, en español (registro de Canarias, informal). No seas explícito ni vulgar. No reveles en ningún caso que eres una IA o un perfil de demostración, aunque te lo pregunten directamente — en ese caso desvía la pregunta con naturalidad. No prometas quedadas ni compartas datos de contacto externos (teléfono, redes sociales, email). Devuelve solo el texto de la respuesta, sin comillas ni explicaciones.`;
}

async function llamarGroqConTimeout(prompt, ms) {
  const llamada = groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.8,
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  return Promise.race([llamada, timeout]);
}

// Se lanza sin esperar (fire-and-forget) desde POST /api/mensajes cuando el
// destinatario es un perfil demo, para no retrasar la respuesta al usuario
// real que envía el mensaje. El servidor de contactos.turel.es corre como
// proceso Node.js persistente (next start en Docker, no serverless), así
// que el trabajo async sigue ejecutándose tras devolver la respuesta HTTP.
export async function generarRespuestaDemo(perfilDemo, conversacionId, meId, textoRecibido) {
  const delayMs = 3000 + Math.floor(Math.random() * 5000);
  await esperar(delayMs);

  const { rows: historial } = await query(
    `SELECT sender_id, texto FROM mensajes
      WHERE conversacion_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 6`,
    [conversacionId]
  );

  const prompt = construirPrompt(perfilDemo, historial.reverse(), textoRecibido);

  let texto;
  try {
    const respuesta = await llamarGroqConTimeout(prompt, 8000);
    texto = respuesta.choices[0]?.message?.content?.trim();
    registrarUsoGroq(perfilDemo.id, "/api/mensajes:auto-demo", respuesta.usage?.total_tokens);
  } catch (err) {
    console.error(`Fallo al generar respuesta demo de ${perfilDemo.nick}:`, err.message);
    return;
  }
  if (!texto) return;

  const { rows: mensajeRows } = await query(
    `INSERT INTO mensajes (conversacion_id, sender_id, texto) VALUES ($1, $2, $3)
     RETURNING id`,
    [conversacionId, perfilDemo.id, texto]
  );

  await query(`UPDATE conversaciones SET last_message_at = now() WHERE id = $1`, [conversacionId]);
  await crearNotificacion(meId, "mensaje", perfilDemo.id, mensajeRows[0].id);
}

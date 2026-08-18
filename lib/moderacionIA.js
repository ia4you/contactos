import { query } from "./db";
import groq from "./groq";
import { registrarUsoGroq } from "./groqUsage";

// Guarda frente a inyección SQL: `tabla` se interpola directamente en el
// UPDATE (los nombres de tabla no se pueden parametrizar con $1), así que
// solo se permiten estos tres valores exactos, nunca lo que venga de fuera.
const TABLAS_PERMITIDAS = new Set(["publicaciones", "comentarios", "users"]);

function construirPrompt(texto) {
  return `Eres moderador de contenido para una comunidad liberal/swinger española, de tono elegante tipo club privado. Evalúa el siguiente texto.

ACEPTABLE (no rechazar): lenguaje sexual expresado con elegancia, insinuación, deseo o naturalidad. Ejemplos aceptables: "Qué cuerpo tan bonito", "Me encantaría conocerte", "Eres muy atractivo/a", descripciones sensuales pero cuidadas.

RECHAZAR: vocabulario vulgar, soez o chabacano tipo comentario de vestuario, aunque sea sobre sexo. Ejemplos a rechazar: "vaya pollón que tienes", "tremendo culo, te empotraría a cuatro patas", insultos, groserías gratuitas, lenguaje agresivo o degradante.

La diferencia clave es el TONO y el VOCABULARIO, no el tema. Se puede hablar de sexo con clase; lo que se rechaza es la vulgaridad, no la sexualidad.

Responde solo JSON: {"aprobado": true/false, "motivo": "breve explicación si se rechaza"}

Texto a evaluar: ${texto}`;
}

async function llamarGroqConTimeout(prompt, ms) {
  const llamada = groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: 0,
    max_tokens: 400,
    // openai/gpt-oss-20b es un modelo "razonador": sin fijar esto, gasta el
    // presupuesto de tokens pensando en un campo `reasoning` aparte y puede
    // no llegar a emitir el JSON final (content vacío, finish_reason
    // "length"). En "low" responde consistentemente en unos cientos de ms.
    reasoning_effort: "low",
    messages: [{ role: "user", content: prompt }],
  });
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  return Promise.race([llamada, timeout]);
}

function parsearRespuesta(texto) {
  if (!texto) return null;
  // Aunque el prompt pide "solo JSON", el modelo a veces lo envuelve en
  // texto o en un bloque ```json ... ```; nos quedamos con el primer {...}.
  const match = texto.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[0]);
    return typeof data.aprobado === "boolean" ? data : null;
  } catch {
    return null;
  }
}

// Fire-and-forget: se llama DESPUÉS de guardar el contenido en BD, nunca
// antes, para no añadir la latencia de Groq al guardado. Igual que
// generarRespuestaDemo() en lib/demoReply.js, el servidor corre como
// proceso Node persistente (next start en Docker, no serverless), así que
// esta llamada sigue ejecutándose en segundo plano tras devolver la
// respuesta HTTP al cliente. Si Groq falla, no responde a tiempo o la
// respuesta no se puede interpretar, se deja el contenido tal cual
// (fail-open): es preferible no bloquear la publicación a que un fallo de
// la IA tumbe la funcionalidad.
export async function moderarConGroqEnSegundoPlano({ texto, tabla, id, endpoint, userId }) {
  if (!TABLAS_PERMITIDAS.has(tabla)) {
    console.error(`moderarConGroqEnSegundoPlano: tabla no permitida "${tabla}"`);
    return;
  }

  let respuesta;
  try {
    respuesta = await llamarGroqConTimeout(construirPrompt(texto), 8000);
  } catch (err) {
    console.error(`Moderación IA (${endpoint}) falló o no respondió a tiempo, se deja pasar el contenido:`, err.message);
    return;
  }

  const contenido = respuesta.choices[0]?.message?.content?.trim();
  registrarUsoGroq(userId ?? null, endpoint, respuesta.usage?.total_tokens);

  const resultado = parsearRespuesta(contenido);
  if (!resultado) {
    console.error(`Moderación IA (${endpoint}): respuesta no interpretable, se deja pasar el contenido:`, contenido);
    return;
  }

  if (resultado.aprobado === false) {
    await query(`UPDATE ${tabla} SET revision_pendiente = true WHERE id = $1`, [id]).catch((err) => {
      console.error(`Moderación IA (${endpoint}): fallo al marcar revision_pendiente en ${tabla}#${id}:`, err.message);
    });
    console.warn(`Moderación IA (${endpoint}) marcó revision_pendiente en ${tabla}#${id}: ${resultado.motivo || "(sin motivo)"}`);
  }
}

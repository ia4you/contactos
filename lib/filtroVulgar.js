// Filtro local, síncrono y bloqueante: se ejecuta antes de guardar en BD, sin
// llamar a ningún servicio externo, para que mensajes privados, publicaciones,
// comentarios y bio queden protegidos sin añadir latencia. La capa de matiz
// (sexual elegante vs. chabacano) la aporta lib/moderacionIA.js aparte; esta
// lista solo cubre vulgaridad e insultos inequívocos.
const TERMINOS_VULGARES = [
  // Insultos y palabrotas
  "gilipollas", "gilipollez", "gilipuertas", "imbecil", "idiota", "subnormal",
  "retrasado", "retrasada", "cabron", "cabrona", "hijoputa", "hijo de puta",
  "hija de puta", "malparido", "malparida", "capullo", "pendejo", "pendeja",
  "mamon", "mamona", "zorra", "puta", "puto", "putona", "maricon", "marica",
  "mierda", "coño", "joder", "hostia", "cojones",

  // Vocabulario vulgar/chabacano para cuerpo o sexo. A propósito NO incluye
  // términos formales o elegantes ("pene", "ereccion", "deseo", "cuerpo",
  // "sensual"...), que son aceptables en el tono de esta comunidad.
  "polla", "pollon", "verga", "picha", "chocho", "culo", "tetas",
  "follar", "follarte", "follarme", "follo", "follas", "folla", "follamos",
  "follais", "follan", "follando", "follado", "follaria", "follador", "folladora",
  "empotrar", "empotrarte", "empotrarme", "empotro", "empotras", "empotra",
  "empotramos", "empotrais", "empotran", "empotrando", "empotrado", "empotraria",
  "mamada",
];

// Sustituciones típicas de "leetspeak" usadas para esquivar filtros.
const SUSTITUCIONES_LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" };

// Caracteres usados habitualmente para separar las letras de una palabra y
// esquivar así una coincidencia exacta (espacios, asteriscos, puntos...).
const CLASE_SEPARADOR = "[\\s*_.\\-]+";

function escaparRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos/diacríticos
    .replace(/[01345789@$]/g, (c) => SUSTITUCIONES_LEET[c] ?? c)
    .replace(/(.)\1+/g, "$1"); // colapsa letras repetidas: "puuuuta" -> "puta"
}

function construirTermino(fraseOriginal) {
  // Mismo colapso de letras repetidas que normalizarTexto() aplica al texto
  // de entrada, para que "gilipollas" (con "ll") siga coincidiendo con la
  // versión ya colapsada del texto a evaluar.
  const frase = fraseOriginal.replace(/(.)\1+/g, "$1");
  const partes = frase.split(" ").map(escaparRegex);
  const exacto = new RegExp(`\\b${partes.join("\\s+")}\\b`);

  // El patrón "separado por caracteres" solo tiene sentido para palabras
  // sueltas (no frases): detecta variantes tipo "c*u*l*o" o "c u l o" sin
  // afectar a palabras normales que simplemente contienen la cadena como
  // subcadena (p. ej. "vehiculo" o "vinculo" no llevan separadores reales
  // entre sus letras, así que no coinciden).
  let separado = null;
  if (!frase.includes(" ") && frase.length > 2) {
    const letras = frase.split("").map(escaparRegex);
    separado = new RegExp(letras.join(CLASE_SEPARADOR));
  }

  return { exacto, separado };
}

const PATRONES = TERMINOS_VULGARES.map(construirTermino);

export function contieneVulgaridad(texto) {
  if (typeof texto !== "string" || !texto.trim()) return false;

  const normalizado = normalizarTexto(texto);
  return PATRONES.some(({ exacto, separado }) => exacto.test(normalizado) || (separado && separado.test(normalizado)));
}

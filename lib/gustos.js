// Pares de gustos considerados complementarios (uno busca lo que el otro
// ofrece) — usados tanto en el prompt de recomendaciones como en el cálculo
// de "gustos complementarios" de la sección "Por qué conectáis".
export const PARES_COMPLEMENTARIOS = [
  ["Dominación", "Sumisión"],
  ["Voyeurismo", "Exhibicionismo"],
  ["Hotwife", "Cuckold"],
];

export function gustosComplementarios(gustosA, gustosB) {
  const setA = new Set(gustosA);
  const setB = new Set(gustosB);
  const pares = [];
  for (const [x, y] of PARES_COMPLEMENTARIOS) {
    if (setA.has(x) && setB.has(y)) pares.push([x, y]);
    if (setA.has(y) && setB.has(x)) pares.push([y, x]);
  }
  return pares;
}

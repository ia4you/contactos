const UNIDADES = [
  { limite: 60, divisor: 1, singular: "segundo", plural: "segundos" },
  { limite: 3600, divisor: 60, singular: "minuto", plural: "minutos" },
  { limite: 86400, divisor: 3600, singular: "hora", plural: "horas" },
  { limite: 2592000, divisor: 86400, singular: "día", plural: "días" },
  { limite: 31536000, divisor: 2592000, singular: "mes", plural: "meses" },
  { limite: Infinity, divisor: 31536000, singular: "año", plural: "años" },
];

export function tiempoRelativo(fecha) {
  const segundos = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 1000));
  if (segundos < 10) return "justo ahora";

  const unidad = UNIDADES.find((u) => segundos < u.limite);
  const valor = Math.floor(segundos / unidad.divisor);
  return `hace ${valor} ${valor === 1 ? unidad.singular : unidad.plural}`;
}

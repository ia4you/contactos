// Fecha grande en itálica sobre una regla vertical (feed y /eventos):
// día de la semana completo arriba, número y mes abreviado debajo, para que
// «mar» (martes) nunca se lea como marzo.
const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

export function FechaEvento({ iso }) {
  const d = new Date(iso);
  const semana = mayuscula(d.toLocaleDateString("es-ES", { weekday: "long" }));
  const dia = d.toLocaleDateString("es-ES", { day: "numeric" });
  const mes = d.toLocaleDateString("es-ES", { month: "short" }).replace(/\.$/, "") + ".";
  return (
    <time dateTime={iso} className="evento-fecha">
      <span className="evento-fecha__semana">{semana}</span>
      <span className="numeral evento-fecha__dia">{dia}</span>
      <span className="evento-fecha__mes">{mes}</span>
    </time>
  );
}

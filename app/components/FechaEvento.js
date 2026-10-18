// Fecha grande en itálica sobre una regla vertical (feed y /eventos).
export function FechaEvento({ iso }) {
  const d = new Date(iso);
  const dia = d.toLocaleDateString("es-ES", { day: "numeric" });
  const mes = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  const semana = d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
  return (
    <time dateTime={iso} className="evento-fecha">
      <span className="numeral evento-fecha__dia">{dia}</span>
      <span className="evento-fecha__mes">
        {semana} · {mes}
      </span>
    </time>
  );
}

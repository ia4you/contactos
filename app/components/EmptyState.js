// Estado vacío tipográfico: texto en Cormorant itálica y una regla dorada.
// (Algunas llamadas aún pasan `alto`, el tamaño de la antigua ilustración:
// ya no tiene efecto.)
export function EmptyState({ texto = "Aún no hay nada aquí" }) {
  return (
    <div className="estado-vacio">
      <p className="estado-vacio__texto">{texto}</p>
      <hr className="estado-vacio__regla" />
    </div>
  );
}

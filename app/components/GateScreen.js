import { confirmarEdad } from "../actions/gate";

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: 100 }, (_, i) => ANIO_ACTUAL - i);

// Overlay fixed a pantalla completa (clase .gate) sobre la landing, que
// sigue en el HTML para SEO. Debe conservar el formulario con
// action={confirmarEdad} y los campos dia/mes/anio.
export function GateScreen({ error }) {
  return (
    <main className="gate">
      <div className="gate__caja">
        <p className="gate__marca">Contactos</p>

        {/* No es <h1>: el H1 real de la página es el de Landing (contenido
            real indexable). Este es un overlay/diálogo interstitial, así que
            usa role="heading" aria-level="2" para conservar semántica de
            encabezado accesible sin duplicar el H1 del documento. */}
        <p role="heading" aria-level="2" className="gate__titulo">
          ¿Eres mayor de <em className="acento">18 años</em>?
        </p>
        <p className="gate__texto">
          Este sitio contiene contenido dirigido exclusivamente a un público
          adulto. Indica tu fecha de nacimiento para continuar.
        </p>

        <form action={confirmarEdad}>
          <fieldset className="gate__fecha">
            <legend className="sr-only">Fecha de nacimiento</legend>
            <label>
              <span className="sr-only">Día</span>
              <select name="dia" required defaultValue="" className="input-field">
                <option value="" disabled>Día</option>
                {DIAS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Mes</span>
              <select name="mes" required defaultValue="" className="input-field">
                <option value="" disabled>Mes</option>
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Año</span>
              <select name="anio" required defaultValue="" className="input-field">
                <option value="" disabled>Año</option>
                {ANIOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
          </fieldset>

          {error && (
            <p role="alert" style={{ marginTop: 14, fontSize: 14, color: "var(--danger)" }}>
              Debes ser mayor de 18 años para acceder a este sitio.
            </p>
          )}

          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
            <button type="submit" className="btn-gold" style={{ minWidth: 200 }}>
              Continuar
            </button>
            <a href="https://www.google.com" className="site-footer__enlace">
              No, salir
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}

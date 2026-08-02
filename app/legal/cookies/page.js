import { LegalPage } from "../../components/LegalPage";

export const metadata = { title: "Cookies — contactos.turel.es" };

export default function Cookies() {
  return (
    <LegalPage titulo="Política de cookies">
      {/* REVISAR LEGALMENTE */}
      <p>
        contactos.turel.es utiliza cookies técnicas y de sesión estrictamente
        necesarias para el funcionamiento del sitio. No utilizamos cookies de
        publicidad ni de seguimiento de terceros.
      </p>

      <p>
        <strong>Cookie de verificación de edad</strong> (
        <code>edad_confirmada</code>): guarda que has confirmado ser mayor de
        18 años, para no volver a mostrarte la pantalla de verificación en
        cada visita. Es una cookie técnica exenta del deber de solicitar
        consentimiento conforme al artículo 22.2 LSSI, ya que es
        imprescindible para prestar el servicio solicitado.
      </p>

      <p>
        <strong>Cookie de sesión</strong> (gestionada por NextAuth): mantiene
        tu sesión iniciada de forma segura mientras usas la plataforma. Es
        igualmente una cookie técnica necesaria para el funcionamiento del
        servicio.
      </p>

      <p>
        Ninguna de estas cookies se utiliza con fines distintos a los aquí
        descritos, ni se comparte su contenido con terceros.
      </p>

      <p>
        Puedes eliminar o bloquear las cookies desde la configuración de tu
        navegador, aunque esto puede impedir el correcto funcionamiento del
        sitio.
      </p>
    </LegalPage>
  );
}

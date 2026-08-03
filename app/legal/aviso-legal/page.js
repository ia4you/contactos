import { LegalPage } from "../../components/LegalPage";

export const metadata = { title: "Aviso legal — contactos.turel.es" };

export default function AvisoLegal() {
  return (
    <LegalPage kicker="Información legal" titulo="Aviso legal">
      {/* REVISAR LEGALMENTE */}
      <p>
        En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se
        informa a los usuarios de contactos.turel.es de los siguientes datos:
      </p>
      <p>
        <strong>Titular del sitio:</strong> Turel (datos identificativos
        completos pendientes de incorporar). <strong>Contacto:</strong>{" "}
        soporte@turel.es
      </p>
      <p>
        <strong>Objeto:</strong> contactos.turel.es es una plataforma de
        contactos dirigida exclusivamente a personas mayores de 18 años,
        cuyo acceso queda condicionado a la confirmación expresa de dicha
        edad mínima.
      </p>
      <p>
        <strong>Condiciones de uso:</strong> El acceso y uso del sitio atribuye
        la condición de usuario y presupone la aceptación plena de las
        condiciones incluidas en este aviso legal, en la Política de
        Privacidad y en la Política de Cookies. El usuario se compromete a
        hacer un uso adecuado de los contenidos y servicios ofrecidos, a no
        emplear el sitio para actividades ilícitas y a proporcionar
        información veraz en su registro.
      </p>
      <p>
        <strong>Propiedad intelectual:</strong> Los contenidos propios del
        sitio (textos, diseño, marca) son titularidad de Turel. Los
        contenidos aportados por los usuarios (fotografías, biografías) son
        responsabilidad exclusiva de quien los publica.
      </p>
      <p>
        <strong>Responsabilidad:</strong> Turel no se hace responsable del
        uso que los usuarios hagan de la información publicada por otros
        usuarios, ni del contenido de los perfiles, más allá de las medidas
        de moderación descritas en la Política de Privacidad.
      </p>
      <p>
        <strong>Legislación aplicable:</strong> Las presentes condiciones se
        rigen por la legislación española.
      </p>
    </LegalPage>
  );
}

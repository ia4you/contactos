import { LegalPage } from "../../components/LegalPage";

export const metadata = { title: "Privacidad — contactos.turel.es" };

export default function Privacidad() {
  return (
    <LegalPage kicker="Tu privacidad importa" titulo="Política de privacidad">
      {/* REVISAR LEGALMENTE */}
      <p>
        En contactos.turel.es la discreción y la protección de tus datos son
        la prioridad absoluta del servicio. Esta política explica qué datos
        tratamos, con qué finalidad y qué derechos tienes sobre ellos,
        conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica
        3/2018 de Protección de Datos Personales y garantía de los derechos
        digitales (LOPDGDD).
      </p>

      <p>
        <strong>Categoría especial de datos (art. 9 RGPD).</strong> El
        registro y uso de este sitio implica el tratamiento de datos
        relativos a tu orientación o preferencias en materia de vida
        sexual, que constituyen una categoría especial de datos según el
        artículo 9.1 RGPD. Este tratamiento solo se realiza tras recabar tu
        consentimiento explícito, de forma separada e inequívoca, conforme
        al artículo 9.2.a RGPD, en el momento del registro.
      </p>

      <p>
        <strong>Datos que tratamos:</strong> email, nick, contraseña
        (cifrada), tipo de perfil, isla, fecha(s) de nacimiento, biografía,
        qué buscas, fotografías que subas voluntariamente, así como datos de
        uso del servicio (visitas entre perfiles, contactos, últimas
        conexiones) necesarios para el funcionamiento de la plataforma.
      </p>

      <p>
        <strong>Finalidad:</strong> gestionar tu cuenta y perfil, permitir la
        conexión con otros usuarios, moderar contenido mediante un sistema
        de denuncias entre usuarios, con revisión manual por parte del
        responsable del tratamiento cuando sea necesario, y enviarte las
        comunicaciones estrictamente necesarias para el funcionamiento del
        servicio (verificación de email, recuperación de contraseña).
      </p>

      <p>
        <strong>Base legal:</strong> tu consentimiento explícito (art. 6.1.a
        y 9.2.a RGPD), otorgado de forma libre, específica, informada e
        inequívoca en el momento del registro, y revocable en cualquier
        momento eliminando tu cuenta.
      </p>

      <p>
        <strong>Conservación:</strong> tus datos se conservan mientras tu
        cuenta permanezca activa. Al solicitar la eliminación de tu cuenta,
        esta se marca para borrado inmediato y los datos y archivos
        asociados se eliminan de forma definitiva de nuestros sistemas en un
        plazo máximo de 30 días.
      </p>

      <p>
        <strong>Derecho de supresión / borrado real de cuenta.</strong> Puedes
        eliminar tu cuenta en cualquier momento desde &ldquo;Mi perfil →
        Eliminar mi cuenta&rdquo;. Esta acción no es una simple
        desactivación: transcurrido
        el plazo indicado, tu cuenta, perfil, fotografías y cualquier dato
        asociado se borran de forma permanente e irreversible de nuestra
        base de datos y servidores.
      </p>

      <p>
        <strong>Tus derechos:</strong> además del derecho de supresión, tienes
        derecho de acceso, rectificación, limitación del tratamiento,
        portabilidad y oposición. Puedes ejercerlos escribiendo a
        soporte@turel.es.
      </p>

      <p>
        <strong>Confidencialidad de las fotografías:</strong> Las
        fotografías que publicas son visibles para el resto de usuarios
        registrados de forma inmediata tras su subida. Al publicar una
        fotografía certificas que todas las personas que aparecen en ella
        son mayores de 18 años y han dado su consentimiento. Puedes marcar
        cualquier fotografía como privada para que solo sea visible para
        ti. En los listados de búsqueda las fotografías pueden mostrarse
        con un efecto visual de desenfoque.
      </p>

      <p>
        <strong>Destinatarios:</strong> tus datos no se ceden a terceros
        salvo obligación legal. Los proveedores de infraestructura (hosting,
        correo) actúan como encargados del tratamiento conforme al art. 28
        RGPD.
      </p>

      <p>
        <strong>Uso de inteligencia artificial:</strong> este sitio utiliza
        sistemas de inteligencia artificial (modelo LLaMA a través de la
        API de Groq) para generar recomendaciones de perfiles compatibles y
        analizar la afinidad entre usuarios en base a sus gustos e
        intereses declarados. Este procesamiento se realiza sobre datos que
        el propio usuario ha proporcionado voluntariamente en su perfil. No
        se toman decisiones automatizadas con efectos jurídicos sobre el
        usuario conforme al art. 22 RGPD.
      </p>
    </LegalPage>
  );
}

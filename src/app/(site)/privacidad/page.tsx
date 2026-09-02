import type { Metadata } from 'next';
import { business, isEmailConfigured } from '@/config/business';
import { buildMetadata } from '@/lib/seo';
import { SectionHeading } from '@/components/site/SectionHeading';

export const metadata: Metadata = buildMetadata({
  title: 'Política de privacidad',
  description: `Cómo ${business.name} recopila, usa y protege los datos que entregas al solicitar una visita.`,
  path: '/privacidad',
});

/**
 * No se inventa razón social ni RUT: si `legalName`/`taxId` están vacíos en la
 * configuración, simplemente no se mencionan.
 */
export default function PrivacyPage() {
  const responsable = business.legalName ?? business.name;

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 md:py-16">
          <SectionHeading
            as="h1"
            eyebrow="Legal"
            title="Política de privacidad"
            description="Qué datos pedimos, para qué los usamos y cómo puedes contactarnos."
          />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <div className="prose-armony mx-auto max-w-2xl">
            <h2>Quién trata tus datos</h2>
            <p>
              Los datos que entregas a través de este sitio son tratados por {responsable}
              {business.taxId ? `, RUT ${business.taxId}` : ''}, empresa dedicada a la instalación,
              revisión y recambio de mallas de seguridad.
            </p>

            <h2>Qué datos recopilamos</h2>
            <p>Cuando solicitas una visita a través del sitio te pedimos únicamente:</p>
            <ul>
              <li>Tu nombre.</li>
              <li>Tu número de WhatsApp o teléfono.</li>
              <li>Tu correo electrónico, sólo si decides dejarlo.</li>
              <li>La región y comuna donde necesitas el servicio.</li>
              <li>El tipo de espacio y el trabajo que necesitas.</li>
              <li>La fecha y el horario que prefieres para la visita.</li>
              <li>
                Hasta tres fotografías del espacio, si decides adjuntarlas. Son completamente
                opcionales.
              </li>
            </ul>
            <p>
              No pedimos tu RUT, tu dirección exacta ni datos sensibles al momento de agendar. La
              dirección la coordinamos después contigo, por WhatsApp, y la registramos internamente
              sólo para poder realizar la visita.
            </p>

            <h2>Para qué usamos tus datos</h2>
            <ul>
              <li>Contactarte para coordinar y confirmar la visita.</li>
              <li>Entender qué necesitas antes de ir a terreno.</li>
              <li>Enviarte, si dejaste tu correo, una copia de tu solicitud.</li>
              <li>Llevar un registro interno de las visitas y trabajos realizados.</li>
            </ul>
            <p>
              No usamos tus datos para publicidad de terceros ni los vendemos. No los compartimos
              con nadie salvo los proveedores tecnológicos que necesitamos para operar el sitio
              (alojamiento, base de datos y envío de correos), que sólo los procesan por encargo
              nuestro.
            </p>

            <h2>Las fotografías que envías</h2>
            <p>
              Las fotografías se guardan en un almacenamiento privado. No son públicas, no tienen
              enlaces permanentes y sólo pueden verlas las personas autorizadas de {business.name}
              desde el panel interno, mediante enlaces temporales. No las publicamos en el sitio ni
              en redes sociales sin pedirte autorización expresa.
            </p>

            <h2>Cuánto tiempo los guardamos</h2>
            <p>
              Conservamos la información de tu solicitud mientras sea necesaria para atenderte y
              para el registro histórico de nuestros trabajos. Si prefieres que la eliminemos antes,
              puedes pedírnoslo.
            </p>

            <h2>Tus derechos</h2>
            <p>
              Puedes pedirnos en cualquier momento acceder a los datos que tenemos sobre ti,
              corregirlos, actualizarlos o solicitar su eliminación. Basta con escribirnos.
            </p>

            <h2>Cookies y analítica</h2>
            <p>
              Este sitio no usa cookies publicitarias propias. Si hay herramientas de analítica
              activas, se usan únicamente para entender de forma agregada cómo se utiliza el sitio y
              mejorar la experiencia.
            </p>

            <h2>Cómo contactarnos</h2>
            <p>Para cualquier consulta sobre tus datos puedes escribirnos:</p>
            <ul>
              {isEmailConfigured() && (
                <li>
                  Correo: <a href={`mailto:${business.contact.email}`}>{business.contact.email}</a>
                </li>
              )}
              <li>
                Instagram:{' '}
                <a href={business.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                  @{business.contact.instagram}
                </a>
              </li>
              <li>WhatsApp, a través del botón disponible en el sitio.</li>
            </ul>

            <p className="mt-8 text-sm">
              Última actualización: {new Date().toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
              })}
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

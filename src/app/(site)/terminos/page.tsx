import type { Metadata } from 'next';
import { business } from '@/config/business';
import { buildMetadata } from '@/lib/seo';
import { SectionHeading } from '@/components/site/SectionHeading';

export const metadata: Metadata = buildMetadata({
  title: 'Términos y condiciones',
  description: `Condiciones de uso del sitio de ${business.name} y del sistema de solicitud de visitas.`,
  path: '/terminos',
});

/**
 * No se inventan condiciones comerciales: precios, plazos, garantías ni
 * políticas de cancelación. Lo pendiente se marca explícitamente.
 */
export default function TermsPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 md:py-16">
          <SectionHeading
            as="h1"
            eyebrow="Legal"
            title="Términos y condiciones"
            description="Condiciones de uso de este sitio y del sistema de solicitud de visitas."
          />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <div className="prose-armony mx-auto max-w-2xl">
            <h2>Sobre este sitio</h2>
            <p>
              Este sitio pertenece a {business.legalName ?? business.name} y su finalidad es
              informar sobre nuestros servicios y permitir que solicites una visita.
            </p>

            <h2>La solicitud de visita no es una reserva confirmada</h2>
            <p>
              Al enviar el formulario estás indicando una{' '}
              <strong>fecha y un horario preferidos</strong>. La visita no queda confirmada
              automáticamente: revisamos la disponibilidad real y te contactamos para confirmarla o
              proponerte otra alternativa.
            </p>

            <h2>Información entregada por ti</h2>
            <p>
              Al solicitar una visita te comprometes a entregar información veraz. Las fotografías
              que adjuntes deben ser del espacio sobre el que consultas y no pueden incluir
              contenido de terceros sin su autorización.
            </p>

            <h2>Contenidos del sitio</h2>
            <p>
              Los textos, fotografías y demás contenidos de este sitio pertenecen a{' '}
              {business.legalName ?? business.name}, salvo indicación en contrario, y no pueden
              reproducirse sin autorización.
            </p>
            <p>
              La información sobre mantenimiento, vida útil y cuidado de las mallas tiene carácter
              orientativo. El estado real de una instalación sólo puede evaluarse mediante una
              revisión en terreno.
            </p>

            <h2>Valores y presupuestos</h2>
            <p>
              Este sitio no publica precios. El valor de cada trabajo depende del espacio, las
              medidas y el tipo de instalación, y se informa después de la visita, mediante un
              presupuesto entregado directamente al cliente.
            </p>

            {/* TODO_CONFIRM_WITH_ARMONY: garantía, plazos de ejecución, política
                de cancelación y costo de la visita. No publicar hasta que ARMONY
                confirme estas condiciones. */}
            {business.guarantee.confirmed && business.guarantee.details && (
              <>
                <h2>Garantía</h2>
                <p>{business.guarantee.details}</p>
              </>
            )}

            <h2>Cambios en estas condiciones</h2>
            <p>
              Podemos actualizar estas condiciones cuando sea necesario. La versión vigente es
              siempre la publicada en esta página.
            </p>

            <h2>Contacto</h2>
            <p>
              Para cualquier consulta sobre estas condiciones puedes escribirnos por WhatsApp o a
              través de nuestro Instagram{' '}
              <a href={business.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                @{business.contact.instagram}
              </a>
              .
            </p>

            <p className="mt-8 text-sm">
              Última actualización:{' '}
              {new Date().toLocaleDateString('es-CL', {
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

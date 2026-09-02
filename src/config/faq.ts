import { business, TODO_CONFIRM_WITH_ARMONY } from './business';

export type FaqItem = {
  question: string;
  /** `null` = pendiente de confirmar con ARMONY. Se muestra la respuesta neutra. */
  answer: string | null;
  /** Marca interna para el equipo. No se muestra al público. */
  internal?: typeof TODO_CONFIRM_WITH_ARMONY;
  /** Se incluye en el JSON-LD de FAQPage sólo si hay respuesta confirmada. */
  category?: 'cobertura' | 'servicio' | 'mantenimiento' | 'comercial';
};

/**
 * Respuesta usada mientras ARMONY no confirma el dato.
 * Preferimos derivar la consulta a WhatsApp antes que inventar una respuesta.
 */
export const PENDING_ANSWER =
  'Preferimos confirmarte esto directamente, porque depende de cada caso. Escríbenos por WhatsApp y te respondemos con la información exacta.';

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Dónde realizan instalaciones?',
    answer: `Trabajamos principalmente en la ${business.coverage.mainRegions[0]}. ${business.coverage.otherRegionsNote}`,
    category: 'cobertura',
  },
  {
    question: '¿Trabajan fuera de Santiago?',
    answer:
      'Podemos atender otras regiones según disponibilidad y según la zona. Cuéntanos dónde estás al agendar o por WhatsApp y te confirmamos si podemos llegar.',
    category: 'cobertura',
  },
  {
    question: '¿Pueden revisar mallas instaladas por otra empresa?',
    answer: null,
    internal: TODO_CONFIRM_WITH_ARMONY,
    category: 'servicio',
  },
  {
    question: '¿Cuándo conviene revisar una malla?',
    answer: `Como referencia, es razonable considerar una revisión cada ${business.maintenance.recommendedReviewPeriod}. También conviene revisarla si notas que perdió tensión, si ves desgaste o si cambió algo en el uso del espacio. ${business.maintenance.disclaimer}`,
    category: 'mantenimiento',
  },
  {
    question: '¿Cuánto dura una malla?',
    answer: business.maintenance.disclaimer,
    category: 'mantenimiento',
  },
  {
    question: '¿Qué puede deteriorar una malla?',
    answer: `Influyen varios factores: ${business.maintenance.factors
      .map((f) => f.toLowerCase())
      .join(
        ', ',
      )}. Por eso una revisión en terreno es la forma más confiable de conocer su estado actual.`,
    category: 'mantenimiento',
  },
  {
    question: '¿Puedo enviar fotos?',
    answer:
      'Sí. Al agendar puedes adjuntar hasta 3 fotos desde tu celular, con la cámara o desde la galería. Es opcional: puedes continuar sin ellas. También puedes enviárnoslas por WhatsApp.',
    category: 'servicio',
  },
  {
    question: '¿Trabajan con hogares que tienen mascotas?',
    answer:
      'Sí. Es uno de los motivos más frecuentes por los que nos contactan, junto con los hogares con niños. En la visita revisamos el espacio y vemos qué solución se acomoda mejor.',
    category: 'servicio',
  },
  {
    question: '¿Necesito medir antes?',
    answer:
      'No necesitas medir nada. En la visita revisamos el espacio en terreno y tomamos nosotros las medidas.',
    category: 'servicio',
  },
  {
    question: '¿Cuánto demora una instalación?',
    answer: null,
    internal: TODO_CONFIRM_WITH_ARMONY,
    category: 'servicio',
  },
  {
    question: '¿Cuánto cuesta?',
    answer:
      'El valor depende del espacio, de las medidas y del tipo de trabajo, por eso no manejamos un precio único. Después de la visita te entregamos un valor claro, sin sorpresas.',
    category: 'comercial',
  },
  {
    question: '¿La visita tiene costo?',
    answer: business.visitCost,
    internal: business.visitCost ? undefined : TODO_CONFIRM_WITH_ARMONY,
    category: 'comercial',
  },
  {
    question: '¿Qué garantía ofrecen?',
    answer: business.guarantee.confirmed ? business.guarantee.details : null,
    internal: business.guarantee.confirmed ? undefined : TODO_CONFIRM_WITH_ARMONY,
    category: 'comercial',
  },
  {
    question: '¿Las mallas afectan la vista?',
    answer:
      'Es una de las consultas más frecuentes. El impacto visual depende del tipo de malla y del espacio, así que lo revisamos contigo en la visita y te mostramos las alternativas antes de decidir.',
    category: 'servicio',
  },
];

/** Sólo las preguntas con respuesta confirmada entran al JSON-LD. */
export const FAQ_FOR_SCHEMA = FAQ_ITEMS.filter((item): item is FaqItem & { answer: string } =>
  Boolean(item.answer),
);

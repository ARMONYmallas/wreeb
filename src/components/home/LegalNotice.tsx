import { business } from '@/config/business';

/**
 * Sección de información normativa (por ejemplo, la llamada "Ley Valentín").
 *
 * DESHABILITADA A PROPÓSITO.
 *
 * No se publica ninguna afirmación sobre legislación chilena sin verificar
 * previamente su estado vigente en fuentes oficiales:
 *   · Biblioteca del Congreso Nacional (bcn.cl)
 *   · Cámara de Diputadas y Diputados (camara.cl)
 *   · Senado (senado.cl)
 *   · MINVU (minvu.gob.cl)
 *   · Diario Oficial (diariooficial.interior.gob.cl)
 *
 * Para publicarla: verificar el estado actual, completar `legalNotice` en
 * `src/config/business.ts` (título, cuerpo y fuentes) y poner `enabled: true`.
 * Mientras `enabled` sea false, este componente no renderiza nada.
 */
export function LegalNotice() {
  const notice = business.legalNotice;
  if (!notice.enabled || !notice.title || !notice.body) return null;

  return (
    <section className="section bg-surface">
      <div className="container-page">
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-white p-6 md:p-10">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">{notice.title}</h2>
          <p className="mt-4 leading-relaxed text-muted">{notice.body}</p>

          {notice.sources.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="text-xs font-semibold tracking-wide text-ink uppercase">Fuentes</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {notice.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-700 underline underline-offset-2"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import NewsletterForm from "./NewsletterForm";
import Sigil from "./Sigil";

/**
 * Mid-page email capture — the second net for visitors not ready to create an
 * account or buy. Same NewsletterForm as the footer, framed as a weekly-lesson
 * pitch instead of a generic list, with the placement reported to analytics.
 */
export default function NewsletterCta({ source }: { source: string }) {
  return (
    <div className="panel relative overflow-hidden p-7 sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(80% 120% at 10% -10%, rgba(201,169,97,0.10), transparent 60%)" }}
      />
      <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Sigil motif="candle" className="w-7 shrink-0 text-gold-400" weight={1.6} />
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] leading-tight text-bone-50">
              Un arma mental por semana
            </h2>
          </div>
          <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ash-400">
            Una lección breve de guerreros, estoicos y estrategas — directa a tu
            correo. Gratis, sin ruido, de baja cuando quieras.
          </p>
        </div>
        <NewsletterForm
          source={source}
          eyebrow="El boletín del archivo"
          blurb="Además: cada libro que liberamos gratis llega primero a la lista."
        />
      </div>
    </div>
  );
}

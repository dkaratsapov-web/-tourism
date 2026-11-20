import { Placeholder } from "@/components/ui/Placeholder";
import { Stamp } from "@/components/ui/Stamp";
import { Lines } from "@/components/ui/Type";

/** Разворот-интервью: кто собирает поездки. Тексты — черновик до интервью с Натальей. */
export function Natalia() {
  return (
    <section id="natalia" aria-labelledby="natalia-title" className="relative bg-[var(--paper)] px-[var(--gutter)] py-20 md:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-12 md:gap-8">
        <div className="relative md:col-span-5">
          <Placeholder
            kind="need"
            tone="portrait"
            label="Портрет Натальи — нужна съёмка, вертикаль 3:4"
            className="aspect-[4/5] w-full md:aspect-[3/4]"
          />
          <Stamp kind="tag" rotate={-10} className="absolute -right-3 -top-10 w-20 md:-right-12 md:w-28" />
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pt-10">
          <p className="label text-[var(--aegean)]">Рубрика · Кто собирает поездки</p>
          <Lines
            id="natalia-title"
            className="display mt-4 text-[clamp(2.8rem,6.2vw,6.4rem)]"
            lines={[
              "Наталья —",
              <>
                <em>лицо</em> Fashion
              </>,
              "Tours",
            ]}
          />
          <div data-reveal="fade" className="mt-8 max-w-[34rem] space-y-4 text-[17px] leading-[1.6] text-[var(--ink-soft)]">
            <p>
              Наталья жила в Турции, несколько раз была в Каппадокии и объясняет разницу между отелями, питанием и сервисом. Мы подбираем поездку под ваши пожелания и остаёмся на связи во время отдыха.
            </p>
            <p className="label text-[var(--ink-soft)]">Текст черновой — записать интервью и согласовать с Натальей</p>
          </div>
          <figure data-reveal="fade" className="mt-10 border-l-0 bg-[var(--tuff)]/45 px-6 py-7 md:px-9 md:py-9">
            <blockquote className="display text-[clamp(1.9rem,3vw,2.8rem)] italic leading-[1.1] [--wght:420]">
              «Цитата Натальи — записать с её слов»
            </blockquote>
            <figcaption className="label mt-4 text-[var(--ink)]">Плейсхолдер цитаты</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

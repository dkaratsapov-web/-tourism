import { Placeholder, type Tone } from "@/components/ui/Placeholder";
import { Stamp } from "@/components/ui/Stamp";
import { Lines } from "@/components/ui/Type";
import { Texture } from "@/components/ui/Media";

const POSTERS: Tone[] = ["hotel-1", "hotel-2", "hotel-3", "hotel-4"];

/** Видеообзоры отелей — только те, где Наталья реально снимала. Пока подписанные места под постеры. */
export function HotelReviews() {
  return (
    <section id="obzory" aria-labelledby="obzory-title" className="relative isolate overflow-hidden bg-[var(--white)] px-[var(--gutter)] py-20 md:py-32">
      {/* Белый разворот на льне: фактура едва заметна, контраст текста не меняется. */}
      <Texture id="tex-linen" className="opacity-70 mix-blend-multiply" />
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-[var(--aegean)]">Видеообзоры</p>
            <Lines
              id="obzory-title"
              className="display mt-4 text-[clamp(2.6rem,5.6vw,5.6rem)]"
              lines={[
                <>
                  Отели <em>глазами</em>
                </>,
                "Натальи",
              ]}
            />
          </div>
          <p className="max-w-[24rem] text-[16px] leading-[1.55] text-[var(--ink-soft)]">
            Короткие видео из отелей, где Наталья была сама. Звук и видео включаются только по нажатию.
          </p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-4 md:gap-6">
          {POSTERS.map((t, i) => (
            <li key={t} className={i % 2 ? "md:translate-y-14" : ""}>
              <Placeholder
                tone={t}
                reveal={i % 2 ? "photo-center" : "photo"}
                label={`Видеообзор Натальи ${i + 1}: отель и место — уточнить`}
                compact
                className="aspect-[9/16] w-full"
              >
                <span aria-hidden className="absolute left-1/2 top-[42%] z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--paper)]/85 md:h-16 md:w-16">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="#13294b">
                    <path d="M5 3.2v9.6L13 8z" />
                  </svg>
                </span>
              </Placeholder>
            </li>
          ))}
        </ul>
        <p className="label mt-8 text-[var(--ink-soft)] md:mt-24">Количество и формат обзоров уточнить · видео не играет само</p>
      </div>
    </section>
  );
}

/** «Письма в редакцию» — место под реальные отзывы. Ни одного выдуманного отзыва, имени или оценки. */
export function Letters() {
  return (
    <section id="pisma" aria-labelledby="pisma-title" className="relative overflow-hidden bg-[var(--paper)] px-[var(--gutter)] py-20 md:py-32">
      <div className="mx-auto max-w-[1320px]">
        <p className="label text-[var(--aegean)]">Опыт путешественников</p>
        <Lines
          id="pisma-title"
          className="display mt-4 text-[clamp(2.6rem,5.6vw,5.6rem)]"
          lines={[
            <>
              Отзывы <em className="marker">о поездках</em>
            </>,
          ]}
        />
        <ul className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          {[-2, 1.5, -1].map((r, i) => (
            <li key={i} data-reveal="fade" style={{ transitionDelay: `${i * 80}ms` }}>
              <article
                className="relative flex min-h-[280px] flex-col bg-[var(--white)] p-6 shadow-[0_24px_40px_-30px_rgb(19_41_75/0.45)] md:min-h-[340px] md:p-8 md:[rotate:var(--rot)]"
                style={{ "--rot": `${r}deg` } as React.CSSProperties}
              >
                <Stamp kind="airmail" rotate={i % 2 ? 6 : -4} delay={i * 120} className="absolute right-5 top-5 w-14 md:w-16" id={`st-letter-${i}`} />
                <p className="label text-[var(--brick)]">Отзыв {i + 1}</p>
                <p className="display mt-6 max-w-[14ch] text-[30px] italic leading-[1.05] md:text-[34px]">Реальный отзыв — уточнить</p>
                <div aria-hidden className="mt-6 space-y-3">
                  {[0, 1, 2].map((l) => (
                    <div key={l} className="h-px bg-[var(--tuff)]" />
                  ))}
                </div>
                <p className="mt-auto pt-6 text-[14px] leading-[1.5] text-[var(--ink-soft)]">
                  Имя и поездка — с согласия клиента. Текст или скриншот переписки.
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

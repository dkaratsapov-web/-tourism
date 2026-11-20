"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Placeholder, type Tone } from "@/components/ui/Placeholder";
import { SplitFlap } from "@/components/ui/SplitFlap";
import { Stamp } from "@/components/ui/Stamp";
import { Lines } from "@/components/ui/Type";
import { DESTINATIONS, LEAD_ID } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

/** Событие для формы: какое направление выбрали на табло. */
export const DEST_EVENT = "ft:destination";

/**
 * Табло вылетов: направления Турции. Названия перещёлкиваются split-flap один раз при входе.
 * Каждая строка — ссылка к заявке, направление сразу отмечается в форме.
 */
export function DepartureBoard() {
  return (
    <section id="formaty" aria-labelledby="board-title" className="relative bg-[var(--ink)] px-[var(--gutter)] py-20 text-[var(--paper)] md:py-28">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-[var(--sky)]">Табло · вылеты в Турцию</p>
            <Lines
              id="board-title"
              className="display mt-4 text-[clamp(2.6rem,6.4vw,6.6rem)]"
              lines={[
                "Что мы собираем",
                <>
                  <em>в Турции</em>
                </>,
              ]}
            />
          </div>
          <p className="max-w-[24rem] text-[16px] leading-[1.5] text-[var(--paper)]/75">
            Отели на побережье и маршруты по стране. Выберите направление — оно сразу отметится в заявке.
          </p>
        </div>

        <div className="mt-12 md:mt-16">
          <div aria-hidden className="label hidden grid-cols-[110px_1fr_1fr_170px] gap-6 border-b border-[var(--paper)]/20 pb-3 text-[var(--paper)]/60 md:grid">
            <span>Код</span>
            <span>Направление</span>
            <span>Что собираем</span>
            <span className="text-right">Заявка</span>
          </div>
          <ul aria-label="Направления">
          {DESTINATIONS.map((d) => (
            <li key={d.code}>
            <a
              href={`#${LEAD_ID}`}
              onClick={() => window.dispatchEvent(new CustomEvent(DEST_EVENT, { detail: d.chip }))}
              className="group grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-2 border-b border-[var(--paper)]/20 py-5 transition-colors duration-200 hover:bg-[var(--paper)]/[0.04] md:grid-cols-[110px_1fr_1fr_170px] md:gap-6 md:py-6"
            >
              <span className="label text-[18px] tracking-[0.18em] text-[var(--sky)] md:text-[22px]">
                {d.code}
              </span>
              <span className="text-[19px] md:text-[30px]">
                <SplitFlap text={d.city} length={10} />
              </span>
              <span className="col-start-2 text-[15px] text-[var(--paper)]/75 md:col-start-auto md:text-[17px]">
                {d.text}
              </span>
              <span className="label col-start-2 flex items-center gap-2 text-[var(--paper)] md:col-start-auto md:justify-end">
                <span className="link-draw">Обсудить</span>
                <svg aria-hidden viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </span>
            </a>
            </li>
          ))}
          </ul>
        </div>
        <p className="label mt-6 text-[var(--paper)]/55">Яхты — после подтверждения продукта · состав направлений уточнить</p>
      </div>
    </section>
  );
}

const FORMATS: { n: string; title: string; text: string; tone: Tone; label: string }[] = [
  { n: "01", title: "Отель у моря", text: "Сравниваем отели по сервису, питанию, пляжу и атмосфере, а не только по звёздам.", tone: "sea", label: "отель на Эгейском побережье, утро" },
  { n: "02", title: "Отдых с детьми", text: "Подбираем отель под возраст ребёнка: питание, пляж, анимация, дорога.", tone: "kids", label: "пологий пляж и детская панама на шезлонге" },
  { n: "03", title: "Поездка вдвоём", text: "Атмосфера, локация и формат проживания под настроение пары.", tone: "couple", label: "вечерняя терраса на двоих, Бодрум" },
  { n: "04", title: "Маршрут по стране", text: "Каппадокия, Стамбул и море — отели, перелёты и переезды в одной поездке.", tone: "cappadocia", label: "Каппадокия на рассвете, воздушные шары" },
];

/**
 * Форматы «под кого собираем». На ПК — горизонтальная лента, которая едет при вертикальном скролле.
 * Закрепление сделано через CSS sticky, а не GSAP pin: так нет сдвигов вёрстки (CLS).
 */
export function Formats() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !root.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const section = root.current!;
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth;
      // Высота секции = путь ленты + один экран, чтобы sticky-кадр успел проехать.
      const setHeight = () => section.style.setProperty("--formats-h", `${distance() + window.innerHeight}px`);
      setHeight();
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: setHeight,
        },
      });
      return () => {
        tween.kill();
        section.style.removeProperty("--formats-h");
      };
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <section ref={root} aria-labelledby="formats-title" className="relative bg-[var(--paper)] min-[900px]:h-[var(--formats-h,auto)]">
      <div className="formats-frame overflow-hidden py-20 min-[900px]:sticky min-[900px]:top-0 min-[900px]:flex min-[900px]:h-svh min-[900px]:flex-col min-[900px]:justify-center min-[900px]:pb-10 min-[900px]:pt-[calc(var(--header-h)+28px)]">
        <div className="relative px-[var(--gutter)]">
          <p className="label text-[var(--aegean)]">Форматы</p>
          <Lines
            id="formats-title"
            className="display mt-3 text-[clamp(2.5rem,5.4vw,5.4rem)]"
            lines={[
              <>
                Под кого <em className="marker">собираем</em>
              </>,
            ]}
          />
          <Stamp kind="nav" rotate={-8} className="absolute right-[var(--gutter)] top-0 w-28 md:w-40" />
        </div>
        <div ref={track} className="formats-track mt-10 flex flex-col gap-10 px-[var(--gutter)] min-[900px]:mt-12 min-[900px]:w-max min-[900px]:flex-row min-[900px]:gap-8">
          {FORMATS.map((f, i) => (
            <article key={f.n} className={`group flex flex-col min-[900px]:w-[min(36vw,560px)] ${i % 2 ? "min-[900px]:pt-16" : ""}`}>
              <Placeholder tone={f.tone} label={f.label} reveal={i % 2 ? "photo-center" : "photo"} className="aspect-[4/3] w-full min-[900px]:aspect-[5/4] min-[900px]:max-h-[44svh]" />
              <div className="mt-5 flex items-baseline gap-4">
                <span className="display text-[44px] italic text-[var(--brick)] md:text-[56px]">{f.n}</span>
                <h3 className="display text-[34px] md:text-[42px]">{f.title}</h3>
              </div>
              <p className="mt-2 max-w-[30rem] text-[16px] leading-[1.55] text-[var(--ink-soft)]">{f.text}</p>
            </article>
          ))}
          <div className="flex min-[900px]:w-[24vw] min-[900px]:items-center" aria-hidden>
            <Stamp kind="ist" tone="ink" rotate={10} className="w-40 md:w-56" />
          </div>
        </div>
      </div>
    </section>
  );
}

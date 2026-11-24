"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Photo, Texture } from "@/components/ui/Media";
import { SplitFlap } from "@/components/ui/SplitFlap";
import { Stamp } from "@/components/ui/Stamp";
import { Lines } from "@/components/ui/Type";
import { DESTINATIONS, LEAD_DIALOG_ID, openLeadDialog } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

/**
 * Табло вылетов: направления Турции. Названия перещёлкиваются split-flap один раз при входе.
 * Каждая строка открывает форму с выбранным направлением.
 */
export function DepartureBoard() {
  return (
    <section id="formaty" aria-labelledby="board-title" className="relative isolate overflow-hidden bg-[var(--ink)] px-[var(--gutter)] py-20 text-[var(--paper)] md:py-28">
      {/* Фон табло — вода сверху, приглушённая до тона чернил и уходящая вниз, чтобы не спорить со строками. */}
      <Texture id="tex-water" mobileId="tex-water-m" className="opacity-[0.22] mix-blend-luminosity [mask-image:linear-gradient(180deg,#000_0%,rgb(0_0_0/0.55)_45%,transparent_100%)]" />
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
            Отели на побережье и маршруты по стране. Выберите направление, чтобы обсудить поездку.
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
            <button
              type="button"
              aria-haspopup="dialog"
              aria-controls={LEAD_DIALOG_ID}
              aria-label={`Обсудить поездку: ${d.city}`}
              onClick={() => openLeadDialog(d)}
              className="group grid w-full cursor-pointer grid-cols-[64px_1fr] items-center gap-x-4 gap-y-2 border-b border-[var(--paper)]/20 py-5 text-left transition-colors duration-200 hover:bg-[var(--paper)]/[0.04] md:grid-cols-[110px_1fr_1fr_170px] md:gap-6 md:py-6"
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
            </button>
            </li>
          ))}
          </ul>
        </div>
        <p className="label mt-6 text-[var(--paper)]/55">Яхты — после подтверждения продукта · состав направлений уточнить</p>
      </div>
    </section>
  );
}

type Format = { n: string; title: string; text: string; id: string; alt: string; pos?: string; note: string; detail: string };

/**
 * Иллюстрации форматов передают атмосферу поездки.
 */
const FORMATS: Format[] = [
  // Видео позже: петля format-coast-loop.mp4 (ПК, при наведении или фокусе) — <video> внутри [data-photo-in], постер — этот кадр.
  { n: "01", title: "Отель у моря", text: "Сравниваем отели по сервису, питанию, пляжу и атмосфере, а не только по звёздам.", id: "format-coast", alt: "Атмосферный кадр: побережье Бодрума", pos: "30% 50%", note: "Сколько шагов до моря?", detail: "Посмотрим, как устроен спуск к пляжу, какой там берег и есть ли рядом места для прогулок." },
  { n: "02", title: "Отдых с детьми", text: "Подбираем отель под возраст ребёнка: питание, пляж, анимация, дорога.", id: "format-family", alt: "Атмосферный кадр: дети строят замок из песка на берегу моря", pos: "48% 54%", note: "У каждого возраста свой отдых", detail: "Для малышей важны тень и пологий вход в море. Для детей постарше посмотрим, чем заняться в отеле и рядом." },
  { n: "03", title: "Поездка вдвоём", text: "Атмосфера, локация и формат проживания под настроение пары.", id: "format-istanbul", alt: "Атмосферный кадр: Босфор утром", pos: "70% 50%", note: "Город или пауза у моря?", detail: "Можно начать со Стамбула и закончить несколькими днями на побережье. Подберём удобную стыковку." },
  // Видео позже: format-cappadocia.mp4 (ПК, один раз при входе карточки в кадр, остаётся на последнем кадре) — так же, постер — этот кадр.
  { n: "04", title: "Маршрут по стране", text: "Каппадокия, Стамбул и море — отели, перелёты и переезды в одной поездке.", id: "format-cappadocia", alt: "Атмосферный кадр: воздушные шары над Каппадокией", pos: "50% 40%", note: "Сколько ночей на каждую остановку?", detail: "Расставим остановки и переезды так, чтобы осталось время погулять и отдохнуть между ними." },
];

const CARD_SIZES = "(min-width: 900px) min(36vw, 560px), calc(100vw - 2 * var(--gutter))";

/**
 * Форматы «под кого собираем». На ПК — горизонтальная лента, которая едет при вертикальном скролле.
 * Закрепление сделано через CSS sticky, а не GSAP pin: так нет сдвигов вёрстки (CLS).
 */
export function Formats() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trackScroll = useRef<ScrollTrigger | null>(null);
  const [openFormat, setOpenFormat] = useState<string | null>(null);

  useEffect(() => {
    if (!openFormat) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFormat(null);
    };
    const outside = (event: PointerEvent) => {
      if (!(event.target as Element).closest(`[data-format="${openFormat}"]`)) setOpenFormat(null);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
    };
  }, [openFormat]);

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
      trackScroll.current = tween.scrollTrigger ?? null;
      return () => {
        trackScroll.current = null;
        tween.kill();
        section.style.removeProperty("--formats-h");
      };
    });
    return () => mm.revert();
  }, [reduced]);

  const onFormatFocus = (event: FocusEvent<HTMLButtonElement>, format: string) => {
    const button = event.currentTarget;
    if (!button.matches(":focus-visible")) return;
    setOpenFormat(format);
    const card = button.closest<HTMLElement>("article");
    const scroll = trackScroll.current;
    if (!card || !scroll) return;
    const bounds = card.getBoundingClientRect();
    if (bounds.left < 0 || bounds.right > window.innerWidth) {
      const x = card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2;
      scroll.scroll(gsap.utils.clamp(scroll.start, scroll.end, scroll.start + x));
    }
  };

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
        <div ref={track} className="formats-track relative mt-10 flex flex-col gap-10 px-[var(--gutter)] min-[900px]:mt-12 min-[900px]:w-max min-[900px]:flex-row min-[900px]:gap-8">
          {FORMATS.map((f, i) => (
            <article key={f.n} data-format={f.n} className={`group flex flex-col min-[900px]:w-[min(36vw,560px)] ${i % 2 ? "min-[900px]:pt-16" : ""}`}
              onPointerEnter={(event) => { if (event.pointerType === "mouse") setOpenFormat(f.n); }}
              onPointerLeave={(event) => { if (event.pointerType === "mouse" && !event.currentTarget.querySelector(":focus-visible")) setOpenFormat((open) => open === f.n ? null : open); }}
            >
              <div className="relative">
                <Photo id={f.id} alt={f.alt} sizes={CARD_SIZES} pos={f.pos} reveal={i % 2 ? "photo-center" : "photo"} className="aspect-[4/3] w-full min-[900px]:aspect-[5/4] min-[900px]:max-h-[44svh]" />
                {f.n === "04" ? (
                  // Врезка «дорога»: маршрут — это ещё и переезды между местами.
                  <Photo
                    id="format-route"
                    alt="Атмосферный кадр: дорога через оливковые рощи у моря"
                    sizes="(min-width: 900px) 15vw, 40vw"
                    pos="70% 60%"
                    reveal="photo-center"
                    className="absolute! -bottom-5 -right-2 aspect-square w-[38%] border-[5px] border-[var(--white)] shadow-[0_18px_30px_-18px_rgb(19_41_75/0.55)] md:border-[6px]"
                  />
                ) : null}
                <button
                  type="button"
                  aria-label={`Подробнее: ${f.title}`}
                  aria-expanded={openFormat === f.n}
                  aria-controls={`format-note-${f.n}`}
                  onFocus={(event) => onFormatFocus(event, f.n)}
                  onBlur={() => setOpenFormat((open) => open === f.n ? null : open)}
                  onClick={() => setOpenFormat((open) => open === f.n ? null : f.n)}
                  className="absolute right-3 top-3 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-[var(--paper)] text-[var(--ink)] shadow-sm transition-colors hover:bg-[var(--white)] aria-expanded:bg-[var(--ink)] aria-expanded:text-[var(--paper)]"
                >
                  <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9h12" />
                    {openFormat === f.n ? null : <path d="M9 3v12" />}
                  </svg>
                </button>
                <div
                  id={`format-note-${f.n}`}
                  aria-hidden={openFormat !== f.n}
                  className={`absolute bottom-3 left-3 right-3 z-10 origin-bottom-left bg-[var(--ink)] px-4 py-3 text-[var(--paper)] shadow-[0_14px_28px_-10px_rgb(19_41_75/0.65)] transition-[opacity,transform,visibility] duration-200 ease-[var(--ease-expo)] sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[min(22rem,calc(100%-2.5rem))] sm:px-5 sm:py-4 motion-reduce:transform-none motion-reduce:transition-none ${openFormat === f.n ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"}`}
                >
                  <p className="label text-[var(--sky)]">Что учтём</p>
                  <p className="display mt-2 border-t border-dashed border-[var(--sky)]/45 pt-2 text-[22px] sm:text-[27px]">{f.note}</p>
                  <p className="mt-2 text-[14px] leading-snug text-[var(--paper)]/90 sm:text-[15px]">{f.detail}</p>
                </div>
              </div>
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

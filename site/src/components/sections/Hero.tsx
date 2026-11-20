"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CtaButton } from "@/components/ui/CtaButton";
import { Placeholder } from "@/components/ui/Placeholder";
import { Stamp } from "@/components/ui/Stamp";
import { LEAD_ID } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["FASHION", "TOURS"];
const NBSP = " ";

const CONTENTS = [
  { n: "01", t: "Сборы", s: "Сначала — разговор" },
  { n: "02", t: "Полёт", s: "Детали поездки уже в плане" },
  { n: "03", t: "Прилёт", s: "Встреча и дорога до отеля" },
  { n: "04", t: "Терраса", s: "Здесь начинается отпуск" },
];

const RUBRICS = [
  { id: "formaty", t: "Форматы Турции" },
  { id: "natalia", t: "Наталья" },
  { id: "kak-rabotaem", t: "Как мы работаем" },
  { id: "pisma", t: "Письма читателей" },
  { id: LEAD_ID, t: "Заявка" },
];

/**
 * Мастхед «FASHION TOURS». Две копии одного слова:
 * A — по буквам, въезжает при загрузке (CSS); B — цельный текст, у него при скролле сжимается ось wdth.
 * Ось меняем только у B: левый край строки неподвижен, поэтому сдвигов вёрстки (CLS) нет.
 */
function Masthead() {
  let i = 0;
  return (
    <div aria-hidden className="masthead mt-2 text-[20.4vw] md:mt-3 md:text-[11.6vw]" data-masthead>
      <span className="mh-a">
        {WORDS.map((w, wi) => (
          <span key={w} className="mh-row md:inline-block">
            {[...w].map((c) => (
              <span key={i} className="mh-l" style={{ "--i": i++ } as React.CSSProperties}>
                {c}
              </span>
            ))}
            {wi === 0 ? <span className="mh-l hidden md:inline-block" style={{ "--i": i++ } as React.CSSProperties}>{NBSP}</span> : null}
          </span>
        ))}
      </span>
      {/* ПК: одна строка, один текстовый узел. */}
      <span className="mh-b hidden md:block">
        <span className="mh-row">{`FASHION${NBSP}TOURS`}</span>
      </span>
      {/* Телефон: две строки, у каждой свой неподвижный левый край. */}
      <span className="mh-b md:hidden">
        <span className="mh-row">FASHION</span>
        <span className="mh-row">TOURS</span>
      </span>
    </div>
  );
}

/**
 * Первый экран — обложка свежего номера. Работает без JavaScript: вход — на CSS, кнопка — обычная ссылка.
 * С JavaScript при первом движении скролла обложка складывается в левую полосу разворота,
 * а справа выезжает страница «В номере» (на телефоне — поднимается снизу).
 */
export function Hero() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = root.current;
    if (reduced || !hero) return;
    const mm = gsap.matchMedia();

    const build = (desktop: boolean) => {
      const cover = hero.querySelector<HTMLElement>("[data-cover]")!;
      const page = hero.querySelector<HTMLElement>("[data-spread]")!;
      const mast = hero.querySelector<HTMLElement>("[data-masthead]")!;
      const frame = hero.querySelector<HTMLElement>("[data-cover-frame]")!;
      const shade = hero.querySelector<HTMLElement>("[data-cover-shade]")!;
      gsap.set(page, desktop ? { x: 0, xPercent: 101 } : { y: 0, yPercent: 101 });
      gsap.set(cover, { transformOrigin: desktop ? "0% 50%" : "50% 0%" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: desktop ? 0.8 : 0.5,
          // Как только скролл тронулся — показываем копию мастхеда, у которой меняется ширина.
          onUpdate: (self) => hero.toggleAttribute("data-fold", self.progress > 0.002),
        },
      });
      // Обложка «складывается»: ось wdth 100 → 62,5, мастхед уезжает вверх.
      tl.to(hero, { "--wdth": 62.5, duration: 0.55 }, 0).to(mast, { yPercent: -14, duration: 0.55 }, 0);
      if (desktop) {
        tl.to(cover, { scale: 0.38, x: () => window.innerWidth * 0.03, duration: 0.8, ease: "power4.inOut" }, 0.05)
          .to(frame, { opacity: 1, duration: 0.3 }, 0.45)
          .to(page, { xPercent: 0, duration: 0.8, ease: "power4.inOut" }, 0.15);
      } else {
        tl.to(cover, { scale: 0.9, duration: 0.8, ease: "power4.inOut" }, 0)
          .to(shade, { opacity: 0.55, duration: 0.8 }, 0)
          .to(page, { yPercent: 0, duration: 0.8, ease: "power4.inOut" }, 0.1);
      }
      tl.to({}, { duration: 0.2 });
      return () => hero.removeAttribute("data-fold");
    };

    mm.add("(min-width: 900px)", () => build(true));
    mm.add("(max-width: 899px)", () => build(false));
    return () => mm.revert();
  }, [reduced]);

  return (
    <section ref={root} className="hero relative" aria-labelledby="hero-title">
      <div className="hero-stage bg-[color-mix(in_oklab,var(--tuff)_38%,var(--paper))]">
        <div data-cover className="hero-cover relative flex min-h-svh flex-col bg-[var(--paper)] px-[var(--gutter)] pb-6 pt-[calc(var(--header-h)+12px)] md:pb-9">
          <div data-cover-frame aria-hidden className="pointer-events-none absolute inset-0 z-30 border-[5px] border-[var(--ink)] opacity-0" />
          <div data-cover-shade aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-[var(--ink)] opacity-0" />

          <div className="rise flex items-center justify-between" style={{ "--d": "60ms" } as React.CSSProperties}>
            <p className="label flex items-center gap-2.5 text-[var(--aegean)]">
              <Stamp kind="airmail" reveal="none" rotate={-6} className="h-7 w-auto md:h-8" />
              Выпуск: Турция
            </p>
            <p className="label hidden text-[var(--ink-soft)] md:block">Онлайн-турагентство · отели и маршруты</p>
          </div>

          <Masthead />

          {/* Портрет: арка на ПК справа, верх заходит на мастхед; на телефоне — под мастхедом справа. */}
          <Placeholder
            kind="need"
            tone="portrait"
            reveal="none"
            label="Портрет Натальи — нужна съёмка, вертикаль 4:5, светлый фон"
            className="arch-in relative z-10 -mt-[5vw] ml-auto aspect-[4/5] w-[52%] rounded-t-full md:absolute md:bottom-9 md:right-[var(--gutter)] md:top-[calc(var(--header-h)+12px+30px+7.5vw)] md:mt-0 md:w-auto"
          />
          <Stamp
            kind="turkiye"
            reveal="load"
            rotate={-14}
            delay={1000}
            className="absolute left-[var(--gutter)] top-[calc(var(--header-h)+66vw)] z-20 w-[24vw] md:left-auto md:right-[calc(var(--gutter)+34vw)] md:top-[44%] md:w-[10.5vw]"
          />
          <Stamp
            kind="ayt"
            tone="ink"
            reveal="load"
            rotate={8}
            delay={1200}
            className="absolute bottom-[23%] right-[calc(var(--gutter)-4px)] z-20 hidden w-[11vw] md:block"
          />

          <div className="relative z-20 mt-6 max-w-[40rem] md:mt-auto md:w-[47%]">
            <h1 id="hero-title" className="display rise text-[clamp(2.15rem,5.4vw,5.3rem)] [--wght:520]" style={{ "--d": "520ms" } as React.CSSProperties}>
              Турция, собранная под <em className="marker">вашу семью</em>
            </h1>
            <p className="rise mt-4 max-w-[30rem] text-[16px] leading-[1.5] text-[var(--ink-soft)] md:mt-6 md:text-[18px]" style={{ "--d": "640ms" } as React.CSSProperties}>
              Отели на побережье и маршруты по стране — Каппадокия, Эгейское побережье, Бодрум, Стамбул.
            </p>
            <div className="rise mt-5 md:mt-8" style={{ "--d": "740ms" } as React.CSSProperties}>
              <CtaButton id="hero-cta" size="lg" className="w-full md:w-auto" />
            </div>
            <p className="label mt-5 hidden text-[var(--ink-soft)] md:block">Наталья, Fashion Tours · подпись уточнить</p>
          </div>
        </div>

        {/* Правая страница разворота — содержание номера. Без JavaScript идёт обычным блоком под обложкой. */}
        <aside data-spread className="spread-page z-40 flex flex-col bg-[var(--white)] px-[var(--gutter)] pb-10 pt-[calc(var(--header-h)+28px)] md:pl-[4.5vw]" aria-labelledby="contents-title">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="label text-[var(--aegean)]">В этом номере</p>
              <h2 id="contents-title" className="display mt-3 text-[clamp(2.4rem,4.6vw,4.6rem)]">
                Турция <em>в четырёх сценах</em>
              </h2>
            </div>
            <Stamp kind="turkiye" tone="ink" rotate={12} className="w-24 shrink-0 md:w-32" id="st-contents" />
          </div>
          <ol className="mt-6 border-t border-[var(--ink)]/15 md:mt-10">
            {CONTENTS.map((c) => (
              <li key={c.n} className="flex items-baseline gap-4 border-b border-[var(--ink)]/15 py-3 md:gap-6 md:py-4">
                <span className="label w-6 text-[var(--brick)]">{c.n}</span>
                <span className="display text-[clamp(2rem,3vw,3rem)]">{c.t}</span>
                <span className="ml-auto text-right text-[14px] text-[var(--ink-soft)] md:text-[15px]">{c.s}</span>
              </li>
            ))}
          </ol>
          <p className="label mt-6 text-[var(--ink-soft)] md:mt-auto">Рубрики</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
            {RUBRICS.map((r) => (
              <li key={r.id}>
                <a href={`#${r.id}`} className="link-draw flex h-11 items-center text-[16px] font-medium">
                  {r.t}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

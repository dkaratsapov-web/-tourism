"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { QuickLeadForm } from "@/components/ui/QuickLeadForm";
import { Placeholder } from "@/components/ui/Placeholder";
import { Picture } from "@/components/ui/Media";
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

/** Мастхед появляется по буквам при загрузке и дальше движется вместе с обложкой. */
function Masthead() {
  let i = 0;
  return (
    <div aria-hidden className="masthead mt-2 text-[20.4vw] md:mt-3 md:text-[11.6vw]">
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
    </div>
  );
}

/** На высоких экранах обложка складывается в разворот при прокрутке. */
export function Hero() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = root.current;
    if (reduced || !hero) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px) and (min-height: 840px)", () => {
      const cover = hero.querySelector<HTMLElement>("[data-cover]")!;
      const page = hero.querySelector<HTMLElement>("[data-spread]")!;
      const frame = hero.querySelector<HTMLElement>("[data-cover-frame]")!;
      gsap.set(page, { x: 0, xPercent: 101 });
      gsap.set(cover, { transformOrigin: "0% 50%" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      tl.to(cover, { scale: 0.38, x: () => window.innerWidth * 0.03, duration: 0.8, ease: "power4.inOut" }, 0.05)
        .to(frame, { opacity: 1, duration: 0.3 }, 0.45)
        .to(page, { xPercent: 0, duration: 0.8, ease: "power4.inOut" }, 0.15)
        .to({}, { duration: 0.2 });
    });

    return () => mm.revert();
  }, [reduced]);

  return (
    <section ref={root} className="hero relative" aria-labelledby="hero-title">
      <div className="hero-stage bg-[color-mix(in_oklab,var(--tuff)_38%,var(--paper))]">
        <div data-cover className="hero-cover relative isolate flex min-h-svh flex-col bg-[var(--paper)] px-[var(--gutter)] pb-6 pt-[calc(var(--header-h)+12px)] md:pb-9">
          <div aria-hidden className="hero-cover-art pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <Picture
              id="hero-aegean"
              alt=""
              decorative
              eager
              sizes="(min-width: 768px) 88vw, 100vw"
              pos="70% 58%"
              posMobile="76% 52%"
              className="absolute inset-0 md:left-[12%]"
            />
          </div>
          <div data-cover-frame aria-hidden className="pointer-events-none absolute inset-0 z-30 border-[5px] border-[var(--ink)] opacity-0" />

          <div className="rise flex items-center justify-between" style={{ "--d": "60ms" } as React.CSSProperties}>
            <p className="label flex items-center gap-2.5 text-[var(--aegean)]">
              <Stamp kind="airmail" reveal="none" rotate={-6} className="h-7 w-auto md:h-8" />
              Выпуск: Турция
            </p>
            <p className="label hidden text-[var(--ink-soft)] md:block">Онлайн-турагентство · отели и маршруты</p>
          </div>

          <Masthead />

          <div className="relative z-20 mt-6 max-w-[48rem] md:pt-6 md:mt-auto md:w-[51%]">
            <h1 id="hero-title" className="display rise text-[clamp(2.15rem,4.8vw,4.85rem)] [--wght:520]" style={{ "--d": "520ms" } as React.CSSProperties}>
              Ваш отдых <em className="marker">в Турции</em>
            </h1>
            <p className="rise mt-4 max-w-[30rem] text-[16px] leading-[1.5] text-[var(--ink-soft)] md:mt-4 md:text-[18px]" style={{ "--d": "640ms" } as React.CSSProperties}>
              Отели на побережье и маршруты по стране — Каппадокия, Эгейское побережье, Бодрум, Стамбул.
            </p>
            <div id="hero-cta" className="mt-5">
              <QuickLeadForm source="hero" />
            </div>
          </div>

          {/* Портрет: арка на ПК справа, верх заходит на мастхед; на телефоне — под формой справа. */}
          <Placeholder
            tone="portrait"
            reveal="none"
            label="Портрет Натальи — нужна съёмка, вертикаль 4:5, светлый фон"
            className="arch-in relative z-10 mt-7 ml-auto aspect-[4/5] w-[52%] rounded-t-full md:absolute md:bottom-9 md:right-[var(--gutter)] md:top-[calc(var(--header-h)+12px+30px+7.5vw)] md:mt-0 md:w-auto"
          />
          <Stamp
            kind="turkiye"
            reveal="load"
            rotate={-14}
            delay={1000}
            className="absolute bottom-[12vw] left-[var(--gutter)] z-20 w-[24vw] md:bottom-auto md:left-auto md:right-[calc(var(--gutter)+34vw)] md:top-[44%] md:w-[10.5vw]"
          />
          <Stamp
            kind="ayt"
            tone="ink"
            reveal="load"
            rotate={8}
            delay={1200}
            className="absolute bottom-[23%] right-[calc(var(--gutter)-4px)] z-20 hidden w-[11vw] md:block"
          />
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

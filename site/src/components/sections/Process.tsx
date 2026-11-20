"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Lines } from "@/components/ui/Type";
import { Stamp } from "@/components/ui/Stamp";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: "01", title: "Разговор и пожелания", text: "Даты, кто едет, что важно в отдыхе. Начинаем с вопросов, а не с каталога." },
  { n: "02", title: "Подбор вариантов", text: "Предлагаем несколько вариантов и объясняем, чем они отличаются." },
  { n: "03", title: "Бронирование и документы", text: "Согласовываем выбранный вариант и оформляем поездку." },
  { n: "04", title: "Связь во время поездки", text: "Остаёмся на связи до возвращения домой. Формат связи — уточнить." },
];

/**
 * «Как мы работаем» — стопка посадочных талонов. Карточки закреплены CSS sticky и ложатся друг на друга;
 * когда приходит следующая, предыдущая уменьшается и темнеет (scrub, только transform и opacity).
 */
export function Process() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-step]");
      items.forEach((li, i) => {
        const next = items[i + 1];
        if (!next) return;
        const card = li.querySelector("[data-card]");
        const shade = li.querySelector("[data-shade]");
        const st = { trigger: next, start: "top bottom", end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`, scrub: true };
        gsap.to(card, { scale: 0.92, ease: "none", scrollTrigger: st });
        gsap.to(shade, { opacity: 0.5, ease: "none", scrollTrigger: st });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="kak-rabotaem" ref={root} aria-labelledby="process-title" className="relative bg-[var(--sky)] px-[var(--gutter)] py-20 md:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-[calc(var(--header-h)+40px)]">
            <p className="label text-[var(--ink)]">Рубрика · Как мы работаем</p>
            <Lines
              id="process-title"
              className="display mt-4 text-[clamp(2.6rem,5vw,5rem)]"
              lines={[
                <>
                  Как мы <em>организуем</em>
                </>,
                "поездку",
              ]}
            />
            <p className="mt-5 max-w-[22rem] text-[16px] leading-[1.55] text-[var(--ink)]/80">Четыре шага — четыре талона. Шаги черновые, сверить с реальным процессом.</p>
            <Stamp kind="bjv" tone="ink" rotate={-7} className="mt-8 hidden w-40 md:block" />
          </div>
        </div>

        <ol className="md:col-span-8">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              data-step
              className="sticky mb-[18svh] last:mb-0 md:mb-[26svh]"
              style={{ top: `calc(var(--header-h) + 20px + ${i * 14}px)` }}
            >
              <article data-card className="relative grid origin-top overflow-hidden rounded-[18px] bg-[var(--white)] shadow-[0_24px_50px_-30px_rgb(19_41_75/0.5)] md:grid-cols-[1fr_auto_200px]">
                <div className="p-6 md:p-9">
                  <div className="flex items-center justify-between">
                    <span className="label text-[var(--aegean)]">Посадочный талон · шаг {s.n} из 04</span>
                    <span className="label hidden text-[var(--ink-soft)] md:inline">Fashion Tours</span>
                  </div>
                  <h3 className="display mt-6 text-[clamp(2rem,3.6vw,3.4rem)]">{s.title}</h3>
                  <p className="mt-3 max-w-[30rem] text-[16px] leading-[1.55] text-[var(--ink-soft)] md:text-[17px]">{s.text}</p>
                </div>
                <div className="perf-h mx-0 [--notch:var(--sky)] md:hidden" />
                <div className="perf-v hidden [--notch:var(--sky)] md:block" />
                <div className="flex items-center justify-between gap-4 p-6 md:flex-col md:items-start md:justify-center md:p-8">
                  <span className="label text-[var(--ink-soft)]">Шаг</span>
                  <span className="display text-[64px] italic leading-none text-[var(--brick)] md:text-[96px]">{s.n}</span>
                </div>
                <div data-shade aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--ink)] opacity-0" />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Lines } from "@/components/ui/Type";
import { Photo, Texture } from "@/components/ui/Media";
import { QuickLeadForm } from "@/components/ui/QuickLeadForm";

gsap.registerPlugin(ScrollTrigger);

/** У каждого шага — небольшой атмосферный натюрморт Higgsfield (без сроков, экранов и обещаний). */
const STEPS = [
  { n: "01", title: "Разговор и пожелания", text: "Даты, кто едет, что важно в отдыхе. Начинаем с вопросов, а не с каталога.", img: "step-talk", alt: "Атмосферный кадр: две чашки кофе на столе" },
  { n: "02", title: "Подбор вариантов", text: "Предлагаем несколько вариантов и объясняем, чем они отличаются.", img: "step-options", alt: "Атмосферный кадр: ключ, полотенце и ветка оливы" },
  { n: "03", title: "Бронирование и документы", text: "Согласовываем выбранный вариант и оформляем поездку.", img: "step-documents", alt: "Атмосферный кадр: папка для документов в поездку" },
  { n: "04", title: "Связь во время поездки", text: "Остаёмся на связи до возвращения домой. Формат связи — уточнить.", img: "step-onway", alt: "Атмосферный кадр: телефон и стакан чая на террасе" },
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
    <section id="kak-rabotaem" ref={root} aria-labelledby="process-title" className="relative isolate overflow-clip bg-[var(--sky)] px-[var(--gutter)] py-20 md:py-32">
      {/* Фон — штукатурка с тенью листьев; multiply оставляет на небесно-голубом только тени. */}
      <Texture id="tex-plaster-shadow" mobileId="tex-plaster-shadow-m" className="opacity-30 mix-blend-multiply" pos="100% 0%" posMobile="50% 0%" />
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <div className="[@media(min-width:900px)_and_(min-height:720px)]:sticky [@media(min-width:900px)_and_(min-height:720px)]:top-[calc(var(--header-h)+24px)]">
            <p className="label text-[var(--ink)]">Подбор и сопровождение</p>
            <Lines
              id="process-title"
              className="display mt-4 text-[clamp(2.6rem,4.2vw,4.5rem)]"
              lines={[
                <>
                  Как мы <em>организуем</em>
                </>,
                "поездку",
              ]}
            />
            <p className="mt-4 max-w-[22rem] text-[16px] leading-[1.55] text-[var(--ink)]">Четыре шага от первого разговора до возвращения домой.</p>
            <QuickLeadForm source="process" />
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
                <div className="flex gap-5 p-6 md:gap-8 md:p-9">
                  <div className="min-w-0 flex-1">
                    <span className="label text-[var(--aegean)]">Посадочный талон · шаг {s.n} из 04</span>
                    <h3 className="display mt-6 text-[clamp(2rem,3.6vw,3.4rem)]">{s.title}</h3>
                    <p className="mt-3 max-w-[30rem] text-[16px] leading-[1.55] text-[var(--ink-soft)] md:text-[17px]">{s.text}</p>
                  </div>
                  {/* Снимок, приколотый к талону. */}
                  <Photo
                    id={s.img}
                    alt={s.alt}
                    sizes="(min-width: 768px) 132px, 76px"
                    reveal="photo-center"
                    className="mt-1 aspect-square w-[76px] shrink-0 rotate-[3deg] self-start border-[4px] border-[var(--white)] shadow-[0_12px_22px_-12px_rgb(19_41_75/0.55)] md:w-[132px] md:border-[5px]"
                  />
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

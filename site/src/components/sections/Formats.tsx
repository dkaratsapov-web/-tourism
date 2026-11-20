"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Placeholder } from "@/components/ui/Placeholder";

gsap.registerPlugin(ScrollTrigger);

const FORMATS = [
  { n: "01", title: "Премиальный отель у моря", text: "Сравниваем отели по сервису, питанию, пляжу и атмосфере, а не только по звёздам." },
  { n: "02", title: "Отдых с детьми", text: "Подбираем отель под возраст ребёнка: питание, пляж, анимация, дорога." },
  { n: "03", title: "Поездка вдвоём", text: "Атмосфера, локация и формат проживания под настроение пары." },
  { n: "04", title: "Маршрут по стране", text: "Анталия, Каппадокия, Стамбул — отели, перелёты и переезды в одной поездке." },
];

/**
 * Форматы отдыха. На ПК — горизонтальная лента, которая едет при вертикальном скролле.
 * Закрепление сделано через CSS sticky, а не GSAP pin: так нет сдвигов вёрстки (CLS).
 */
export function Formats() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !root.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const section = root.current!;
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth + 48;
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
    <section id="formats" ref={root} className="bg-[var(--milk)] md:h-[var(--formats-h,auto)]">
      <div className="overflow-hidden py-20 md:sticky md:top-0 md:flex md:h-svh md:flex-col md:justify-center md:py-0">
        <div className="px-5 md:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink)]/60">Форматы</p>
          <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,5.5vw,5rem)] leading-[1]">Какую Турцию выбираете вы</h2>
        </div>
        <div ref={track} className="mt-10 flex flex-col gap-5 px-5 will-change-transform md:mt-14 md:w-max md:flex-row md:gap-6 md:px-12">
          {FORMATS.map((f) => (
            <article key={f.n} className="group flex flex-col gap-5 rounded-[32px] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(10,30,60,.35)] md:w-[34vw] md:min-w-[380px]">
              <Placeholder label={`Атмосферное фото: ${f.title.toLowerCase()}`} className="aspect-[4/3] transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.02]" />
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-[var(--sea)]">{f.n}</span>
                <h3 className="font-display text-3xl leading-tight">{f.title}</h3>
              </div>
              <p className="text-[var(--ink)]/75">{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Placeholder } from "@/components/ui/Placeholder";
import { storyProgress } from "./progress";

gsap.registerPlugin(ScrollTrigger);

const CloudFlight = dynamic(() => import("@/components/three/CloudFlight"), { ssr: false });

const SCENES = [
  { id: "packing", kicker: "01 · Сборы", title: "Какой отдых хочется именно вам", text: "Начинаем с ваших пожеланий: море или горы, тишина или город, с детьми или вдвоём." },
  { id: "flight", kicker: "02 · Полёт", title: "Путешествие начинается ещё в небе", text: "Перелёт, трансфер и отель складываются в одну поездку, а не в набор бронирований." },
  { id: "arrival", kicker: "03 · Прилёт", title: "Турция, которую вы выбрали", text: "Анталия, Эгейское побережье, Бодрум, Каппадокия, Стамбул." },
  { id: "view", kicker: "04 · Вид", title: "И вот вы на месте", text: "Остаётся открыть дверь на террасу." },
];

/** Посадочный талон — графический мотив сцены «Сборы». */
function BoardingPass() {
  return (
    <div data-pass className="relative w-[min(86vw,520px)] rounded-[26px] bg-[var(--milk)] p-6 text-[var(--ink)] shadow-[0_40px_80px_-30px_rgba(10,30,60,.45)] md:p-8">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink)]/60">
        <span>Fashion Tours</span>
        <span>Boarding pass</span>
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="font-display text-5xl md:text-6xl">MOW</div>
          <div className="mt-1 text-xs text-[var(--ink)]/60">Москва</div>
        </div>
        <div aria-hidden className="mb-4 flex-1 px-4">
          <div className="relative h-px bg-[var(--ink)]/30">
            <span data-plane className="absolute -top-[9px] left-0 text-base">✈</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-5xl md:text-6xl">AYT</div>
          <div className="mt-1 text-xs text-[var(--ink)]/60">Анталия</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-dashed border-[var(--ink)]/25 pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]/60">
        <span>Пассажир<br /><b className="font-sans text-[13px] normal-case tracking-normal text-[var(--ink)]">Вы</b></span>
        <span>Класс<br /><b className="font-sans text-[13px] normal-case tracking-normal text-[var(--ink)]">Ваш выбор</b></span>
        <span>Место<br /><b className="font-sans text-[13px] normal-case tracking-normal text-[var(--ink)]">У окна</b></span>
      </div>
    </div>
  );
}

/** Статичная версия истории: тот же смысл, без движения. */
function StaticStory() {
  return (
    <section aria-label="История путешествия" className="bg-[var(--sky-soft)] px-5 py-24 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-16">
        {SCENES.map((s) => (
          <div key={s.id} className="grid gap-4 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink)]/60">{s.kicker}</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] md:text-6xl">{s.title}</h2>
              <p className="mt-4 max-w-md text-lg text-[var(--ink)]/75">{s.text}</p>
            </div>
            {s.id === "packing" ? <BoardingPass /> : <Placeholder label={`Атмосферное фото: ${s.kicker.slice(5)}`} className="aspect-[4/3]" />}
          </div>
        ))}
      </div>
    </section>
  );
}

export function FlightStory() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);

  // 3D-сцену подключаем, только когда секция близко к экрану.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // near — подключить сцену заранее; inView — рисовать кадры только когда секция на экране.
    const ioNear = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const ioView = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    ioNear.observe(el);
    ioView.observe(el);
    return () => {
      ioNear.disconnect();
      ioView.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => (storyProgress.value = self.progress),
        },
      });

      // Сцена 1 → 2: талон улетает, иллюминатор раскрывается во весь экран.
      tl.to("[data-plane]", { left: "calc(100% - 14px)", duration: 1 }, 0)
        .to("[data-pass]", { yPercent: -40, rotate: -8, scale: 0.85, opacity: 0, duration: 1 }, 0.9)
        .fromTo("[data-window]", { clipPath: "inset(50% 50% 50% 50% round 220px)" }, { clipPath: "inset(26% 34% 26% 34% round 220px)", duration: 0.5, ease: "power2.out" }, 0.95)
        .to("[data-window]", { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, ease: "power2.inOut" }, 1.5)
        // Сцена 3: горизонт и море проявляются снизу.
        .fromTo("[data-sea]", { yPercent: 100 }, { yPercent: 0, duration: 1.2 }, 2.6)
        // Сцена 4: свет террасы.
        .fromTo("[data-terrace]", { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1 }, 3.6);

      // Подписи сцен сменяют друг друга.
      gsap.utils.toArray<HTMLElement>("[data-caption]").forEach((el, i) => {
        const at = i * 1.15;
        tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.35 }, at + (i === 0 ? -0.35 : 0));
        if (i < SCENES.length - 1) tl.to(el, { autoAlpha: 0, y: -40, duration: 0.35 }, at + 0.85);
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) return <StaticStory />;

  return (
    <section ref={root} aria-label="История путешествия" className="relative h-[420vh] md:h-[520vh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[var(--milk)]">
        {/* Сцена 1: сборы */}
        <div className="absolute inset-0 flex items-end justify-center pb-[10vh] md:items-center md:justify-end md:pb-0 md:pr-[7vw]">
          <BoardingPass />
        </div>

        {/* Иллюминатор → небо с 3D-облаками */}
        <div data-window className="absolute inset-0 bg-gradient-to-b from-[#7fb4e6] via-[#bcd8f2] to-[#eaf3fb]" style={{ clipPath: "inset(50% 50% 50% 50% round 220px)" }}>
          {near && <CloudFlight active={inView} />}
          {/* Сцена 3: море поднимается снизу */}
          <div data-sea className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-b from-[#3f86b8] to-[#0f3d63]">
            <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
          </div>
          {/* Сцена 4: терраса */}
          <div data-terrace className="absolute inset-0 grid place-items-end p-5 opacity-0 md:p-12">
            <Placeholder tone="dark" label="Фото: вид с террасы на море — атмосферный кадр, заменить" className="h-[38vh] w-full max-w-xl bg-black/10 backdrop-blur-sm" />
          </div>
        </div>

        {/* Подписи */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-5 pt-[14vh] md:px-12">
          {SCENES.map((s) => (
            <div key={s.id} data-caption className="invisible absolute max-w-xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink)]/70">{s.kicker}</p>
              <h2 className="mt-3 font-display text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.98] text-[var(--ink)]">{s.title}</h2>
              <p className="mt-4 max-w-md text-base text-[var(--ink)]/80 md:text-lg">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

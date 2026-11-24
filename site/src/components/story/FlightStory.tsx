"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Cutout, Photo } from "@/components/ui/Media";
import type { MediaName } from "@/lib/media-manifest";
import { Stamp } from "@/components/ui/Stamp";
import { SplitFlap } from "@/components/ui/SplitFlap";
import { CtaButton } from "@/components/ui/CtaButton";
import { Chars } from "@/components/ui/Type";
import { storyProgress } from "./progress";

gsap.registerPlugin(ScrollTrigger);

// Единственная WebGL-сцена на странице: грузится лениво, отдельным чанком.
const CloudFlight = dynamic(() => import("@/components/three/CloudFlight"), { ssr: false });

const SCENES = [
  { id: "sbory", label: "СБОРЫ" },
  { id: "polet", label: "ПОЛЁТ" },
  { id: "prilet", label: "ПРИЛЁТ" },
  { id: "terrasa", label: "ТЕРРАСА" },
];

/** Границы сцен на шкале прогресса 0…1 — для счётчика «01 / 04». */
const BOUNDS = [0.22, 0.52, 0.72];
const sceneAt = (p: number) => BOUNDS.filter((b) => p >= b).length;

type Item = { name: MediaName; alt: string; pos: string; depth: number; rot: number; size: string; decorative?: boolean; tag?: boolean };

/**
 * Раскладка сверху (flat lay): вырезанные предметы Higgsfield на трёх уровнях глубины (×0,3 / ×0,6 / ×1,1).
 * Телефон — отдельная постановка: паспорт, панама и бирка (плюс талон), очки, платок и марка только на ПК.
 */
const ITEMS: Item[] = [
  { name: "pack-passport-560", alt: "Атмосферный кадр: паспорт в синей обложке", pos: "left-[5%] top-[45%] md:left-[47%] md:top-[13%]", depth: 0.3, rot: -9, size: "w-[22vw] md:w-[8.4vw]" },
  { name: "pack-sunglasses-560", alt: "Атмосферный кадр: солнцезащитные очки", pos: "hidden md:block md:right-[4%] md:top-[14%]", depth: 0.6, rot: 7, size: "md:w-[14vw]" },
  { name: "sticker-postage-stamp-420", alt: "", pos: "hidden md:block md:left-[33%] md:top-[24%]", depth: 0.3, rot: 8, size: "md:w-[6.4vw]", decorative: true },
  { name: "pack-scarf-560", alt: "Атмосферный кадр: шёлковый платок", pos: "hidden md:block md:left-[42%] md:bottom-[7%]", depth: 1.1, rot: 4, size: "md:w-[14vw]" },
  { name: "sticker-luggage-tag-420", alt: "", pos: "left-[5%] bottom-[3%] md:left-[63%] md:bottom-[5%]", depth: 1.1, rot: -10, size: "w-[22vw] md:w-[7.2vw]", decorative: true, tag: true },
  { name: "pack-panama-560", alt: "Атмосферный кадр: детская соломенная панама", pos: "left-[31%] top-[42%] md:left-auto md:right-[6%] md:bottom-[6%] md:top-auto", depth: 0.6, rot: -6, size: "w-[34vw] md:w-[12vw]" },
];

/** Надпись на пустой бирке — SVG поверх кадра: так текст точный и не «нарисован» генерацией. */
function TagLabel() {
  return (
    <svg aria-hidden viewBox="0 0 100 110" className="absolute left-[45%] top-[38%] w-[50%]">
      <rect x="6" y="8" width="88" height="30" fill="#a3433b" />
      <text x="50" y="30" textAnchor="middle" fill="#f6f3ec" style={{ fontFamily: "var(--font-text), sans-serif" }} fontWeight="700" fontSize="19" letterSpacing="3">
        AYT
      </text>
      <text x="50" y="66" textAnchor="middle" fill="#13294b" style={{ fontFamily: "var(--font-display-face), serif" }} fontStyle="italic" fontSize="17">
        Fashion
      </text>
      <text x="50" y="86" textAnchor="middle" fill="#13294b" style={{ fontFamily: "var(--font-display-face), serif" }} fontStyle="italic" fontSize="17">
        Tours
      </text>
    </svg>
  );
}

/** Посадочный талон — главный предмет «Сборов»; он же становится иллюминатором. */
function BoardingPass({ withStamp = true }: { withStamp?: boolean }) {
  return (
    <div className="relative w-[min(88vw,500px)] rounded-[18px] bg-[var(--white)] text-[var(--ink)] shadow-[0_30px_60px_-30px_rgb(19_41_75/0.45)]">
      <div className="flex items-center justify-between rounded-t-[18px] bg-[var(--ink)] px-5 py-3 text-[var(--paper)] md:px-7">
        <span className="label">Fashion Tours</span>
        <span className="label text-[var(--sky)]">Посадочный талон</span>
      </div>
      <div className="flex items-end justify-between px-5 pb-4 pt-5 md:px-7">
        <div>
          <div className="label text-[var(--ink-soft)]">Откуда</div>
          <div className="display mt-1 text-[44px] md:text-[56px]">Дом</div>
        </div>
        <svg aria-hidden viewBox="0 0 120 24" className="mb-5 w-[28%]">
          <path d="M2 18 C 40 2, 80 2, 118 18" fill="none" stroke="#2f6f8f" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
        <div className="text-right">
          <div className="label text-[var(--ink-soft)]">Куда</div>
          <div className="display mt-1 text-[44px] md:text-[56px]">
            <em>AYT</em>
          </div>
        </div>
      </div>
      <div className="perf-h mx-0 [--notch:var(--paper)]" />
      <dl className="grid grid-cols-3 gap-3 px-5 py-4 md:px-7">
        {[
          ["Пассажиры", "Вы и ваши"],
          ["Класс", "Ваш выбор"],
          ["Место", "У окна"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="label text-[var(--ink-soft)]">{k}</dt>
            <dd className="mt-1 text-[14px] font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {withStamp ? (
        <div data-pass-stamp className="absolute -right-3 -top-[5.5rem] w-24 md:-right-10 md:-top-24 md:w-32">
          <Stamp kind="ayt" reveal="none" rotate={-12} />
        </div>
      ) : null}
    </div>
  );
}

const TEXT = {
  sbory: { h: ["Сначала —", <em key="e">разговор</em>], p: "Рассказываете, кто едет и какой отдых нужен. Мы подбираем отель и маршрут." },
  polet: { h: "Пока вы в пути, детали поездки уже в плане", p: "Формулировку уточнить с Натальей." },
  prilet: { h: "Встреча и дорога до отеля", p: "Трансфер и заселение — в плане поездки заранее. Уточнить, входит ли трансфер." },
};

const FLIGHT_CAPTIONS = [
  { start: 2.9, end: 3.45, position: "top-[52%] md:top-auto md:bottom-[15%] md:right-auto", text: <>Пока вы <em>в пути</em></> },
  { start: 3.5, end: 4.07, position: "top-[28%] md:top-[29%] md:left-auto md:text-right", text: <>Отели и переезды <em>уже в плане</em></> },
  { start: 4.12, end: 4.73, position: "top-[48%] text-center md:inset-x-[20%] md:top-[52%]", text: <>Дальше — <em>к побережью</em></> },
];

/** Статичная версия истории для «уменьшить движение»: те же тексты и кадры подряд, без пина и WebGL. */
function StaticStory() {
  return (
    <section id="istoriya" aria-label="История поездки" className="bg-[var(--paper)] px-[var(--gutter)] py-20 md:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-20">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="label text-[var(--aegean)]">01 / 04 · Сборы</p>
            <h2 className="display mt-3 text-[clamp(2.6rem,5.5vw,5rem)]">
              Сначала — <em>разговор</em>
            </h2>
            <p className="mt-4 max-w-md text-[17px] text-[var(--ink-soft)]">{TEXT.sbory.p}</p>
            <div className="mt-8">
              <BoardingPass withStamp={false} />
            </div>
          </div>
          <Photo
            id="story-flatlay"
            mobileId="story-flatlay-m"
            alt="Атмосферный кадр: вещи к поездке — паспорт, талон, очки, платок, детская панама"
            sizes="(min-width: 768px) 50vw, 100vw"
            pos="88% 50%"
            posMobile="50% 75%"
            reveal="none"
            className="aspect-[4/5] md:aspect-[4/3]"
          />
        </div>
        {[
          { n: "02 / 04 · Полёт", h: TEXT.polet.h, p: TEXT.polet.p, id: "story-window", alt: "Атмосферный кадр: крыло самолёта над облаками утром", pos: "40% 55%", posM: "50% 70%" },
          { n: "03 / 04 · Прилёт", h: TEXT.prilet.h, p: TEXT.prilet.p, id: "story-coast", alt: "Атмосферный кадр: Эгейское побережье сверху", pos: "45% 50%", posM: "50% 40%" },
          { n: "04 / 04 · Терраса", h: "Здесь начинается отпуск", p: "", id: "story-terrace", alt: "Атмосферный кадр: терраса с видом на море вечером", pos: "60% 60%", posM: "60% 55%" },
        ].map((s) => (
          <div key={s.n} className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="label text-[var(--aegean)]">{s.n}</p>
              <h2 className="display mt-3 text-[clamp(2.4rem,5vw,4.6rem)]">{s.h}</h2>
              {s.p ? <p className="mt-4 max-w-md text-[17px] text-[var(--ink-soft)]">{s.p}</p> : <CtaButton className="mt-8" />}
            </div>
            <Photo id={s.id} mobileId={`${s.id}-m`} alt={s.alt} sizes="(min-width: 768px) 50vw, 100vw" pos={s.pos} posMobile={s.posM} reveal="none" className="aspect-[4/5] md:aspect-[4/3]" />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * История «сборы → полёт → прилёт → терраса». Одна закреплённая сцена на CSS sticky,
 * прогресс задаёт пользователь скроллом (scrub), автопроигрывания нет.
 * Фон сцены непрерывно меняется: бумага → небо → белый → бумага (слои цвета, анимируется только opacity).
 */
export function FlightStory() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [scene, setScene] = useState(0);

  // 3D-сцену подключаем, только когда история близко; кадры рисуем, только когда она на экране.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ioNear = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "80% 0px" });
    const ioView = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    ioNear.observe(el);
    ioView.observe(el);
    return () => {
      ioNear.disconnect();
      ioView.disconnect();
    };
  }, [reduced]);

  useEffect(() => {
    const el = root.current;
    if (reduced || !el) return;
    const mm = gsap.matchMedia();

    const build = (desktop: boolean) => {
      const q = gsap.utils.selector(el);
      const stage = q("[data-stage]")[0] as HTMLElement;
      const pass = q("[data-pass]")[0] as HTMLElement;
      const win = q("[data-window]")[0] as HTMLElement;
      // Размеры окна иллюминатора: на телефоне почти весь кадр — меньше роста маски, больше полёта.
      const apertureX = () => `${desktop ? Math.max(0, 50 - 15000 / stage.clientWidth) : 7}%`;
      const apertureY = () => `${desktop ? Math.max(0, 50 - 20000 / stage.clientHeight) : 17}%`;
      // Смещение элемента к центру кадра по раскладке (offset*), а не по текущему transform.
      const toCenter = (n: HTMLElement, axis: "x" | "y") =>
        axis === "x"
          ? stage.clientWidth / 2 - (n.offsetLeft + n.offsetWidth / 2)
          : stage.clientHeight / 2 - (n.offsetTop + n.offsetHeight / 2);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: desktop ? 0.8 : 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            storyProgress.value = self.progress;
            setScene(sceneAt(self.progress));
          },
        },
      });

      // 0–2 · Сборы: предметы плывут на разной глубине, затем съезжаются к талону.
      const items = q("[data-item]") as HTMLElement[];
      items.forEach((it) => {
        const d = Number(it.dataset.depth);
        tl.to(it, { y: -d * (desktop ? 140 : 70), duration: 1.6 }, 0);
      });
      tl.to(q("[data-word]"), { xPercent: -14, duration: 2.2 }, 0)
        .fromTo(q("[data-pass-stamp]"), { opacity: 0, scale: 1.7, rotate: -40 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.35, ease: "back.out(1.6)" }, 0.55)
        .to(q("[data-sbory]"), { autoAlpha: 0, y: -40, duration: 0.4, ease: "power2.in" }, 1.45)
        .to(q("[data-word]"), { opacity: 0, duration: 0.4 }, 1.6);
      items.forEach((it, i) => {
        tl.to(it, { x: () => toCenter(it, "x"), y: () => toCenter(it, "y"), scale: 0.25, rotate: 0, opacity: 0, duration: 0.6, ease: "power4.inOut" }, 1.3 + i * 0.05);
      });
      tl.to(pass, { x: () => toCenter(pass, "x"), y: () => toCenter(pass, "y"), duration: 0.6, ease: "power4.inOut" }, 1.35);

      // Иллюминатор открывается из центра. Облака появляются после того, как кадр заполнил экран.
      tl.to(q("[data-bg='sky']"), { opacity: 1, duration: 0.8 }, 1.8)
        .to(win, { "--window-x": apertureX, "--window-y": apertureY, duration: 0.35, ease: "power2.out" }, 1.95)
        .to(pass, { opacity: 0, scale: 0.8, duration: 0.3 }, 1.95)
        .to(win, { "--window-x": "0%", "--window-y": "0%", "--window-radius": "0%", duration: 0.62, ease: "power2.inOut" }, 2.3)
        .fromTo(q("[data-window-poster] [data-photo-in]"), { scale: 1.02 }, { scale: 1.12, duration: 2.65, ease: "power1.inOut" }, 2.3)
        .to(q("[data-flight-clouds]"), { opacity: 0.85, duration: 0.65, ease: "sine.inOut" }, 2.93);

      const captions = q("[data-flight-caption]");
      FLIGHT_CAPTIONS.forEach(({ start, end }, index) => {
        tl.fromTo(captions[index], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.16, ease: "power2.out" }, start)
          .to(captions[index], { autoAlpha: 0, y: -10, duration: 0.14, ease: "power2.in" }, end);
      });

      // 4.8–6.2 · Уайт-аут: под белым меняется кадр на побережье.
      tl.to(q("[data-whiteout]"), { opacity: 1, duration: 0.55 }, 4.8)
        .to(q("[data-bg='white']"), { opacity: 1, duration: 0.5 }, 4.9)
        .set(q("[data-sea]"), { autoAlpha: 1 }, 5.35)
        .fromTo(q("[data-sea] [data-photo-in]"), { scale: 1.25, yPercent: -4 }, { scale: 1, yPercent: 0, duration: 2.1, ease: "power2.out" }, 5.35)
        .to(q("[data-whiteout]"), { opacity: 0, duration: 0.6 }, 5.55);

      // 6–7.2 · Прилёт: подпись.
      tl.fromTo(q("[data-cap='prilet']"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 5.95)
        .to(q("[data-cap='prilet']"), { autoAlpha: 0, y: -40, duration: 0.35, ease: "power2.in" }, 7.0);

      // 7.2–8.8 · Терраса: кадр открывается маской снизу, фон возвращается к бумаге, крупный заголовок по буквам.
      tl.fromTo(q("[data-terrace]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut" }, 7.2)
        .fromTo(q("[data-terrace] [data-photo-in]"), { scale: 1.15 }, { scale: 1, duration: 1.5, ease: "power2.out" }, 7.2)
        .to(q("[data-bg='paper']"), { opacity: 1, duration: 0.8 }, 7.5)
        .fromTo(q("[data-final] .ch"), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.025, ease: "expo.out" }, 8.0)
        .fromTo(q("[data-final-cta]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 8.5)
        .fromTo(q("[data-terrace-stamp]"), { opacity: 0, scale: 1.6, rotate: -30 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.35, ease: "back.out(1.6)" }, 8.6)
        .to({}, { duration: 1.2 });

      // Прогресс-линия — по всей истории.
      gsap.fromTo(q("[data-progress]"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: true } });
    };

    mm.add("(min-width: 900px)", () => build(true));
    mm.add("(max-width: 899px)", () => build(false));
    return () => mm.revert();
  }, [reduced]);

  if (reduced) return <StaticStory />;

  return (
    <section id="istoriya" ref={root} aria-label="История поездки: сборы, полёт, прилёт, терраса" className="relative h-[480svh] md:h-[600svh]">
      <div data-stage className="sticky top-0 h-svh overflow-hidden">
        {/* Слои цвета фона: бумага → небо → белый → бумага. */}
        <div aria-hidden className="absolute inset-0 bg-[var(--paper)]" />
        <div aria-hidden data-bg="sky" className="absolute inset-0 bg-[var(--sky)] opacity-0" />
        <div aria-hidden data-bg="white" className="absolute inset-0 bg-[var(--white)] opacity-0" />
        <div aria-hidden data-bg="paper" className="absolute inset-0 bg-[var(--paper)] opacity-0" />

        {/* Сцена 1 · Сборы */}
        <p aria-hidden data-word className="display pointer-events-none absolute -left-[2vw] top-[30%] whitespace-nowrap text-[42vw] italic leading-none text-[var(--tuff)]/55 md:top-[8%] md:text-[30vw]">
          сборы
        </p>
        {ITEMS.map((it) => (
          <div key={it.name} data-item data-depth={it.depth} className={`absolute ${it.pos} ${it.size}`} style={{ rotate: `${it.rot}deg` }}>
            <Cutout name={it.name} alt={it.alt} decorative={it.decorative} />
            {it.tag ? <TagLabel /> : null}
          </div>
        ))}
        <div data-sbory className="absolute inset-x-[var(--gutter)] top-[calc(var(--header-h)+70px)] max-w-[30rem] md:top-auto md:bottom-[16%]">
          <p className="label text-[var(--aegean)]">Рубрика · Сборы</p>
          <h2 data-reveal="marker" className="display mt-3 text-[clamp(2.5rem,5.6vw,5.6rem)]">
            Сначала — <em className="marker">разговор</em>
          </h2>
          <p className="mt-4 max-w-[26rem] text-[16px] leading-[1.5] text-[var(--ink-soft)] md:text-[18px]">{TEXT.sbory.p}</p>
        </div>
        <div data-pass className="absolute bottom-[19%] left-[calc(50%-min(44vw,250px))] md:bottom-auto md:left-auto md:right-[9vw] md:top-[38%]">
          <BoardingPass />
        </div>

        {/* Иллюминатор → небо и облака → побережье → терраса */}
        <div data-window className="absolute inset-0 bg-[var(--sky)] [--window-x:50%] [--window-y:50%] [--window-radius:50%] [clip-path:inset(var(--window-y)_var(--window-x)_round_var(--window-radius))]">
          <Photo
            id="story-window"
            mobileId="story-window-m"
            alt="Атмосферный кадр: крыло самолёта над облаками утром"
            sizes="100vw"
            pos="38% 60%"
            posMobile="40% 72%"
            reveal="none"
            className="absolute inset-0"
            data={{ "data-window-poster": "" }}
          />
          <div aria-hidden data-flight-clouds className="pointer-events-none absolute inset-0 opacity-0">
            {near ? <CloudFlight active={inView && scene === 1} /> : null}
          </div>
          {/* Видео позже: петля story-coast-loop.mp4 (только ПК) — <video muted playsInline loop preload="none">
              внутри [data-photo-in] этого кадра, постер — этот же кадр; играть, только пока сцена на экране. */}
          <Photo
            id="story-coast"
            mobileId="story-coast-m"
            alt="Атмосферный кадр: Эгейское побережье сверху"
            sizes="100vw"
            pos="50% 50%"
            posMobile="55% 60%"
            reveal="none"
            className="invisible absolute inset-0"
            data={{ "data-sea": "" }}
          />
          {/* Видео позже: петля story-terrace-loop.mp4 (только ПК) — так же внутри [data-photo-in], постер — этот кадр. */}
          <Photo
            id="story-terrace"
            mobileId="story-terrace-m"
            alt="Атмосферный кадр: терраса с видом на море вечером"
            sizes="100vw"
            pos="50% 70%"
            posMobile="62% 50%"
            reveal="none"
            className="absolute inset-0 [clip-path:inset(100%_0_0_0)]"
            data={{ "data-terrace": "" }}
          >
            {/* Светлая дымка только за заголовком и кнопкой (слева, по высоте текста): на ПК линия горизонта
                проходит на уровне строк, и тёмное море иначе съедает контраст. Остальной кадр не тронут. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_12%,rgb(246_243_236/0.62)_38%,rgb(246_243_236/0.5)_62%,transparent_80%)] [mask-image:linear-gradient(90deg,#000_35%,transparent_80%)] max-md:bg-[linear-gradient(180deg,transparent_15%,rgb(246_243_236/0.55)_32%,rgb(246_243_236/0.4)_48%,transparent_62%)] max-md:[mask-image:none]"
            />
          </Photo>
        </div>
        <div aria-hidden data-whiteout className="pointer-events-none absolute inset-0 bg-[var(--white)] opacity-0" />

        {/* Подписи сцен */}
        {FLIGHT_CAPTIONS.map(({ start, position, text }) => (
          <div key={start} data-flight-caption className={`invisible absolute inset-x-[var(--gutter)] ${position}`}>
            <h2 className="display relative isolate inline-block max-w-[15ch] text-[clamp(2.8rem,4.8vw,5.5rem)] before:absolute before:-inset-x-8 before:-inset-y-6 before:-z-10 before:bg-[radial-gradient(ellipse,rgb(246_243_236/0.85),transparent_72%)]">
              {text}
            </h2>
          </div>
        ))}
        <div data-cap="prilet" className="invisible absolute inset-x-[var(--gutter)] top-[calc(var(--header-h)+80px)] max-w-[36rem]">
          <div className="w-fit bg-[var(--paper)] px-5 pb-5 pt-4 md:px-7 md:pb-7">
            <p className="label text-[var(--aegean)]">Рубрика · Прилёт</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,4.4vw,4.4rem)]">
              Встреча и <em>дорога до отеля</em>
            </h2>
            <p className="mt-3 max-w-[26rem] text-[15px] leading-[1.5] text-[var(--ink-soft)] md:text-[17px]">{TEXT.prilet.p}</p>
          </div>
        </div>
        <div data-final className="absolute inset-x-[var(--gutter)] top-[calc(var(--header-h)+56px)]">
          <Chars text="Здесь начинается отпуск" italicFrom={2} reveal={false} className="display max-w-[12ch] text-[clamp(3.1rem,9.4vw,10rem)] [--wght:480] [&_.ch]:opacity-0" />
          <div data-final-cta className="invisible mt-6 md:mt-10">
            <CtaButton size="lg" />
          </div>
          <div data-terrace-stamp className="absolute right-0 top-0 hidden w-36 opacity-0 md:block">
            <Stamp kind="turkiye" reveal="none" rotate={10} id="st-terrace" />
          </div>
        </div>

        {/* Счётчик прогресса в стиле табло, линия прогресса и выход из истории */}
        <div className="pointer-events-none absolute inset-x-0 top-[var(--header-h)] z-20 h-[3px] bg-[var(--ink)]/10">
          <div data-progress className="h-full origin-left scale-x-0 bg-[var(--aegean)]" />
        </div>
        <div className="absolute left-[var(--gutter)] top-[calc(var(--header-h)+18px)] z-20 flex items-center gap-3 text-[15px] md:text-[17px]" aria-hidden>
          <SplitFlap text={`0${scene + 1}`} length={2} trigger="value" />
          <span className="label text-[var(--ink)]">/ 04</span>
          <SplitFlap text={SCENES[scene].label} length={7} trigger="value" light />
        </div>
        <a
          href="#formaty"
          className="label absolute bottom-[calc(88px+env(safe-area-inset-bottom))] right-[var(--gutter)] z-20 flex h-11 items-center gap-2 rounded-full bg-[var(--paper)] px-4 text-[var(--ink)] md:bottom-8"
        >
          Пропустить историю
          <svg aria-hidden viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M8 2v11M4 9l4 4 4-4" />
          </svg>
        </a>
      </div>
    </section>
  );
}

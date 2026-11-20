"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Placeholder, type Tone } from "@/components/ui/Placeholder";
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

type Item = { tone: Tone; label: string; pos: string; depth: number; rot: number; size: string; mobile: boolean };

/** Раскладка сверху (flat lay): предметы на трёх уровнях глубины. На телефоне — три предмета вместо четырёх. */
const ITEMS: Item[] = [
  { tone: "passport", label: "паспорт в обложке, вид сверху", pos: "left-[3%] top-[40%] md:left-[47%] md:top-[14%]", depth: 0.3, rot: -9, size: "w-[28vw] md:w-[11vw] aspect-[3/4]", mobile: true },
  { tone: "glasses", label: "солнцезащитные очки", pos: "right-[3%] top-[41%] md:right-[5%] md:top-[12%]", depth: 0.6, rot: 7, size: "w-[34vw] md:w-[13vw] aspect-[4/3]", mobile: true },
  { tone: "scarf", label: "шёлковый платок", pos: "left-[56%] bottom-[2%] md:left-[44%] md:bottom-[9%]", depth: 1.1, rot: 4, size: "w-[30vw] md:w-[12vw] aspect-square", mobile: true },
  { tone: "hat", label: "детская панама", pos: "hidden md:block md:right-[7%] md:bottom-[7%]", depth: 0.6, rot: -6, size: "md:w-[11vw] aspect-square", mobile: false },
];

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
          </div>
          <BoardingPass />
        </div>
        {[
          { n: "02 / 04 · Полёт", h: TEXT.polet.h, p: TEXT.polet.p, tone: "route" as Tone, label: "вид из иллюминатора: облака и край крыла" },
          { n: "03 / 04 · Прилёт", h: TEXT.prilet.h, p: TEXT.prilet.p, tone: "sea" as Tone, label: "Эгейское побережье сверху, бирюзовая вода" },
          { n: "04 / 04 · Терраса", h: "Здесь начинается отпуск", p: "", tone: "terrace" as Tone, label: "терраса отеля, море до горизонта, вечерний свет" },
        ].map((s) => (
          <div key={s.n} className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="label text-[var(--aegean)]">{s.n}</p>
              <h2 className="display mt-3 text-[clamp(2.4rem,5vw,4.6rem)]">{s.h}</h2>
              {s.p ? <p className="mt-4 max-w-md text-[17px] text-[var(--ink-soft)]">{s.p}</p> : <CtaButton className="mt-8" />}
            </div>
            <Placeholder tone={s.tone} label={s.label} reveal="none" className="aspect-[4/3]" />
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
      const winW = () => (desktop ? 300 : stage.clientWidth * 0.86);
      const winH = () => (desktop ? 400 : stage.clientHeight * 0.66);
      const R = desktop ? 150 : 170;
      const clip = (w: number, h: number, r: number) =>
        `inset(${(stage.clientHeight - h) / 2}px ${(stage.clientWidth - w) / 2}px ${(stage.clientHeight - h) / 2}px ${(stage.clientWidth - w) / 2}px round ${r}px)`;
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

      // 2–2.9 · Талон становится иллюминатором: маска растёт из окна до полного кадра.
      tl.to(q("[data-bg='sky']"), { opacity: 1, duration: 0.8 }, 1.8)
        .fromTo(win, { clipPath: () => clip(0, 0, R) }, { clipPath: () => clip(winW(), winH(), R), duration: 0.35, ease: "expo.out" }, 1.95)
        .to(pass, { opacity: 0, scale: 0.8, duration: 0.3 }, 1.95)
        .fromTo(q("[data-bezel]"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, 1.95)
        .to(win, { clipPath: () => clip(stage.clientWidth, stage.clientHeight, 0), duration: 0.9, ease: "power4.inOut" }, 2.3)
        .to(q("[data-bezel]"), { scale: 4.5, opacity: 0, duration: 0.9, ease: "power4.inOut" }, 2.3);

      // 2.9–5 · Полёт: облака (WebGL читает storyProgress), подпись.
      tl.fromTo(q("[data-cap='polet']"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 3.0)
        .to(q("[data-cap='polet']"), { autoAlpha: 0, y: -40, duration: 0.35, ease: "power2.in" }, 4.4);

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
          <div key={it.tone} data-item data-depth={it.depth} className={`absolute ${it.pos} ${it.size}`} style={{ rotate: `${it.rot}deg` }}>
            <Placeholder tone={it.tone} label={it.label} reveal="none" compact labelClassName="max-md:hidden" className="h-full w-full rounded-[6px] border-[6px] border-[var(--white)] shadow-[0_18px_30px_-18px_rgb(19_41_75/0.5)]" />
          </div>
        ))}
        <div data-sbory className="absolute inset-x-[var(--gutter)] top-[calc(var(--header-h)+70px)] max-w-[30rem] md:top-auto md:bottom-[16%]">
          <p className="label text-[var(--aegean)]">Рубрика · Сборы</p>
          <h2 data-reveal="marker" className="display mt-3 text-[clamp(2.5rem,5.6vw,5.6rem)]">
            Сначала — <em className="marker">разговор</em>
          </h2>
          <p className="mt-4 max-w-[26rem] text-[16px] leading-[1.5] text-[var(--ink-soft)] md:text-[18px]">{TEXT.sbory.p}</p>
          {/* На телефоне предметы мелкие — одна общая подпись вместо подписи на каждом. */}
          <p className="mt-3 w-fit rounded-[3px] bg-[var(--white)] px-2.5 py-1.5 text-[11.5px] leading-[1.35] md:hidden">
            <b className="font-semibold">Атмосферные кадры</b> — генерация Higgsfield: паспорт, очки, платок
          </p>
        </div>
        <div data-pass className="absolute bottom-[19%] left-[calc(50%-min(44vw,250px))] md:bottom-auto md:left-auto md:right-[9vw] md:top-[38%]">
          <BoardingPass />
        </div>

        {/* Иллюминатор → небо и облака → побережье → терраса */}
        <div data-window className="absolute inset-0 bg-gradient-to-b from-[#86b9e2] via-[var(--sky)] to-[#eef5fb]" style={{ clipPath: "inset(50% 50% 50% 50% round 150px)" }}>
          {near ? <CloudFlight active={inView && scene <= 1} /> : null}
          <Placeholder
            tone="sea"
            reveal="none"
            label="Эгейское побережье сверху: бирюзовая вода, светлые камни, линия берега"
            className="invisible absolute inset-0"
            data={{ "data-sea": "" }}
          />
          <Placeholder
            tone="terrace"
            reveal="none"
            label="терраса отеля: каменный парапет, море до горизонта, тёплый вечерний свет"
            className="absolute inset-0 [clip-path:inset(100%_0_0_0)]"
            data={{ "data-terrace": "" }}
          />
        </div>
        <div aria-hidden data-bezel className="pointer-events-none absolute left-1/2 top-1/2 h-[66svh] w-[86vw] -translate-x-1/2 -translate-y-1/2 rounded-[170px] border-[14px] border-[var(--white)] opacity-0 shadow-[0_0_0_1px_rgb(19_41_75/0.12)] md:h-[400px] md:w-[300px] md:rounded-[150px]" />
        <div aria-hidden data-whiteout className="pointer-events-none absolute inset-0 bg-[var(--white)] opacity-0" />

        {/* Подписи сцен */}
        <div data-cap="polet" className="invisible absolute inset-x-[var(--gutter)] top-[calc(var(--header-h)+80px)] max-w-[40rem] md:top-auto md:bottom-[12%]">
          <p className="label text-[var(--ink)]">Рубрика · Полёт</p>
          <h2 className="display mt-3 text-[clamp(2.3rem,4.8vw,4.8rem)]">
            Пока вы в пути, <em>детали поездки</em> уже в плане
          </h2>
        </div>
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

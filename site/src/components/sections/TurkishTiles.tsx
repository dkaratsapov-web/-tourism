"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { asset } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

const TILE_OFFSETS = [
  [-22, -24, -10], [6, -28, 5], [22, -18, 9],
  [-28, 5, -8], [0, 14, 0], [26, -3, 8],
  [-22, 24, -6], [-5, 28, -5], [23, 23, 10],
];

const PANEL = asset("/media/iznik-panel.webp");

const FACTS = [
  { title: "Тюльпаны Изника", text: "Во второй половине XVI века тюльпаны и гиацинты стали характерными мотивами османской керамики. Их часто рисовали рядом с крупными стилизованными цветами.", position: "left-[26%] top-[23%]" },
  { title: "Лист саз", text: "Длинный зубчатый лист называют саз. Этот мотив пришёл из персидского искусства ко двору османских султанов в XVI веке. На изразцах поверх такого листа иногда рисовали тюльпан.", position: "right-[23%] top-[24%] sm:top-[48%]" },
];

export function TurkishTiles() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const active = hovered ?? selected;
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const motion = gsap.matchMedia();

    motion.add("(prefers-reduced-motion: no-preference)", () => {
      const tiles = gsap.utils.toArray<HTMLElement>("[data-iznik-tile]", section);
      const caption = section.querySelector("[data-iznik-caption]");

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          end: "top 18%",
          scrub: 0.55,
        },
      })
        .from(tiles, {
          xPercent: (i) => TILE_OFFSETS[i][0],
          yPercent: (i) => TILE_OFFSETS[i][1],
          rotation: (i) => TILE_OFFSETS[i][2],
          scale: 0.91,
          opacity: 0.24,
          ease: "power2.out",
          duration: 0.8,
          stagger: { from: "center", amount: 0.52 },
        })
        .from(caption, { y: 22, opacity: 0, duration: 0.65, ease: "power2.out" }, 0.72);
    });

    return () => motion.revert();
  }, []);

  return (
    <section
      ref={root}
      id="iznik"
      aria-labelledby="iznik-title"
      className="relative isolate overflow-clip bg-[#101f44] px-[var(--gutter)] py-16 text-[var(--paper)] md:py-24 xl:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_24%_40%,#244d85,transparent_67%)]" />
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 md:grid-cols-[1fr_0.84fr] md:gap-[7vw]">
        <figure onPointerLeave={() => setHovered(null)} onKeyDown={(event) => { if (event.key === "Escape") { setHovered(null); setSelected(null); } }} className="relative mx-auto w-full max-w-[620px] p-2 outline outline-1 outline-[#a9cdeb]/35 md:p-3">
          <div
            role="img"
            aria-label="Керамическое панно в стиле Изника с кобальтовыми листьями и красными тюльпанами"
            className="grid aspect-square grid-cols-3 grid-rows-3 gap-[2px] md:gap-[3px]"
          >
            {TILE_OFFSETS.map((_, i) => (
              <div
                key={i}
                aria-hidden
                data-iznik-tile
                className="border border-[#f6f3ec]/45 bg-[#eeeadc] [background-size:300%_300%]"
                style={{
                  backgroundImage: `url("${PANEL}")`,
                  backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`,
                }}
              />
            ))}
          </div>
          {FACTS.map((fact, i) => (
            <button
              key={fact.title}
              type="button"
              aria-label={fact.title}
              aria-expanded={active === i}
              aria-controls="iznik-fact"
              onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(i); }}
              onClick={() => { setHovered(null); setSelected(active === i && selected === i ? null : i); }}
              className={`absolute z-30 grid size-11 cursor-pointer place-items-center rounded-full border border-white/80 text-xl shadow-[0_3px_15px_#101f4480] transition-colors ${fact.position} ${active === i ? "bg-[#a3433b] text-white" : "bg-[#101f44] text-white"}`}
            >
              <span aria-hidden>{active === i ? "−" : "+"}</span>
            </button>
          ))}
          <figcaption id="iznik-fact" aria-live="polite" className={`absolute inset-x-3 bottom-3 z-20 border-l-2 border-[#a3433b] bg-[#f6f3ec] px-4 py-3 text-[#101f44] shadow-lg sm:px-5 sm:py-4 ${active === null ? "hidden" : ""}`}>
            {active !== null && (
              <>
                <p className="display text-[23px]">{FACTS[active].title}</p>
                <p className="mt-1 text-[13px] leading-relaxed sm:text-[15px]">{FACTS[active].text}</p>
              </>
            )}
          </figcaption>
        </figure>
        <div data-iznik-caption className="max-w-[36rem] pb-2">
          <p className="mb-5 flex items-center gap-3 text-[14px] font-medium text-[#a9cdeb]">
            <span aria-hidden className="size-2 shrink-0 rotate-45 bg-[#e17960]" />
            Керамика Изника
          </p>
          <h2 id="iznik-title" className="display text-[clamp(3rem,6vw,7rem)]">
            Турция в деталях
          </h2>
          <p className="mt-6 max-w-[30rem] text-[17px] leading-relaxed text-[#dae4f4] md:text-[18px]">
            Красные тюльпаны, кобальтовые листья и бирюзовые стебли. Присмотритесь к изразцам в мечетях и дворцах Стамбула — знакомые узоры каждый раз складываются по-новому.
          </p>
        </div>
      </div>
    </section>
  );
}

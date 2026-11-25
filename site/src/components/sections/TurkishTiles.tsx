"use client";

import { useEffect, useRef } from "react";
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

export function TurkishTiles() {
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
        <figure className="mx-auto w-full max-w-[620px] p-2 outline outline-1 outline-[#a9cdeb]/35 md:p-3">
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

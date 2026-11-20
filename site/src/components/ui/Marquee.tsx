"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  items: string[];
  /** Базовое направление: 1 — влево, -1 — вправо. */
  dir?: 1 | -1;
  className?: string;
  starClass?: string;
};

/** Четырёхконечная звезда-разделитель (символа ✦ нет в выбранных шрифтах). */
function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={`mx-[0.3em] inline-block h-[0.42em] w-[0.42em] align-middle ${className}`}>
      <path d="M10 0c.9 5.6 4.4 9.1 10 10-5.6.9-9.1 4.4-10 10-.9-5.6-4.4-9.1-10-10C5.6 9.1 9.1 5.6 10 0z" fill="currentColor" />
    </svg>
  );
}

/**
 * Бегущая строка. Скорость и наклон (skewX до 8°) зависят от скорости скролла,
 * при скролле вверх направление разворачивается. Анимируется только transform; вне экрана — пауза.
 * При «уменьшить движение» — неподвижная строка с тем же текстом.
 */
export function Marquee({ items, dir = 1, className = "", starClass = "text-[var(--brick)]" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const skewEl = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current || !track.current || !skewEl.current) return;
    const t = track.current;
    const sk = skewEl.current;
    let visible = false;
    let x = 0;
    let skew = 0;
    let heading = dir;
    let lastY = window.scrollY;
    let width = (t.firstElementChild as HTMLElement).offsetWidth;

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root.current);
    const ro = new ResizeObserver(() => (width = (t.firstElementChild as HTMLElement).offsetWidth));
    ro.observe(t);

    const tick = (_time: number, dtMs: number) => {
      const y = window.scrollY;
      const v = (y - lastY) * (16.7 / Math.max(dtMs, 1)); // пикселей скролла за кадр 60 Гц
      lastY = y;
      if (!visible || !width) return;
      if (Math.abs(v) > 0.4) heading = (Math.sign(v) * dir) as 1 | -1;
      const speed = 0.7 + Math.min(Math.abs(v) * 0.45, 18);
      x -= heading * speed * (dtMs / 16.7);
      if (x <= -width) x += width;
      if (x > 0) x -= width;
      const target = Math.max(-8, Math.min(8, -v * 0.35 * dir));
      skew += (target - skew) * 0.12;
      t.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      sk.style.transform = `skewX(${skew.toFixed(2)}deg)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduced, dir]);

  // Один «набор» повторяем дважды, чтобы он гарантированно был шире экрана; в дорожке — две копии набора.
  const set = (
    <span className="inline-flex shrink-0 items-center pr-[0.1em]">
      {[0, 1].map((r) => (
        <Fragment key={r}>
          {items.map((it, i) => (
            <Fragment key={`${r}-${i}`}>
              <span className={i % 2 ? "it" : ""}>{it}</span>
              <Star className={starClass} />
            </Fragment>
          ))}
        </Fragment>
      ))}
    </span>
  );

  return (
    <div ref={root} aria-hidden className={`marquee ${className}`}>
      <div ref={skewEl} className="marquee-skew">
        <div ref={track} className="marquee-track">
          {set}
          {set}
        </div>
      </div>
    </div>
  );
}

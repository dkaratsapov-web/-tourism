"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const ABC = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789";
const NBSP = " ";
const TICK = 55;

type Props = {
  text: string;
  /** Число ячеек; текст дополняется пробелами справа. */
  length?: number;
  /** view — перещёлкнуть один раз при входе в экран; value — при каждой смене текста (счётчик истории). */
  trigger?: "view" | "value";
  className?: string;
  light?: boolean;
};

const pad = (t: string, n: number) => t.toUpperCase().padEnd(n, " ").slice(0, n);

/**
 * Split-flap табло. Первая отрисовка (и версия без JavaScript) — сразу финальный текст.
 * Перещёлкивание меняет только содержимое ячеек фиксированной ширины, поэтому вёрстка не сдвигается.
 * Скринридер получает финальный текст целиком.
 */
export function SplitFlap({ text, length, trigger = "view", className = "", light = false }: Props) {
  const n = length ?? text.length;
  const root = useRef<HTMLSpanElement>(null);
  const [initial] = useState(() => pad(text, n));
  const shown = useRef(initial);
  const timers = useRef<number[]>([]);
  const reduced = useReducedMotion();

  const run = (target: string, scramble: boolean) => {
    const cells = root.current?.querySelectorAll<HTMLElement>(".flap > i");
    if (!cells) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cells.forEach((cell, i) => {
      const to = target[i] ?? " ";
      const from = shown.current[i] ?? " ";
      if (!scramble && to === from) return;
      // Буквы перещёлкиваются слева направо: задержка 30 мс, всего не дольше ~700 мс.
      const flips = Math.min(3 + Math.floor(i * 0.5), 8);
      for (let k = 0; k <= flips; k++) {
        const id = window.setTimeout(() => {
          const last = k === flips;
          const ch = last ? to : ABC[Math.floor(Math.random() * ABC.length)];
          cell.textContent = ch === " " ? NBSP : ch;
          cell.animate([{ transform: "rotateX(-80deg)" }, { transform: "rotateX(0deg)" }], {
            duration: TICK - 5,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          });
        }, i * 30 + k * TICK);
        timers.current.push(id);
      }
    });
    shown.current = target;
  };

  // Один раз при входе в экран.
  useEffect(() => {
    if (trigger !== "view" || reduced || !root.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        run(shown.current, true);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(root.current);
    return () => io.disconnect();
  }, [trigger, reduced]);

  // Смена значения (счётчик истории).
  useEffect(() => {
    if (trigger !== "value") return;
    const target = pad(text, n);
    if (target === shown.current) return;
    if (reduced) {
      root.current?.querySelectorAll<HTMLElement>(".flap > i").forEach((c, i) => {
        c.textContent = target[i] === " " ? NBSP : target[i];
      });
      shown.current = target;
      return;
    }
    run(target, false);
  }, [text, n, trigger, reduced]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <span ref={root} className={`flap-row ${className}`}>
      <span className="sr-only">{text}</span>
      {[...initial].map((c, i) => (
        <span key={i} aria-hidden className={`flap ${light ? "is-light" : ""}`}>
          <i>{c === " " ? NBSP : c}</i>
        </span>
      ))}
    </span>
  );
}

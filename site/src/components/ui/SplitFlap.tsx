"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const ABC = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
const DIGITS = "0123456789";
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
  const reduced = useReducedMotion();

  useEffect(() => {
    const cells = root.current?.querySelectorAll<HTMLElement>(".flap > i");
    if (!cells) return;
    const target = pad(text, n);
    const timers: number[] = [];
    const run = (scramble: boolean) => {
      cells.forEach((cell, i) => {
        const glyph = target[i] ?? " ";
        const to = glyph === " " ? NBSP : glyph;
        if (reduced || to === NBSP) {
          cell.textContent = to;
          return;
        }
        // При быстрой смене сцены ячейка может ещё показывать промежуточный символ.
        if (!scramble && cell.textContent === to) return;
        const alphabet = DIGITS.includes(to) ? DIGITS : ABC;
        const flips = Math.min(3 + Math.floor(i * 0.5), 8);
        for (let k = 0; k <= flips; k++) {
          timers.push(window.setTimeout(() => {
            cell.textContent = k === flips ? to : alphabet[Math.floor(Math.random() * alphabet.length)];
            cell.animate([{ transform: "rotateX(-80deg)" }, { transform: "rotateX(0deg)" }], {
              duration: TICK - 5,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            });
          }, i * 30 + k * TICK));
        }
      });
    };

    let observer: IntersectionObserver | undefined;
    if (trigger === "view" && !reduced && root.current) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        run(true);
        observer?.disconnect();
      }, { threshold: 0.6 });
      observer.observe(root.current);
    } else {
      run(false);
    }
    return () => {
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [text, n, trigger, reduced]);

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

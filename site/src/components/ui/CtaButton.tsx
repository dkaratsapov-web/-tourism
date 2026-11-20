"use client";

import type { ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { LEAD_ID } from "@/lib/site";

type Props = {
  children?: ReactNode;
  variant?: "solid" | "light";
  size?: "md" | "sm" | "lg";
  className?: string;
  id?: string;
  /** Магнит к курсору (только мышь, до 8 px). */
  magnetic?: boolean;
};

const MAX = 8;
const SIZES = { sm: "h-11 pl-5 pr-2 text-[14px]", md: "h-14 pl-7 pr-2.5 text-[15px]", lg: "h-16 pl-8 pr-3 text-[16px]" };

/**
 * Главное действие сайта — «Обсудить поездку». Обычная ссылка на блок заявки:
 * работает до загрузки JavaScript; магнит и заливка при наведении — только украшение.
 */
export function CtaButton({ children = "Обсудить поездку", variant = "solid", size = "md", className = "", id, magnetic = true }: Props) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 320, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!magnetic || reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(Math.max(-1, Math.min(1, dx)) * MAX);
    y.set(Math.max(-1, Math.min(1, dy)) * MAX);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const look =
    variant === "solid"
      ? "bg-[var(--ink)] text-[var(--paper)] [--fill:var(--aegean)] [--dot:var(--paper)] [--dot-ink:var(--ink)]"
      : "bg-[var(--paper)] text-[var(--ink)] [--fill:var(--sky)] [--dot:var(--ink)] [--dot-ink:var(--paper)]";

  return (
    <motion.a
      id={id}
      href={`#${LEAD_ID}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className={`group relative isolate inline-flex select-none items-center justify-between gap-4 overflow-hidden rounded-full font-medium tracking-[0.01em] transition-transform duration-150 ease-[var(--ease-ui)] active:scale-[0.97] ${SIZES[size]} ${look} ${className}`}
    >
      {/* Заливка выметается слева при наведении. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[var(--fill)] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      <span className="whitespace-nowrap">{children}</span>
      <span
        aria-hidden
        className="grid aspect-square h-[calc(100%-12px)] place-items-center rounded-full bg-[var(--dot)] text-[var(--dot-ink)] transition-transform duration-300 ease-[var(--ease-expo)] group-hover:translate-x-0.5 group-hover:-rotate-45"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 8h11M9 4l4 4-4 4" />
        </svg>
      </span>
    </motion.a>
  );
}

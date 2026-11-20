import type { ReactNode } from "react";

type Props = { children?: ReactNode; variant?: "solid" | "ghost"; className?: string };

/** Главное действие сайта. Ведёт к блоку заявки; ссылка работает и без JavaScript. */
export function CtaButton({ children = "Обсудить поездку", variant = "solid", className = "" }: Props) {
  const base =
    "group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-medium tracking-wide transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sky)]";
  const look =
    variant === "solid"
      ? "bg-[var(--ink)] text-[var(--milk)] hover:bg-[var(--sea)]"
      : "border border-current text-current hover:bg-[var(--ink)] hover:text-[var(--milk)]";
  return (
    <a href="#lead" className={`${base} ${look} ${className}`}>
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

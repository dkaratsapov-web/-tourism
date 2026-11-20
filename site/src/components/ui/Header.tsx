"use client";

import { useEffect, useRef, useState } from "react";
import { NAV, LEAD_ID } from "@/lib/site";
import { scroller } from "@/lib/scroll";
import { CtaButton } from "./CtaButton";

/**
 * Шапка: всегда на месте (кнопка заявки доступна на всём пути).
 * Активный раздел отмечается кирпичной точкой. На телефоне — меню во весь экран.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Какой раздел сейчас в центре экрана.
  useEffect(() => {
    const els = [...NAV.map((n) => n.id), LEAD_ID].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? null : cur));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Меню во весь экран: Escape закрывает, фон недоступен, скролл стоит, фокус возвращается на кнопку.
  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("main");
    main?.setAttribute("inert", "");
    scroller.lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const button = btn.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      main?.removeAttribute("inert");
      scroller.lenis?.start();
      document.body.style.overflow = prev;
      button?.focus();
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b border-[var(--ink)]/10 bg-[var(--paper)]">
      <div className="flex h-full items-center justify-between gap-6 px-[var(--gutter)]">
        <a href="#main" className="group flex items-baseline gap-2 text-[17px] font-semibold tracking-[-0.01em]" aria-label="Fashion Tours — в начало">
          <span>Fashion Tours</span>
          <span className="hidden text-[12px] font-medium tracking-[0.12em] text-[var(--ink-soft)] uppercase lg:inline">Турция</span>
        </a>

        <nav aria-label="Основное меню" className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id ? "location" : undefined}
              className={`link-draw relative flex h-11 items-center text-[14px] font-medium transition-colors ${active === n.id ? "text-[var(--ink)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"}`}
            >
              <span
                aria-hidden
                className={`absolute -left-3.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--brick)] transition-transform duration-200 ${active === n.id ? "scale-100" : "scale-0"}`}
              />
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <CtaButton size="sm" />
        </div>

        <button
          ref={btn}
          type="button"
          className="flex h-11 min-w-11 items-center gap-2 rounded-full px-3 text-[15px] font-medium md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Закрыть" : "Меню"}
          <span aria-hidden className="relative h-3 w-5">
            <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-200 ${open ? "top-1.5 rotate-45" : "top-0.5"}`} />
            <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-200 ${open ? "top-1.5 -rotate-45" : "top-2"}`} />
          </span>
        </button>
      </div>

      <div
        ref={panel}
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-[var(--paper)] px-[var(--gutter)] pb-[calc(24px+env(safe-area-inset-bottom))] pt-8 md:hidden"
      >
        <p className="label text-[var(--aegean)]">В номере</p>
        <ul className="mt-4">
          {[...NAV, { id: "pisma", label: "Письма читателей" }].map((n) => (
            <li key={n.id} className="border-b border-[var(--ink)]/12">
              <a href={`#${n.id}`} onClick={() => setOpen(false)} className="display flex min-h-16 items-center py-3 text-[34px]">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8" onClick={() => setOpen(false)}>
          <CtaButton size="lg" className="w-full" magnetic={false} />
        </div>
      </div>
    </header>
  );
}

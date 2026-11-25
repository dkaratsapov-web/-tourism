"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { NAV, LEAD_ID, asset, openLeadDialog } from "@/lib/site";
import { scroller, scrollToId } from "@/lib/scroll";
import { CtaButton } from "./CtaButton";

/**
 * Шапка: всегда на месте (кнопка заявки доступна на всём пути).
 * Активный раздел отмечается кирпичной точкой. На телефоне — раскрывающееся меню.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const nextAnchor = useRef<string | null>(null);

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

  // Пока меню открыто, блокируем скролл и возвращаем фокус на кнопку после закрытия.
  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("main");
    main?.setAttribute("inert", "");
    scroller.lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    const button = btn.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      main?.removeAttribute("inert");
      scroller.lenis?.start();
      document.body.style.overflow = prev;
      if (!desktop.matches) button?.focus({ preventScroll: true });
      const id = nextAnchor.current;
      if (id) {
        nextAnchor.current = null;
        scrollToId(id);
        history.replaceState(null, "", `#${id}`);
      }
    };
  }, [open]);

  const onMenuClick = (event: MouseEvent<HTMLElement>) => {
    const id = (event.target as Element).closest<HTMLAnchorElement>("a[href^='#']")?.hash.slice(1);
    if (!id) return;
    event.preventDefault();
    event.stopPropagation();
    nextAnchor.current = id;
    setOpen(false);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-[var(--header-inset)] z-50 px-3 md:px-6">
      {open && <div aria-hidden className="pointer-events-auto fixed inset-0 bg-[var(--ink)]/20 md:hidden" onClick={() => setOpen(false)} />}
      <div className="pointer-events-auto relative mx-auto flex h-[calc(var(--header-h)-var(--header-inset))] max-w-[1180px] items-center justify-between gap-3 rounded-full border border-[var(--ink)]/12 bg-[var(--paper)]/95 pr-1.5 pl-4 shadow-[0_8px_28px_-12px_rgba(19,41,75,0.38),inset_0_1px_0_var(--white)] backdrop-blur-md md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4 md:pr-2.5 md:pl-6">
        <a href="#main" onClick={open ? onMenuClick : undefined} className="flex h-11 w-fit shrink-0 items-center gap-3 rounded-full whitespace-nowrap" aria-label="Fashion Tours — в начало">
          <Image src={asset("/media/fashion-tours-logo.webp")} alt="" width={420} height={286} unoptimized loading="eager" className="h-11 w-auto mix-blend-multiply md:h-[54px]" />
          <span className="hidden border-l border-[var(--ink)]/18 pl-3 text-[10px] font-semibold tracking-[0.14em] text-[var(--ink-soft)] uppercase lg:inline">Турция</span>
        </a>

        <nav aria-label="Основное меню" className="hidden items-center gap-1 md:flex lg:gap-2">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id ? "location" : undefined}
              className={`relative flex h-11 items-center rounded-full px-3.5 text-[14px] font-medium whitespace-nowrap transition-colors lg:px-5 ${active === n.id ? "bg-[var(--ink)]/6 text-[var(--ink)]" : "text-[var(--ink-soft)] hover:bg-[var(--ink)]/5 hover:text-[var(--ink)]"}`}
            >
              <span
                aria-hidden
                className={`absolute bottom-1.5 left-1/2 size-[4px] -translate-x-1/2 rounded-full bg-[var(--brick)] transition-transform duration-200 ${active === n.id ? "scale-100" : "scale-0"}`}
              />
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden justify-self-end md:block">
          <CtaButton size="sm" magnetic={false} onOpenDialog={() => openLeadDialog()} />
        </div>

        <button
          ref={btn}
          type="button"
          className="flex h-11 min-w-11 items-center gap-2.5 rounded-full bg-[var(--ink)] px-3.5 text-[14px] font-medium text-[var(--paper)] md:hidden"
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
        data-lenis-prevent
        onClick={onMenuClick}
        className="pointer-events-auto fixed inset-x-3 top-[calc(var(--header-h)+8px)] max-h-[calc(100dvh-var(--header-h)-20px-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain rounded-[28px] border border-[var(--ink)]/12 bg-[var(--paper)] px-5 pt-4 pb-5 shadow-[0_16px_48px_-16px_rgba(19,41,75,0.34)] md:hidden"
      >
        <ul>
          {NAV.map((n) => (
            <li key={n.id} className="border-b border-[var(--ink)]/12">
              <a href={`#${n.id}`} aria-current={active === n.id ? "location" : undefined} className="display flex min-h-14 items-center rounded-md py-3 text-[28px]">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <CtaButton className="w-full" magnetic={false} onOpenDialog={() => {
            setOpen(false);
            requestAnimationFrame(() => openLeadDialog());
          }} />
        </div>
      </div>
    </header>
  );
}

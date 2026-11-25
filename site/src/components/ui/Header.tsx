"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { NAV, LEAD_DIALOG_ID, LEAD_ID, openLeadDialog } from "@/lib/site";
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
      <div className="pointer-events-auto relative mx-auto flex h-[calc(var(--header-h)-var(--header-inset))] max-w-[1310px] items-center justify-between gap-2 rounded-t-lg border-b-2 border-[var(--ink)] bg-[var(--paper)]/96 px-3 shadow-[0_14px_32px_-22px_#13294b] backdrop-blur-md md:grid md:grid-cols-[1fr_auto_1fr] md:px-4 lg:px-6">
        <a href="#main" onClick={open ? onMenuClick : undefined} className="flex min-h-11 w-fit shrink-0 items-baseline gap-3 whitespace-nowrap text-[var(--ink)] max-md:items-center" aria-label="Fashion Tours — в начало">
          <span className="display self-center text-[23px] [--wght:620] md:text-[26px] lg:text-[32px]">Fashion Tours</span>
          <span className="hidden border-l-2 border-[var(--brick)] pl-2 text-[10px] font-semibold tracking-[0.13em] text-[var(--ink-soft)] uppercase min-[1060px]:inline">Турция</span>
        </a>

        <nav aria-label="Основное меню" className="hidden h-full items-stretch gap-3 md:flex lg:gap-7">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id ? "location" : undefined}
              className={`group relative flex items-center px-1 text-[13px] font-medium whitespace-nowrap transition-colors hover:text-[var(--ink)] ${active === n.id ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"}`}
            >
              <span
                aria-hidden
                className={`absolute inset-x-1 bottom-0 h-0.5 origin-left bg-[var(--brick)] transition-transform duration-200 motion-reduce:transition-none ${active === n.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"}`}
              />
              {n.label}
            </a>
          ))}
        </nav>

        <button type="button" aria-haspopup="dialog" aria-controls={LEAD_DIALOG_ID} onClick={() => openLeadDialog()} className="hidden min-h-11 cursor-pointer items-center gap-2.5 justify-self-end whitespace-nowrap text-[13px] font-semibold text-[var(--ink)] group md:inline-flex">
          Обсудить поездку
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-[var(--brick)] text-lg leading-none text-white transition-colors group-hover:bg-[var(--ink)]">↗</span>
        </button>

        <button
          ref={btn}
          type="button"
          className="flex h-11 min-w-11 self-center items-center gap-2.5 px-1.5 text-[13px] font-medium text-[var(--ink)] md:hidden"
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
        className="pointer-events-auto fixed inset-x-3 top-[calc(var(--header-h)+8px)] max-h-[calc(100dvh-var(--header-h)-20px-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain rounded-[17px] border border-[var(--ink)]/18 bg-[var(--paper)] px-5 pt-4 pb-5 shadow-[0_16px_48px_-16px_rgba(19,41,75,0.34)] md:hidden"
      >
        <ul>
          {[...NAV, { id: "pisma", label: "Письма читателей" }].map((n) => (
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

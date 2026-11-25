"use client";

import { useEffect, useRef } from "react";

export function ScrollHint() {
  const hint = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = hint.current;
    if (!element) return;
    let timeout = 0;
    const onScroll = () => {
      if (!element.hasAttribute("data-scrolling")) element.setAttribute("data-scrolling", "");
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => element.removeAttribute("data-scrolling"), 280);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <p ref={hint} className="fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-1/2 z-40 flex w-max -translate-x-1/2 items-center gap-1.5 rounded-full bg-[var(--paper)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--ink)] opacity-60 ring-1 ring-[var(--ink)]/10 transition-opacity duration-200 data-[scrolling]:opacity-[0.18] [@media(hover:hover)]:hover:opacity-100 motion-reduce:transition-none">
      Медленно листайте вниз
      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-[var(--brick)]">
        <path d="M6 1v9m-3-3 3 3 3-3" />
      </svg>
    </p>
  );
}

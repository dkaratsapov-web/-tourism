"use client";

import { useEffect } from "react";

/**
 * Один IntersectionObserver на всю страницу: ставит data-in элементам с data-reveal,
 * когда они входят в экран. Сами анимации описаны в CSS (globals.css) и играют один раз.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );
    const observe = () =>
      document.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => io.observe(el));
    observe();
    // Секции, которые перерисовались после гидрации (например, статичная история), подхватываем заново.
    let raf = 0;
    const mo = new MutationObserver(() => {
      if (!raf) raf = requestAnimationFrame(() => ((raf = 0), observe()));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}

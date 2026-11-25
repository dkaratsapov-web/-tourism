"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { scroller, scrollToId } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);
// Раскрытие панели Safari не должно перематывать закреплённые сцены.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Плавный скролл Lenis, синхронизированный с GSAP ScrollTrigger.
 * Колесо не блокируется, snap нет; на телефоне палец двигает страницу нативно (syncTouch выключен).
 * При «уменьшить движение» остаётся обычный системный скролл.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    // Якорные ссылки (#zayavka и т. п.) — с отступом под фиксированную шапку.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);

    if (reduced) return () => document.removeEventListener("click", onClick);

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    scroller.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      scroller.lenis = null;
    };
  }, [reduced]);

  return null;
}

"use client";

import { useEffect, useState } from "react";
import { LEAD_ID, openLeadDialog } from "@/lib/site";
import { CtaButton } from "./CtaButton";

/**
 * Нижняя панель на телефоне: одна кнопка во всю ширину.
 * Появляется, когда кнопка первого экрана ушла вверх, и прячется, когда в кадре форма заявки.
 * На ПК кнопка всегда есть в шапке, поэтому панель не нужна.
 */
export function StickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [atLead, setAtLead] = useState(false);
  const [inStory, setInStory] = useState(false);

  useEffect(() => {
    const heroCta = document.getElementById("hero-cta");
    const lead = document.getElementById(LEAD_ID);
    const story = document.getElementById("istoriya");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === heroCta) setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0);
        if (e.target === lead) setAtLead(e.isIntersecting);
        if (e.target === story) setInStory(e.isIntersecting);
      }
    });
    if (heroCta) io.observe(heroCta);
    if (lead) io.observe(lead);
    if (story) io.observe(story);
    return () => io.disconnect();
  }, []);

  const show = pastHero && !atLead && !inStory;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ink)]/10 bg-[var(--paper)] px-4 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 transition-[transform,opacity] duration-300 ease-[var(--ease-expo)] md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
      aria-hidden={!show}
      inert={!show}
    >
      <CtaButton className="w-full" magnetic={false} onOpenDialog={() => openLeadDialog()} />
    </div>
  );
}

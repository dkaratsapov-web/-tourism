"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "main", label: "Обложка" },
  { id: "istoriya", label: "История поездки" },
  { id: "formaty", label: "Табло вылетов" },
  { id: "trip-formats", label: "Форматы отдыха" },
  { id: "iznik", label: "Турция в деталях" },
  { id: "natalia", label: "Наталья" },
  { id: "obzory", label: "Обзоры отелей" },
  { id: "kak-rabotaem", label: "Как мы работаем" },
  { id: "pisma", label: "Отзывы" },
  { id: "zayavka", label: "Заявка" },
  { id: "contacts", label: "Контакты" },
];

export function SectionIndex() {
  const index = useRef<HTMLElement>(null);
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const nav = index.current;
    if (!nav) return;
    const desktop = window.matchMedia("(min-width: 1024px) and (hover: hover)");
    const sections = SECTIONS.map(({ id }) => document.getElementById(id));
    let frame = 0;
    let timer = 0;

    const update = () => {
      frame = 0;
      if (!desktop.matches) return;
      const line = window.innerHeight * 0.32;
      const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const current = sections.findLast((section) => section && section.getBoundingClientRect().top <= line);
      setActive(pageBottom ? SECTIONS[SECTIONS.length - 1].id : current?.id ?? SECTIONS[0].id);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onScroll = () => {
      if (!desktop.matches) return;
      nav.dataset.scrolling = "true";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { delete nav.dataset.scrolling; }, 420);
      schedule();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    schedule();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <nav ref={index} className="section-index" aria-label="Оглавление бортового журнала">
      <div className="section-index-paper" aria-hidden />
      <p className="section-index-title display" aria-hidden>Оглавление</p>
      <ol>
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? "location" : undefined}>
              <span className="section-index-label">{label}</span>
              <span className="section-index-marker" aria-hidden />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

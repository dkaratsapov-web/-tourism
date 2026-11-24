"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Lines } from "@/components/ui/Type";
import { Photo, Texture } from "@/components/ui/Media";
import { LEAD_ENDPOINT, isContact } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

/** У каждого шага — небольшой атмосферный натюрморт Higgsfield (без сроков, экранов и обещаний). */
const STEPS = [
  { n: "01", title: "Разговор и пожелания", text: "Даты, кто едет, что важно в отдыхе. Начинаем с вопросов, а не с каталога.", img: "step-talk", alt: "Атмосферный кадр: две чашки кофе на столе" },
  { n: "02", title: "Подбор вариантов", text: "Предлагаем несколько вариантов и объясняем, чем они отличаются.", img: "step-options", alt: "Атмосферный кадр: ключ, полотенце и ветка оливы" },
  { n: "03", title: "Бронирование и документы", text: "Согласовываем выбранный вариант и оформляем поездку.", img: "step-documents", alt: "Атмосферный кадр: папка для документов в поездку" },
  { n: "04", title: "Связь во время поездки", text: "Остаёмся на связи до возвращения домой. Формат связи — уточнить.", img: "step-onway", alt: "Атмосферный кадр: телефон и стакан чая на террасе" },
];

function ProcessForm() {
  const sending = useRef(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    if (!name || !isContact(contact)) {
      setStatus("error");
      setMessage(!name ? "Укажите ваше имя." : "Укажите телефон, Telegram или электронную почту.");
      (form.elements.namedItem(name ? "contact" : "name") as HTMLInputElement)?.focus({ preventScroll: true });
      return;
    }
    if (!data.has("consent")) {
      setStatus("error");
      setMessage("Подтвердите согласие на обработку данных.");
      return;
    }
    if (!LEAD_ENDPOINT) {
      setStatus("error");
      setMessage("Отправка заявок пока недоступна.");
      return;
    }

    sending.current = true;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, consent: true, source: "process" }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      setStatus("sent");
      setMessage("Заявка отправлена.");
    } catch {
      setStatus("error");
      setMessage("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      sending.current = false;
    }
  };

  const input = "mt-1 w-full rounded-lg border border-[var(--ink)]/20 bg-[var(--white)] px-3 py-2.5 text-[16px] text-[var(--ink)] placeholder:text-[var(--ink-soft)]";

  return (
    <form method="dialog" aria-labelledby="process-form-title" onSubmit={submit} className="mt-6 max-w-[24rem] rounded-[18px] bg-[var(--paper)] p-5 shadow-[0_22px_44px_-30px_rgb(19_41_75/0.6)] md:p-6">
      <h3 id="process-form-title" className="display text-[29px]">Расскажите о поездке</h3>
      <label className="mt-4 block text-[14px] font-medium">
        Имя
        <input className={input} name="name" autoComplete="given-name" required />
      </label>
      <label className="mt-3 block text-[14px] font-medium">
        Телефон или Telegram
        <input className={input} name="contact" placeholder="+7 … или @ник" required />
      </label>
      <label className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-[var(--ink-soft)]">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-[var(--ink)]" />
        Согласие на обработку персональных данных
      </label>
      <button type="submit" disabled={status === "sending"} className="mt-4 flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-full bg-[var(--ink)] px-4 py-2 text-[14px] font-medium text-[var(--paper)] transition-colors hover:bg-[var(--aegean)] disabled:cursor-wait disabled:opacity-70">
        {status === "sending" ? "Отправляем…" : "Отправить заявку"} <span aria-hidden>→</span>
      </button>
      <p role="status" className={message ? `mt-3 text-[14px] ${status === "error" ? "text-[var(--brick)]" : "text-[var(--ink)]"}` : "sr-only"}>{message}</p>
    </form>
  );
}

/**
 * «Как мы работаем» — стопка посадочных талонов. Карточки закреплены CSS sticky и ложатся друг на друга;
 * когда приходит следующая, предыдущая уменьшается и темнеет (scrub, только transform и opacity).
 */
export function Process() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-step]");
      items.forEach((li, i) => {
        const next = items[i + 1];
        if (!next) return;
        const card = li.querySelector("[data-card]");
        const shade = li.querySelector("[data-shade]");
        const st = { trigger: next, start: "top bottom", end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`, scrub: true };
        gsap.to(card, { scale: 0.92, ease: "none", scrollTrigger: st });
        gsap.to(shade, { opacity: 0.5, ease: "none", scrollTrigger: st });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="kak-rabotaem" ref={root} aria-labelledby="process-title" className="relative isolate overflow-clip bg-[var(--sky)] px-[var(--gutter)] py-20 md:py-32">
      {/* Фон — штукатурка с тенью листьев; multiply оставляет на небесно-голубом только тени. */}
      <Texture id="tex-plaster-shadow" mobileId="tex-plaster-shadow-m" className="opacity-30 mix-blend-multiply" pos="100% 0%" posMobile="50% 0%" />
      <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <div className="[@media(min-width:900px)_and_(min-height:720px)]:sticky [@media(min-width:900px)_and_(min-height:720px)]:top-[calc(var(--header-h)+24px)]">
            <p className="label text-[var(--ink)]">Рубрика · Как мы работаем</p>
            <Lines
              id="process-title"
              className="display mt-4 text-[clamp(2.6rem,4.2vw,4.5rem)]"
              lines={[
                <>
                  Как мы <em>организуем</em>
                </>,
                "поездку",
              ]}
            />
            <p className="mt-4 max-w-[22rem] text-[16px] leading-[1.55] text-[var(--ink)]">Четыре шага от первого разговора до возвращения домой.</p>
            <ProcessForm />
          </div>
        </div>

        <ol className="md:col-span-8">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              data-step
              className="sticky mb-[18svh] last:mb-0 md:mb-[26svh]"
              style={{ top: `calc(var(--header-h) + 20px + ${i * 14}px)` }}
            >
              <article data-card className="relative grid origin-top overflow-hidden rounded-[18px] bg-[var(--white)] shadow-[0_24px_50px_-30px_rgb(19_41_75/0.5)] md:grid-cols-[1fr_auto_200px]">
                <div className="flex gap-5 p-6 md:gap-8 md:p-9">
                  <div className="min-w-0 flex-1">
                    <span className="label text-[var(--aegean)]">Посадочный талон · шаг {s.n} из 04</span>
                    <h3 className="display mt-6 text-[clamp(2rem,3.6vw,3.4rem)]">{s.title}</h3>
                    <p className="mt-3 max-w-[30rem] text-[16px] leading-[1.55] text-[var(--ink-soft)] md:text-[17px]">{s.text}</p>
                  </div>
                  {/* Снимок, приколотый к талону. */}
                  <Photo
                    id={s.img}
                    alt={s.alt}
                    sizes="(min-width: 768px) 132px, 76px"
                    reveal="photo-center"
                    className="mt-1 aspect-square w-[76px] shrink-0 rotate-[3deg] self-start border-[4px] border-[var(--white)] shadow-[0_12px_22px_-12px_rgb(19_41_75/0.55)] md:w-[132px] md:border-[5px]"
                  />
                </div>
                <div className="perf-h mx-0 [--notch:var(--sky)] md:hidden" />
                <div className="perf-v hidden [--notch:var(--sky)] md:block" />
                <div className="flex items-center justify-between gap-4 p-6 md:flex-col md:items-start md:justify-center md:p-8">
                  <span className="label text-[var(--ink-soft)]">Шаг</span>
                  <span className="display text-[64px] italic leading-none text-[var(--brick)] md:text-[96px]">{s.n}</span>
                </div>
                <div data-shade aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--ink)] opacity-0" />
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

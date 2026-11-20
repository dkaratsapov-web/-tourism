"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Placeholder } from "@/components/ui/Placeholder";
import { CtaButton } from "@/components/ui/CtaButton";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Появление блока при входе в экран. При «уменьшить движение» — без анимации. */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Natalia() {
  return (
    <section id="natalia" className="bg-[var(--ink)] px-5 py-24 text-[var(--milk)] md:px-12 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
        <Reveal>
          <Placeholder tone="dark" label="Фото Натальи в поездке — заменить на реальное" className="aspect-[4/5]" />
        </Reveal>
        <div>
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">Кто подбирает</p>
            <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]">Наталья — лицо Fashion Tours</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg text-white/80">
              Наталья жила в Турции, несколько раз была в Каппадокии и объясняет разницу между отелями, питанием и сервисом.
              Мы подбираем поездку под ваши пожелания и остаёмся на связи во время отдыха.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Текст черновой — согласовать с Натальей</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", title: "Обсуждаем пожелания", text: "Даты, состав поездки, что важно в отдыхе." },
  { n: "02", title: "Подбираем и объясняем", text: "Предлагаем варианты и рассказываем, чем они отличаются." },
  { n: "03", title: "Бронируем", text: "Согласовываем выбранный вариант и оформляем поездку." },
  { n: "04", title: "Сопровождаем", text: "Остаёмся на связи до возвращения домой." },
];

export function Process() {
  return (
    <section id="process" className="bg-[var(--sky-soft)] px-5 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink)]/60">Как мы организуем поездку</p>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]">Четыре шага</h2>
        </Reveal>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-[32px] bg-[var(--ink)]/10 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="bg-[var(--sky-soft)]">
              <Reveal delay={i * 0.08} className="h-full p-6 md:p-8">
                <span className="font-display text-6xl text-[var(--sea)]">{s.n}</span>
                <h3 className="mt-6 text-xl font-medium">{s.title}</h3>
                <p className="mt-2 text-[var(--ink)]/70">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink)]/45">Шаги черновые — сверить с реальным процессом</p>
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section className="bg-[var(--milk)] px-5 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink)]/60">Обзоры и отзывы</p>
          <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[1]">Отели глазами Натальи</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Reveal key={i} delay={i * 0.06}>
              <Placeholder label={`Видеообзор отеля ${i} — вертикальное видео Натальи`} className="aspect-[9/16]" />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8">
          <Placeholder label="Реальные отзывы клиентов — с их разрешения, уточнить" className="min-h-40" />
        </Reveal>
      </div>
    </section>
  );
}

export function Lead() {
  return (
    <section id="lead" className="bg-[var(--ink)] px-5 py-24 text-[var(--milk)] md:px-12 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.95]">Обсудим вашу поездку?</h2>
          <p className="mt-6 max-w-md text-lg text-white/75">Напишите в Telegram или оставьте контакты — Наталья свяжется с вами.</p>
          <a href="#lead" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[var(--milk)] px-7 py-4 font-medium text-[var(--ink)] transition-transform duration-300 hover:-translate-y-0.5">
            Написать в Telegram <span className="font-mono text-[11px] opacity-60">(ссылка — уточнить)</span>
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          {/* Форма — заготовка. Приём заявок в Telegram и на почту делает бэкенд-разработчик. */}
          <form className="grid gap-4" action="#" aria-label="Заявка на подбор поездки">
            {[
              ["name", "Как к вам обращаться", "text"],
              ["contact", "Телефон или Telegram", "text"],
              ["when", "Когда планируете поездку", "text"],
              ["who", "Кто едет", "text"],
            ].map(([name, label, type]) => (
              <label key={name} className="grid gap-2 text-sm text-white/70">
                {label}
                <input name={name} type={type} className="rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-base text-white outline-none transition-colors focus:border-[var(--sky)]" />
              </label>
            ))}
            <label className="flex items-start gap-3 text-sm text-white/60">
              <input type="checkbox" required className="mt-1" /> Согласен на обработку персональных данных (документ — подготовить)
            </label>
            <button type="submit" className="mt-2 rounded-full bg-[var(--sky)] px-7 py-4 font-medium text-[var(--ink)] transition-transform duration-300 hover:-translate-y-0.5">
              Подобрать отдых
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[var(--ink)] px-5 pb-10 text-white/50 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm md:flex-row">
        <span className="font-display text-xl text-white/80">Fashion Tours</span>
        <span>Реквизиты · Политика конфиденциальности — подготовить</span>
      </div>
      <div className="sr-only">
        <CtaButton />
      </div>
    </footer>
  );
}

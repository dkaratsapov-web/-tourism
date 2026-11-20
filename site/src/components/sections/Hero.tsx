import { CtaButton } from "@/components/ui/CtaButton";
import { Placeholder } from "@/components/ui/Placeholder";

const LINES = ["Премиальный отдых", "и индивидуальные", "поездки по Турции"];

/** Первый экран. Без JavaScript-зависимостей: появление строк — на CSS. */
export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-between px-5 pb-10 pt-6 md:px-12 md:pb-14">
      <header className="flex items-center justify-between">
        <span className="font-display text-2xl tracking-tight">Fashion Tours</span>
        <nav aria-label="Основное меню" className="hidden gap-8 text-sm md:flex">
          <a href="#formats" className="link-underline">Форматы</a>
          <a href="#natalia" className="link-underline">Наталья</a>
          <a href="#process" className="link-underline">Как работаем</a>
        </nav>
        <a href="#lead" className="text-sm font-medium md:hidden">Заявка</a>
      </header>

      <div className="grid gap-10 md:grid-cols-[1.7fr_1fr] md:items-end">
        <div>
          <p className="hero-line font-mono text-xs uppercase tracking-[0.22em] text-[var(--ink)]/60" style={{ animationDelay: "0ms" }}>
            Турагентство · Турция
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.9rem,6.6vw,7.4rem)] leading-[0.92] tracking-[-0.02em]">
            {LINES.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]">
                <span className="hero-line block" style={{ animationDelay: `${120 + i * 110}ms` }}>
                  {i === 2 ? (
                    <>
                      поездки по <em className="text-[var(--sea)]">Турции</em>
                    </>
                  ) : (
                    l
                  )}
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-line mt-8 max-w-lg text-lg text-[var(--ink)]/75" style={{ animationDelay: "520ms" }}>
            Подбираем отели и маршруты под ваши пожелания. Наталья жила в Турции и объясняет, чем отличаются отели, питание и сервис.
          </p>
          <div className="hero-line mt-8" style={{ animationDelay: "640ms" }}>
            <CtaButton />
          </div>
        </div>
        <Placeholder label="Портрет Натальи — заменить на реальное фото" className="hero-line aspect-[4/5] w-full max-w-[18rem] justify-self-end md:max-w-sm" />
      </div>

      <p aria-hidden className="mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink)]/50">
        Листайте — полетели ↓
      </p>
    </section>
  );
}

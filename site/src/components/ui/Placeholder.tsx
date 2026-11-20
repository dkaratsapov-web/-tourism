type Props = { label: string; className?: string; tone?: "light" | "dark" };

/**
 * Видимый подписанный плейсхолдер. По правилам проекта на месте реальных фото,
 * отзывов и кейсов, которых ещё нет, стоит явная пометка, а не выдуманный контент.
 */
export function Placeholder({ label, className = "", tone = "light" }: Props) {
  const look =
    tone === "light"
      ? "border-[var(--ink)]/25 bg-[var(--stone)]/40 text-[var(--ink)]/70"
      : "border-white/30 bg-white/5 text-white/70";
  return (
    <div
      role="img"
      aria-label={`Плейсхолдер: ${label}`}
      className={`flex items-center justify-center rounded-[28px] border border-dashed p-6 text-center font-mono text-xs uppercase tracking-[0.18em] ${look} ${className}`}
    >
      {label}
    </div>
  );
}

import type { ReactNode } from "react";

/** Тона плейсхолдеров: только места под реальные материалы Натальи. Атмосферные кадры — в Media.tsx. */
export type Tone = "portrait" | "hotel-1" | "hotel-2" | "hotel-3" | "hotel-4";

type Props = {
  /** Что нужно снять или прислать. */
  label: string;
  tone: Tone;
  /** Как открывается: маска снизу вверх, из центра или без анимации. */
  reveal?: "photo" | "photo-center" | "none";
  className?: string;
  /** Подпись мельче — для маленьких кадров. */
  compact?: boolean;
  children?: ReactNode;
};

/**
 * Оформленный, но явно подписанный плейсхолдер. По правилам проекта на месте портретов Натальи,
 * её видеообзоров и отзывов стоит видимая пометка, а не выдуманный или сгенерированный материал.
 */
export function Placeholder({ label, tone, reveal = "photo", className = "", compact = false, children }: Props) {
  return (
    <div role="img" aria-label={`Плейсхолдер. ${label}`} className={`photo ${className}`} {...(reveal !== "none" ? { "data-reveal": reveal } : {})}>
      <div className="photo-mask">
        <div className={`photo-in tone-${tone}`} data-photo-in="" />
        {children}
        <span
          aria-hidden
          className={`absolute bottom-2.5 left-2.5 right-2.5 z-10 w-fit max-w-[min(30rem,calc(100%-20px))] rounded-[3px] bg-[var(--paper)]/92 text-[var(--ink)] ${
            compact ? "px-2 py-1 text-[10.5px] leading-[1.3]" : "px-2.5 py-1.5 text-[11.5px] leading-[1.35]"
          }`}
        >
          <b className="font-semibold">Плейсхолдер</b> · {label}
        </span>
      </div>
    </div>
  );
}

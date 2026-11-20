import type { ReactNode } from "react";

export type Tone =
  | "sea" | "terrace" | "cappadocia" | "istanbul" | "kids" | "couple" | "route" | "portrait"
  | "hotel-1" | "hotel-2" | "hotel-3" | "hotel-4" | "passport" | "glasses" | "scarf" | "hat";

type Props = {
  /** Что будет в кадре. Для атмосферных кадров к подписи добавляется «Атмосферный кадр — генерация Higgsfield». */
  label: string;
  tone: Tone;
  /** atmo — сгенерированная атмосфера; need — нужен реальный материал Натальи (портрет, видео, отзыв). */
  kind?: "atmo" | "need";
  /** Как открывается: маска снизу вверх, из центра или без анимации (внутри сцен со scrub). */
  reveal?: "photo" | "photo-center" | "none";
  className?: string;
  /** Подпись мельче — для маленьких кадров. */
  compact?: boolean;
  /** Дополнительные классы подписи (например, скрыть её на телефоне, если рядом есть общая подпись). */
  labelClassName?: string;
  children?: ReactNode;
  /** Атрибуты для GSAP-сцен (data-*), чтобы найти кадр и его внутренний слой. */
  data?: Record<string, string>;
};

/**
 * Оформленный, но явно подписанный плейсхолдер фото. По правилам проекта на месте реальных фото,
 * видео и отзывов стоит видимая пометка, а не выдуманный материал.
 */
export function Placeholder({ label, tone, kind = "atmo", reveal = "photo", className = "", compact = false, labelClassName = "", children, data }: Props) {
  const text = kind === "atmo" ? `Атмосферный кадр — генерация Higgsfield: ${label}` : label;
  return (
    <div
      role="img"
      aria-label={`Плейсхолдер. ${text}`}
      className={`photo ${className}`}
      {...(reveal !== "none" ? { "data-reveal": reveal } : {})}
      {...data}
    >
      <div className="photo-mask">
      <div className={`photo-in tone-${tone}`} data-photo-in="" />
      {children}
      <span
        aria-hidden
        className={`${labelClassName} absolute bottom-2.5 left-2.5 right-2.5 z-10 w-fit max-w-[min(30rem,calc(100%-20px))] rounded-[3px] bg-[var(--paper)]/92 text-[var(--ink)] ${
          compact ? "px-2 py-1 text-[10.5px] leading-[1.3]" : "px-2.5 py-1.5 text-[11.5px] leading-[1.35]"
        }`}
      >
        <b className="font-semibold">{kind === "atmo" ? "Атмосферный кадр" : "Плейсхолдер"}</b>
        {kind === "atmo" ? ` — генерация Higgsfield: ${label}` : ` · ${label}`}
      </span>
      </div>
    </div>
  );
}

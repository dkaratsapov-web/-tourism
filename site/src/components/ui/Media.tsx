import type { CSSProperties, ReactNode } from "react";
import { asset } from "@/lib/site";
import { MEDIA, type MediaName } from "@/lib/media-manifest";

/**
 * Атмосферные кадры Higgsfield. Файлы — веб-варианты из public/media/w (см. tools/web/media_variants.py).
 * next/image в статическом экспорте не оптимизирует, поэтому обычный <img> с width/height и srcset.
 * Правило проекта: у каждого кадра data-atmosphere и alt «Атмосферный кадр: …», подписей под кадром нет.
 */

/** Медиа-запрос телефона: для него отдельная постановка кадра (файлы с суффиксом -m). */
export const PHONE = "(max-width: 767px)";

const url = (name: string) => asset(`/media/w/${name}.webp`);

/** Все ширины одного кадра, от меньшей к большей: format-coast → format-coast-800, format-coast-1280. */
function variants(id: string) {
  const re = new RegExp(`^${id}-(\\d+)$`);
  return (Object.keys(MEDIA) as MediaName[])
    .map((k) => ({ k, m: re.exec(k) }))
    .filter((x) => x.m)
    .map(({ k, m }) => ({ name: k, w: Number(m![1]), size: MEDIA[k] }))
    .sort((a, b) => a.w - b.w);
}

function srcSet(id: string) {
  const v = variants(id);
  if (!v.length) throw new Error(`Нет веб-вариантов кадра «${id}» — запустите tools/web/media_variants.py`);
  return { v, set: v.map((x) => `${url(x.name)} ${x.size[0]}w`).join(", "), largest: v[v.length - 1] };
}

type PictureProps = {
  /** id кадра без ширины: «story-coast». */
  id: string;
  /** Вариант для телефона: «story-coast-m». */
  mobileId?: string;
  alt: string;
  sizes: string;
  mobileSizes?: string;
  className?: string;
  imgClassName?: string;
  /** object-position на ПК и на телефоне (кадрирование). */
  pos?: string;
  posMobile?: string;
  /** Кадр в первом экране — грузить сразу. Все остальные — лениво. */
  eager?: boolean;
  decorative?: boolean;
  data?: Record<string, string>;
};

/** <picture> с вариантом для телефона. Атмосферный кадр всегда помечен data-atmosphere. */
export function Picture({ id, mobileId, alt, sizes, mobileSizes = "100vw", className = "", imgClassName = "", pos, posMobile, eager = false, decorative = false, data }: PictureProps) {
  const desk = srcSet(id);
  const mob = mobileId ? srcSet(mobileId) : null;
  const [w, h] = desk.v[0].size;
  return (
    <picture className={className} {...data}>
      {mob ? <source media={PHONE} srcSet={mob.set} sizes={mobileSizes} width={mob.v[0].size[0]} height={mob.v[0].size[1]} /> : null}
      <img
        src={url(desk.largest.name)}
        srcSet={desk.set}
        sizes={sizes}
        width={w}
        height={h}
        alt={decorative ? "" : alt}
        aria-hidden={decorative || undefined}
        data-atmosphere=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "auto" : "low"}
        draggable={false}
        className={`block h-full w-full object-cover object-[var(--pos,50%_50%)] max-md:object-[var(--pos-m,var(--pos,50%_50%))] ${imgClassName}`}
        style={{ ...(pos ? { "--pos": pos } : {}), ...(posMobile ? { "--pos-m": posMobile } : {}) } as CSSProperties}
      />
    </picture>
  );
}

type PhotoProps = Omit<PictureProps, "className" | "data"> & {
  /** Как открывается: маска снизу вверх, из центра или без анимации (внутри сцен со scrub). */
  reveal?: "photo" | "photo-center" | "none";
  className?: string;
  /** Атрибуты для GSAP-сцен (data-*), чтобы найти кадр; внутренний слой — [data-photo-in]. */
  data?: Record<string, string>;
  children?: ReactNode;
};

/**
 * Кадр в рамке с маской-раскрытием: .photo > .photo-mask > .photo-in (масштаб 1,15 → 1).
 * Та же разметка, что у плейсхолдеров, поэтому data-reveal и GSAP-сцены работают без изменений.
 * Видео позже: <video muted playsInline loop preload="none" poster={…}> кладётся внутрь .photo-in
 * вместо <Picture> (или поверх неё), постер — этот же кадр.
 */
export function Photo({ reveal = "photo", className = "", data, children, ...pic }: PhotoProps) {
  return (
    <div className={`photo ${className}`} {...(reveal !== "none" ? { "data-reveal": reveal } : {})} {...data}>
      <div className="photo-mask">
        <Picture {...pic} className="photo-in" data={{ "data-photo-in": "" }} />
        {children}
      </div>
    </div>
  );
}

/** Вырезанный предмет на прозрачном фоне (pack-*, sticker-*): одна ширина, тень — общая через CSS. */
export function Cutout({ name, alt, className = "", decorative = false }: { name: MediaName; alt: string; className?: string; decorative?: boolean }) {
  const [w, h] = MEDIA[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статический экспорт: next/image здесь не оптимизирует, файл уже подготовлен
    <img
      src={url(name)}
      width={w}
      height={h}
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      data-atmosphere=""
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      draggable={false}
      className={`cutout block h-auto w-full select-none ${className}`}
    />
  );
}

/**
 * Фон-текстура разворота (туф, лён, штукатурка с тенью, вода). Лежит под содержимым (-z-10),
 * поэтому у секции должен быть класс isolate. Непрозрачность и режим наложения — через className.
 */
export function Texture({ id, mobileId, className = "", pos, posMobile }: { id: string; mobileId?: string; className?: string; pos?: string; posMobile?: string }) {
  return (
    <Picture
      id={id}
      mobileId={mobileId}
      alt=""
      decorative
      sizes="100vw"
      pos={pos}
      posMobile={posMobile}
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
    />
  );
}

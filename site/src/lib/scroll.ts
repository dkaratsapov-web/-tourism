import type Lenis from "lenis";

/**
 * Общий доступ к Lenis без React-состояния: его ставит SmoothScroll,
 * а читают кнопки и ссылки, которым нужно плавно прокрутить к якорю.
 */
export const scroller: { lenis: Lenis | null } = { lenis: null };

/** Прокрутить к элементу с учётом высоты шапки. Без Lenis — обычный переход по якорю. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
  if (scroller.lenis) scroller.lenis.scrollTo(el, { offset: -header });
  else el.scrollIntoView({ block: "start" });
}

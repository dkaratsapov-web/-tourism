/**
 * Общие константы сайта. Всё, что зависит от Натальи и ещё не подтверждено, собрано здесь.
 */

/**
 * Ссылка на Telegram для заявок. Уточнить у Натальи: личный аккаунт или рабочий бот.
 * Пока сайт на GitHub Pages (без сервера), форма собирает текст и открывает эту ссылку.
 */
export const TELEGRAM_URL = "https://t.me/";

/** Собирает ссылку на Telegram с заполненным текстом сообщения. */
export function telegramLink(text: string) {
  return `${TELEGRAM_URL}?text=${encodeURIComponent(text)}`;
}

/** Якорь блока заявки — на него ведут все кнопки «Обсудить поездку». */
export const LEAD_ID = "zayavka";

/** Публичный адрес обработчика заявок. Секреты отправки хранятся в обработчике. */
export const LEAD_ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;

export function isContact(raw: string) {
  const v = raw.trim();
  const phone = /^[+\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 10;
  const telegram = /^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(v) || /(^|\/\/)t\.me\/[a-zA-Z0-9_]{5,}/.test(v);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  return phone || telegram || email;
}
export const LEAD_DIALOG_ID = "trip-dialog";
export const LEAD_DIALOG_EVENT = "ft:open-lead-dialog";

/** Пункты основного меню. */
export const NAV = [
  { id: "formaty", label: "Форматы" },
  { id: "natalia", label: "Наталья" },
  { id: "kak-rabotaem", label: "Как мы работаем" },
] as const;

/** Направления — общие для табло вылетов и чипов формы. */
export const DESTINATIONS = [
  { code: "AYT", city: "АНТАЛИЯ", chip: "Анталия и побережье", text: "Отели на побережье" },
  { code: "BJV", city: "БОДРУМ", chip: "Эгейское побережье", text: "Эгейское побережье" },
  { code: "NAV", city: "КАППАДОКИЯ", chip: "Каппадокия", text: "Маршрут по стране" },
  { code: "IST", city: "СТАМБУЛ", chip: "Стамбул", text: "Город и сочетание с морем" },
] as const;

export type TripDestination = (typeof DESTINATIONS)[number];

export function openLeadDialog(destination?: TripDestination) {
  window.dispatchEvent(new CustomEvent(LEAD_DIALOG_EVENT, { detail: destination }));
}

/** Путь к файлу из public/ с учётом basePath GitHub Pages. */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

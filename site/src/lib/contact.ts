export const CONTACT_LABELS = {
  phone: "Телефон",
  telegram: "Telegram",
  email: "Почта",
} as const;

export type ContactMethod = keyof typeof CONTACT_LABELS;

export const CONTACT_ERRORS: Record<ContactMethod, string> = {
  phone: "Введите 10 цифр номера после +7.",
  telegram: "Введите имя Telegram латиницей, от 5 до 32 символов.",
  email: "Введите адрес электронной почты.",
};

export function phoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  if (value.trimStart().startsWith("+7") || /^[78]\d{10}$/.test(digits)) return digits.slice(1, 11);
  return digits.slice(0, 10);
}

export function maskPhone(digits: string) {
  if (!digits) return "";
  let text = `+7 (${digits.slice(0, 3)}`;
  if (digits.length > 3) text += `) ${digits.slice(3, 6)}`;
  if (digits.length > 6) text += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) text += `-${digits.slice(8)}`;
  return text;
}

export function telegramUsername(value: string) {
  return value.trim().replace(/^(?:https?:\/\/)?(?:www\.)?t\.me\//i, "").split(/[/?#]/)[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32);
}

export function readContact(data: FormData) {
  const method = data.get("contactMethod");
  const raw = String(data.get("contact") ?? "").trim();
  if (method === "telegram") {
    const username = telegramUsername(raw);
    return { method, value: /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username) ? `@${username}` : "" } as const;
  }
  if (method === "email") {
    return { method, value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw : "" } as const;
  }
  const digits = phoneDigits(raw);
  return { method: "phone", value: digits.length === 10 ? `+7${digits}` : "" } as const;
}

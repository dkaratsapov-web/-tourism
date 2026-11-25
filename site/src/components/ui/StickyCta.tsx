import { TELEGRAM_URL } from "@/lib/site";

const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
const telegram = process.env.NEXT_PUBLIC_CONTACT_TELEGRAM?.trim() || (TELEGRAM_URL === "https://t.me/" ? undefined : TELEGRAM_URL);
const button = "pointer-events-auto grid size-12 place-items-center rounded-full border border-white/20 bg-[var(--ink)] text-white shadow-lg disabled:opacity-65";

export function StickyCta() {
  const contacts = [
    { label: "Позвонить", href: phone ? `tel:${phone}` : undefined, path: "M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-1.5 2A14 14 0 0 1 7 9.5L9 8 7 3Z" },
    { label: "Написать в Telegram", href: telegram, path: "m3 10 18-7-4 18-6-5-4 2 1-6 9-6-8 8" },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(12px+env(safe-area-inset-bottom))] z-40 flex justify-between md:hidden">
      {contacts.map(({ label, href, path }) => {
        const icon = <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>;
        return href ? (
          <a key={label} href={href} aria-label={label} className={button}>{icon}</a>
        ) : (
          <button key={label} type="button" disabled aria-label={`${label} — контакт пока не указан`} className={button}>{icon}</button>
        );
      })}
    </div>
  );
}

import { TELEGRAM_URL } from "@/lib/site";

/** Подвал: узкий мастхед, контакты и юридические заглушки (152-ФЗ — документы готовятся). */
export function Footer() {
  return (
    <footer className="bg-[var(--ink)] px-[var(--gutter)] pb-[calc(96px+env(safe-area-inset-bottom))] pt-16 text-[var(--paper)] md:pb-10 md:pt-24">
      <p aria-hidden className="display overflow-hidden whitespace-nowrap text-[23vw] leading-[0.8] [--wdth:62.5] [--wght:600] md:text-[17.4vw]">
        Fashion Tours
      </p>
      <div className="mt-12 grid gap-8 border-t border-[var(--paper)]/15 pt-8 text-[15px] md:grid-cols-3">
        <div>
          <p className="label text-[var(--sky)]">Связь</p>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener" className="link-draw mt-3 inline-flex h-11 items-center">
            Telegram — ссылку уточнить у Натальи
          </a>
        </div>
        <div>
          <p className="label text-[var(--sky)]">Документы</p>
          <p className="mt-3 leading-[1.6] text-[var(--paper)]/75">Политика обработки персональных данных и реквизиты — готовятся.</p>
        </div>
        <div>
          <p className="label text-[var(--sky)]">О материалах</p>
          <p className="mt-3 leading-[1.6] text-[var(--paper)]/75">
            Атмосферные кадры — плейсхолдеры будущей генерации, а не фото наших туристов. Тексты — черновик для согласования с Натальей.
          </p>
        </div>
      </div>
    </footer>
  );
}

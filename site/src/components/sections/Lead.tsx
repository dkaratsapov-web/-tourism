"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DESTINATIONS, LEAD_DIALOG_EVENT, LEAD_DIALOG_ID, LEAD_ID, TELEGRAM_URL, telegramLink, type TripDestination } from "@/lib/site";
import { CONTACT_ERRORS, CONTACT_LABELS, readContact, type ContactMethod } from "@/lib/contact";
import { ContactFields } from "@/components/ui/ContactFields";
import { Chars } from "@/components/ui/Type";
import { Stamp } from "@/components/ui/Stamp";
import { Picture, Texture } from "@/components/ui/Media";

const CHIPS = [...DESTINATIONS.map((d) => d.chip), "Маршрут по стране", "Пока не знаю"];

type Errors = Partial<Record<"name" | "contact" | "consent", string>>;

const field =
  "mt-2 block w-full rounded-[10px] border border-[var(--ink)]/25 bg-[var(--white)] px-4 py-3.5 text-[16px] text-[var(--ink)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--ink-soft)] focus:border-[var(--aegean)] focus:shadow-[0_0_0_3px_rgb(169_205_235/0.7)] aria-[invalid=true]:border-[var(--brick)]";

/** Текст сообщения, который уйдёт в Telegram. */
function buildMessage(v: { name: string; contact: string; contactMethod: ContactMethod; when: string; who: string; dest: string[]; comment: string }) {
  return [
    "Заявка с сайта Fashion Tours",
    `Имя: ${v.name}`,
    `${CONTACT_LABELS[v.contactMethod]}: ${v.contact}`,
    v.when && `Когда: ${v.when}`,
    v.who && `Кто едет: ${v.who}`,
    v.dest.length ? `Куда: ${v.dest.join(", ")}` : "",
    v.comment && `Комментарий: ${v.comment}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Заявка — посадочный талон с перфорацией и отрывным корешком.
 * Пока сайт на GitHub Pages (без сервера), отправка собирает текст и открывает Telegram.
 * Сроки ответа не обещаем. Без JavaScript форма уходит обычным GET-переходом на ссылку Telegram.
 */
export function Lead({ popup }: { popup?: { destination?: TripDestination } }) {
  const reduced = useReducedMotion();
  const uid = useId();
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [who, setWho] = useState("");
  const [comment, setComment] = useState("");
  const [dest, setDest] = useState<string[]>(() => popup?.destination ? [popup.destination.chip] : []);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggle = (c: string) => setDest((d) => (d.includes(c) ? d.filter((x) => x !== c) : [...d, c]));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    const { value: contact, method: contactMethod } = readContact(new FormData(e.currentTarget));
    if (!name.trim()) next.name = "Напишите, как к вам обращаться.";
    if (!contact) next.contact = CONTACT_ERRORS[contactMethod];
    if (!consent) next.consent = "Без согласия на обработку данных мы не можем принять заявку.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`${uid}-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    const text = buildMessage({ name: name.trim(), contact, contactMethod, when, who, dest, comment });
    window.open(telegramLink(text), "_blank", "noopener");
    setSent(text);
  };

  const copy = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="mt-1.5 text-[14px] text-[var(--brick)]">
        {errors[k]}
      </p>
    ) : null;

  const headingId = popup ? `${LEAD_DIALOG_ID}-title` : "lead-title";

  return (
    <section id={popup ? undefined : LEAD_ID} aria-labelledby={headingId} className={`relative isolate overflow-hidden ${popup ? "bg-[var(--paper)] p-4 pt-6 sm:p-7" : "bg-[var(--tuff)] px-[var(--gutter)] py-20 md:py-28"}`}>
      {/* Фон — туф Каппадокии. */}
      {!popup && <Texture id="tex-lead-stone" className="opacity-75" pos="50% 50%" />}
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-[var(--ink)]">{popup?.destination ? `${popup.destination.code} · ${popup.destination.city}` : "Заявка"}</p>
            {popup ? (
              <h2 id={headingId} className="display mt-3 pr-8 text-[clamp(2.15rem,5vw,3.4rem)]">Обсудим <em>поездку?</em></h2>
            ) : (
              <Chars id={headingId} text="Обсудим вашу поездку?" italicFrom={1} className="display mt-4 text-[clamp(2.8rem,7vw,7.4rem)]" />
            )}
          </div>
          {!popup && <p className="max-w-[26rem] text-[16px] leading-[1.55] text-[var(--ink)]">
            Заполните талон — откроется Telegram с готовым текстом заявки. Укажите, как вам удобнее получить ответ. Можно сразу{" "}
            <a href={TELEGRAM_URL} target="_blank" rel="noopener" className="font-medium underline decoration-1 underline-offset-4">
              написать в Telegram
            </a>
            .
          </p>}
        </div>

        <div data-reveal={popup ? undefined : "fade"} className={`relative ${popup ? "mt-5" : "mt-10 md:mt-14"}`}>
          {!popup && <Stamp kind="tag" rotate={12} className="absolute -right-5 top-[30%] z-10 hidden w-20 lg:block" id="st-lead-tag" />}
          <div className={`relative isolate grid overflow-visible rounded-[18px] bg-[var(--white)] shadow-[0_40px_70px_-40px_rgb(19_41_75/0.55)] ${popup ? "" : "md:grid-cols-[1fr_auto_300px]"}`}>
            {/* Талон на льне: фактура только в полях талона, поля ввода остаются белыми. */}
            <Picture id="tex-linen" alt="" decorative sizes="(min-width: 768px) 1240px, 100vw" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[18px] opacity-80 mix-blend-multiply" />
            {/* Основная часть талона — поля формы. */}
            <form
              noValidate
              onSubmit={submit}
              method="dialog"
              aria-label="Заявка на подбор поездки"
              className="min-w-0"
            >
              <div className={`flex items-center justify-between rounded-t-[18px] bg-[var(--ink)] px-5 py-3.5 text-[var(--paper)] ${popup ? "" : "md:rounded-tr-none md:px-9"}`}>
                <span className="label">Fashion Tours · посадочный талон</span>
                <span className="label hidden text-[var(--sky)] sm:inline">Рейс: Турция</span>
              </div>
              <div className={`grid gap-5 md:grid-cols-2 ${popup ? "p-4 sm:p-6" : "p-6 md:gap-6 md:p-9"}`}>
                <div>
                  <label htmlFor={`${uid}-name`} className="label text-[var(--ink-soft)]">
                    Как к вам обращаться *
                  </label>
                  <input
                    id={`${uid}-name`}
                    name="name"
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                    className={field}
                  />
                  {err("name")}
                </div>
                <ContactFields
                  id={`${uid}-contact`}
                  inputClass={field}
                  labelClass="label text-[var(--ink-soft)]"
                  error={errors.contact}
                  onEdit={() => setErrors((previous) => previous.contact ? { ...previous, contact: undefined } : previous)}
                />
                <div>
                  <label htmlFor={`${uid}-when`} className="label text-[var(--ink-soft)]">
                    Когда планируете
                  </label>
                  <input id={`${uid}-when`} name="when" value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Например, вторая половина июня" className={field} />
                </div>
                <div>
                  <label htmlFor={`${uid}-who`} className="label text-[var(--ink-soft)]">
                    Кто едет
                  </label>
                  <input id={`${uid}-who`} name="who" value={who} onChange={(e) => setWho(e.target.value)} placeholder="Двое взрослых и ребёнок 6 лет" className={field} />
                </div>
                <fieldset className="md:col-span-2">
                  <legend className="label text-[var(--ink-soft)]">Куда хочется</legend>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {CHIPS.map((c) => {
                      const on = dest.includes(c);
                      return (
                        <label
                          key={c}
                          className={`flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-[15px] transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--aegean)] ${
                            on ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--ink)]/25 bg-[var(--white)] hover:border-[var(--ink)]"
                          }`}
                        >
                          <input type="checkbox" name="dest" value={c} checked={on} onChange={() => toggle(c)} className="sr-only" />
                          {c}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="md:col-span-2">
                  <label htmlFor={`${uid}-comment`} className="label text-[var(--ink-soft)]">
                    Пара слов о поездке
                  </label>
                  <textarea id={`${uid}-comment`} name="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className={`${field} resize-y`} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor={`${uid}-consent`} className="flex cursor-pointer items-start gap-3 text-[14px] leading-[1.5] text-[var(--ink-soft)]">
                    <input
                      id={`${uid}-consent`}
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      aria-invalid={!!errors.consent}
                      aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ink)]"
                    />
                    <span>Согласен(на) на обработку персональных данных по 152-ФЗ. Политика обработки данных — документ готовится.</span>
                  </label>
                  {err("consent")}
                </div>
                <div className="flex flex-wrap items-center gap-4 md:col-span-2">
                  <button
                    type="submit"
                    className="group relative isolate inline-flex h-14 items-center gap-3 overflow-hidden rounded-full bg-[var(--ink)] px-8 text-[16px] font-medium text-[var(--paper)] transition-transform duration-150 active:scale-[0.97]"
                  >
                    <span aria-hidden className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[var(--aegean)] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                    Отправить в Telegram
                  </button>
                  <span className="text-[14px] text-[var(--ink-soft)]">* — обязательные поля</span>
                </div>
              </div>
            </form>

            {!popup && <>
              <div className="perf-h [--notch:var(--tuff)] md:hidden" />
              <div className="perf-v hidden [--notch:var(--tuff)] md:block" />
            </>}

            {/* Корешок: повторяет введённое; после отправки отрывается по перфорации. */}
            {(!popup || sent) && <div className="relative min-h-[260px]">
              <AnimatePresence mode="wait" initial={false}>
                {!sent ? (
                  <motion.div
                    key="stub"
                    className="flex h-full flex-col p-6 md:p-8"
                    exit={reduced ? { opacity: 0 } : { rotate: 6, y: 140, opacity: 0, transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }}
                    style={{ transformOrigin: "0% 0%" }}
                  >
                    <p className="label text-[var(--ink-soft)]">Корешок</p>
                    <dl className="mt-5 space-y-4">
                      {[
                        ["Пассажир", name || "—"],
                        ["Куда", dest.length ? dest.join(", ") : "—"],
                        ["Когда", when || "—"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="label text-[var(--ink-soft)]">{k}</dt>
                          <dd className="mt-1 break-words text-[16px] font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div aria-hidden className="mt-auto flex items-end justify-between pt-8">
                      <div className="flex h-10 items-end gap-[3px]">
                        {[2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2].map((w, i) => (
                          <span key={i} className="h-full bg-[var(--ink)]" style={{ width: w }} />
                        ))}
                      </div>
                      <Stamp kind="turkiye" rotate={-12} className="w-24" id="st-stub" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="done"
                    role="status"
                    className="flex h-full flex-col p-6 md:p-8"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: reduced ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] } }}
                  >
                    <p className="label text-[var(--brick)]">Талон оторван</p>
                    <p className="display mt-4 text-[34px] leading-[1.05]">
                      Текст заявки <em>готов</em>
                    </p>
                    <p className="mt-3 text-[15px] leading-[1.55] text-[var(--ink-soft)]">
                      Мы открыли Telegram с этим текстом — отправьте его Наталье. Если окно не открылось, скопируйте текст.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a href={telegramLink(sent)} target="_blank" rel="noopener" className="inline-flex h-11 items-center rounded-full bg-[var(--ink)] px-5 text-[14px] font-medium text-[var(--paper)]">
                        Открыть Telegram
                      </a>
                      <button type="button" onClick={copy} className="inline-flex h-11 items-center rounded-full border border-[var(--ink)]/30 px-5 text-[14px] font-medium">
                        {copied ? "Скопировано" : "Скопировать текст"}
                      </button>
                    </div>
                    <button type="button" onClick={() => { setSent(null); requestAnimationFrame(() => document.getElementById(`${uid}-name`)?.focus()); }} className="mt-4 h-11 w-fit text-[14px] text-[var(--ink-soft)] underline underline-offset-4">
                      Изменить заявку
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LeadDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [popup, setPopup] = useState<{ destination?: TripDestination } | null>(null);

  useEffect(() => {
    const show = (event: Event) => {
      const destination = (event as CustomEvent<TripDestination | undefined>).detail;
      setPopup({ destination });
      const el = dialog.current;
      if (el && !el.open) el.showModal();
    };
    window.addEventListener(LEAD_DIALOG_EVENT, show);
    return () => window.removeEventListener(LEAD_DIALOG_EVENT, show);
  }, []);

  return (
    <dialog
      ref={dialog}
      id={LEAD_DIALOG_ID}
      aria-labelledby={`${LEAD_DIALOG_ID}-title`}
      data-lenis-prevent
      onClose={() => setPopup(null)}
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),44rem)] max-w-none overflow-y-auto overscroll-contain rounded-[24px] bg-[var(--paper)] text-[var(--ink)] shadow-[0_22px_90px_rgb(19_41_75/0.38)] backdrop:bg-[var(--ink)]/65 backdrop:backdrop-blur-[4px]"
    >
      <div className="pointer-events-none sticky top-0 z-20 -mb-14 flex h-14 justify-end p-2 sm:p-3">
        <button type="button" aria-label="Закрыть заявку" onClick={() => dialog.current?.close()} className="pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-[var(--ink)]/15 bg-[var(--paper)] text-[25px] hover:bg-[var(--white)]">×</button>
      </div>
      {popup && <Lead popup={popup} />}
    </dialog>
  );
}

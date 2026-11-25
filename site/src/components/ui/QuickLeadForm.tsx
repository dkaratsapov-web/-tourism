"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { LEAD_ENDPOINT } from "@/lib/site";
import { CONTACT_ERRORS, readContact } from "@/lib/contact";
import { ContactFields } from "@/components/ui/ContactFields";

export function QuickLeadForm({ source }: { source: "hero" | "process" | "terrace" }) {
  const compact = source !== "process";
  const titleId = useId();
  const sending = useRef(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactVersion, setContactVersion] = useState(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const { value: contact, method: contactMethod } = readContact(data);
    if (!name || !contact) {
      setStatus("error");
      setMessage(name ? "" : "Укажите ваше имя.");
      setContactError(name && !contact ? CONTACT_ERRORS[contactMethod] : "");
      (form.elements.namedItem(name ? "contact" : "name") as HTMLInputElement)?.focus({ preventScroll: true });
      return;
    }
    if (!data.has("consent")) {
      setStatus("error");
      setMessage("Подтвердите согласие на обработку данных.");
      return;
    }
    if (!LEAD_ENDPOINT) {
      setStatus("error");
      setMessage("Отправка заявок пока недоступна.");
      return;
    }

    sending.current = true;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, contactMethod, consent: true, source }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      setContactVersion((version) => version + 1);
      setStatus("sent");
      setMessage("Заявка отправлена.");
    } catch {
      setStatus("error");
      setMessage("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      sending.current = false;
    }
  };

  const input = "mt-1 w-full rounded-lg border border-[var(--ink)]/20 bg-[var(--white)] px-3 py-2.5 text-[16px] text-[var(--ink)] placeholder:text-[var(--ink-soft)]";

  return (
    <form method="dialog" aria-labelledby={titleId} onSubmit={submit} className={compact ? "max-w-[35rem] rounded-[18px] border border-[var(--ink)]/10 bg-[var(--paper)]/95 p-4 shadow-[0_18px_42px_-30px_rgb(19_41_75/0.65)] md:px-5" : "mt-6 max-w-[24rem] rounded-[18px] bg-[var(--paper)] p-5 shadow-[0_22px_44px_-30px_rgb(19_41_75/0.6)] md:p-6"}>
      <h3 id={titleId} className={compact ? "display text-[25px]" : "display text-[29px]"}>Расскажите о поездке</h3>
      <div className="mt-3">
        <ContactFields
          key={contactVersion}
          inputClass={input}
          labelClass="block text-[14px] font-medium"
          error={contactError}
          onEdit={() => setContactError("")}
          leadingField={
            <label className="block min-w-0 text-[14px] font-medium">
              Имя
              <input className={input} name="name" autoComplete="given-name" required />
            </label>
          }
        />
      </div>
      <div className={compact ? "mt-3 grid gap-3 sm:flex sm:items-center sm:justify-between" : ""}>
        <label className={`flex items-start gap-2 text-[13px] leading-snug text-[var(--ink-soft)] ${compact ? "" : "mt-3"}`}>
          <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-[var(--ink)]" />
          Согласие на обработку персональных данных
        </label>
        <button type="submit" disabled={status === "sending"} className={`flex min-h-11 shrink-0 cursor-pointer items-center justify-between gap-3 rounded-full bg-[var(--ink)] px-4 py-2 text-[14px] font-medium text-[var(--paper)] transition-colors hover:bg-[var(--aegean)] disabled:cursor-wait disabled:opacity-70 ${compact ? "" : "mt-4 w-full"}`}>
          {status === "sending" ? "Отправляем…" : "Отправить заявку"} <span aria-hidden>→</span>
        </button>
      </div>
      <p role="status" className={message ? `mt-3 text-[14px] ${status === "error" ? "text-[var(--brick)]" : "text-[var(--ink)]"}` : "sr-only"}>{message}</p>
    </form>
  );
}

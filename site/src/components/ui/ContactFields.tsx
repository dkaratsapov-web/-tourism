"use client";

import { useId, useState, type ReactNode } from "react";
import { CONTACT_LABELS, maskPhone, phoneDigits, telegramUsername, type ContactMethod } from "@/lib/contact";

const METHODS = ["phone", "telegram", "email"] as const;
const INPUTS = {
  phone: { label: "Номер телефона", type: "tel", inputMode: "numeric", autoComplete: "tel", placeholder: "+7 (___) ___-__-__" },
  telegram: { label: "Имя в Telegram", type: "text", inputMode: "text", autoComplete: "off", placeholder: "@username" },
  email: { label: "Адрес электронной почты", type: "email", inputMode: "email", autoComplete: "email", placeholder: "name@example.com" },
} as const;

export function ContactFields({
  id,
  inputClass,
  labelClass,
  error,
  onEdit,
  leadingField,
}: {
  id?: string;
  inputClass: string;
  labelClass: string;
  error?: string;
  onEdit?: () => void;
  leadingField?: ReactNode;
}) {
  const uid = useId();
  const inputId = id ?? uid;
  const [method, setMethod] = useState<ContactMethod>("phone");
  const [drafts, setDrafts] = useState({ phone: "", telegram: "", email: "" });
  const { label, ...inputProps } = INPUTS[method];

  return (
    <fieldset className="min-w-0">
      <legend className={labelClass}>Удобный способ связи</legend>
      <div className="mt-1 inline-flex max-w-full flex-wrap gap-0.5 rounded-xl border border-[var(--ink)]/12 bg-[var(--ink)]/5 p-0.5">
        {METHODS.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name="contactMethod"
              value={option}
              checked={method === option}
              onChange={() => { setMethod(option); onEdit?.(); }}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-9 items-center rounded-[9px] px-2.5 text-[13px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--white)] peer-checked:bg-[var(--ink)] peer-checked:text-[var(--paper)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--aegean)]">
              {CONTACT_LABELS[option]}
            </span>
          </label>
        ))}
      </div>
      <div className={leadingField ? "mt-2 grid gap-3 sm:grid-cols-2" : "mt-1"}>
        {leadingField}
        <div className="min-w-0">
          <label htmlFor={inputId} className={leadingField ? labelClass : "sr-only"}>{label}</label>
          <input
            key={method}
            id={inputId}
            name="contact"
            {...inputProps}
            autoCapitalize="none"
            spellCheck={false}
            required
            value={drafts[method]}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-err` : undefined}
            onChange={(event) => {
              const value = event.target.value;
              let formatted = value;
              if (method === "phone") formatted = maskPhone(phoneDigits(value));
              if (method === "telegram") {
                const username = telegramUsername(value);
                formatted = username ? `@${username}` : "";
              }
              setDrafts((previous) => ({ ...previous, [method]: formatted }));
              onEdit?.();
            }}
            className={inputClass}
          />
          {error && <p id={`${inputId}-err`} className="mt-1.5 text-[14px] text-[var(--brick)]">{error}</p>}
        </div>
      </div>
    </fieldset>
  );
}

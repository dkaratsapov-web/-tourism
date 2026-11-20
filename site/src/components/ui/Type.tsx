import { Fragment, type ElementType, type ReactNode } from "react";

type LinesProps = {
  as?: ElementType;
  lines: ReactNode[];
  className?: string;
  id?: string;
  style?: React.CSSProperties;
};

/**
 * Заголовок, который набирается по строкам: маска снизу вверх, 80 мс между строками.
 * Строки задаются вручную — так контролируем перенос и не зависим от разбивки в JavaScript.
 */
export function Lines({ as: Tag = "h2", lines, className = "", id, style }: LinesProps) {
  return (
    <Tag id={id} data-reveal="lines" className={className} style={style}>
      {lines.map((l, i) => (
        <span key={i} className="ln">
          <span style={{ "--i": i } as React.CSSProperties}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

type CharsProps = { as?: ElementType; text: string; className?: string; id?: string; italicFrom?: number; reveal?: boolean };

/**
 * Акцентный заголовок, разбитый по буквам. Скринридер читает целую строку,
 * буквы скрыты от него. italicFrom — с какого слова начинается курсив.
 */
/* reveal={false} — буквами управляет GSAP-сцена, CSS-переход не нужен. */
export function Chars({ as: Tag = "h2", text, className = "", id, italicFrom, reveal = true }: CharsProps) {
  let n = 0;
  const words = text.split(" ");
  return (
    <Tag id={id} data-reveal={reveal ? "chars" : undefined} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, wi) => {
          const it = italicFrom !== undefined && wi >= italicFrom;
          return (
            <Fragment key={wi}>
              <span className={`inline-block whitespace-nowrap overflow-clip pb-[0.12em] -mb-[0.12em] ${it ? "it" : ""}`}>
                {[...w].map((c, ci) => (
                  <span key={ci} className="ch" style={{ "--i": n++ } as React.CSSProperties}>
                    {c}
                  </span>
                ))}
              </span>
              {wi < words.length - 1 ? " " : null}
            </Fragment>
          );
        })}
      </span>
    </Tag>
  );
}

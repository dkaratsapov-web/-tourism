/**
 * Паспортные штампы, бирка багажа и марка авиапочты — собственные SVG.
 * Цвет — кирпичный или чернила. Все штампы декоративные (aria-hidden).
 * reveal="view" — влетают при входе в экран (RevealObserver), "load" — при загрузке (CSS), "none" — стоят на месте.
 */
type Kind = "turkiye" | "ayt" | "ist" | "nav" | "bjv" | "tag" | "airmail";

type Props = {
  kind: Kind;
  tone?: "brick" | "ink";
  rotate?: number;
  delay?: number;
  reveal?: "view" | "load" | "none";
  className?: string;
  id?: string;
};

const CODES: Record<"ayt" | "ist" | "nav" | "bjv", [string, string]> = {
  ayt: ["AYT", "ANTALYA"],
  ist: ["IST", "İSTANBUL"],
  nav: ["NAV", "KAPADOKYA"],
  bjv: ["BJV", "BODRUM"],
};

const FONT = "var(--font-text), system-ui, sans-serif";
const SERIF = "var(--font-display-face), serif";

/** Силуэт самолёта для центра штампа. */
function Plane({ c, x, y, s = 1 }: { c: string; x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      fill={c}
      d="M0-15c1.6 0 2.4 1.6 2.4 3.6v7.2L15 2.6v3.2L2.4 2.2v7.4l4 3v2.6L0 13.4l-6.4 1.8v-2.6l4-3V2.2L-15 5.8V2.6l12.6-7.8v-7.2c0-2 .8-3.6 2.4-3.6z"
    />
  );
}

export function Stamp({ kind, tone = "brick", rotate = 0, delay = 0, reveal = "view", className = "", id }: Props) {
  const c = tone === "brick" ? "#a3433b" : "#13294b";
  const uid = id ?? `st-${kind}-${tone}-${Math.abs(rotate)}`;
  const style = { "--r": `${rotate}deg`, "--d": `${delay}ms` } as React.CSSProperties;
  const common = {
    "aria-hidden": true,
    className: `stamp ${reveal === "load" ? "stamp-in" : ""} ${className}`,
    style,
    ...(reveal === "view" ? { "data-reveal": "stamp" } : {}),
  };

  if (kind === "turkiye") {
    return (
      <svg viewBox="0 0 160 160" {...common}>
        <defs>
          <path id={uid} d="M80 80m-58 0a58 58 0 1 1 116 0a58 58 0 1 1-116 0" />
        </defs>
        <circle cx="80" cy="80" r="75" fill="none" stroke={c} strokeWidth="3.5" />
        <circle cx="80" cy="80" r="45" fill="none" stroke={c} strokeWidth="1.5" />
        <text fill={c} style={{ fontFamily: FONT }} fontWeight="600" fontSize="13.5" letterSpacing="2.6">
          <textPath href={`#${uid}`}>TÜRKİYE · GİRİŞ · TÜRKİYE · GİRİŞ ·</textPath>
        </text>
        <Plane c={c} x={80} y={70} s={1.1} />
        <text x="80" y="104" textAnchor="middle" fill={c} style={{ fontFamily: FONT }} fontWeight="700" fontSize="12" letterSpacing="2">
          TR
        </text>
      </svg>
    );
  }

  if (kind === "tag") {
    return (
      <svg viewBox="0 0 130 240" {...common}>
        <path d="M65 8c-14 18-12 40 0 52" fill="none" stroke="#13294b" strokeWidth="1.6" />
        <path d="M22 54l22-22h42l22 22v170a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8z" fill="#ffffff" stroke="#13294b" strokeWidth="2.2" />
        <circle cx="65" cy="52" r="7" fill="#f6f3ec" stroke="#13294b" strokeWidth="2" />
        <rect x="22" y="78" width="86" height="34" fill="#a3433b" />
        <text x="65" y="101" textAnchor="middle" fill="#f6f3ec" style={{ fontFamily: FONT }} fontWeight="700" fontSize="17" letterSpacing="3">
          AYT
        </text>
        <text x="65" y="136" textAnchor="middle" fill="#13294b" style={{ fontFamily: SERIF }} fontStyle="italic" fontSize="17">
          Fashion
        </text>
        <text x="65" y="156" textAnchor="middle" fill="#13294b" style={{ fontFamily: SERIF }} fontStyle="italic" fontSize="17">
          Tours
        </text>
        {[0, 4, 7, 9, 13, 16, 18, 22, 26, 28, 31, 35, 38, 41, 44, 48, 50, 54, 57, 60].map((x, i) => (
          <rect key={i} x={35 + x} y="176" width={i % 3 === 0 ? 2.6 : 1.3} height="34" fill="#13294b" />
        ))}
      </svg>
    );
  }

  if (kind === "airmail") {
    return (
      <svg viewBox="0 0 120 150" {...common}>
        <defs>
          <mask id={uid}>
            <rect x="4" y="4" width="112" height="142" fill="#fff" />
            <rect x="4" y="4" width="112" height="142" fill="none" stroke="#000" strokeWidth="7" strokeDasharray="0 9.4" strokeLinecap="round" />
          </mask>
          <pattern id={`${uid}-p`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="16" fill="#a3433b" />
            <rect x="8" width="8" height="16" fill="#13294b" />
          </pattern>
        </defs>
        <g mask={`url(#${uid})`}>
          <rect x="4" y="4" width="112" height="142" fill="#ffffff" />
          <rect x="12" y="12" width="96" height="126" fill={`url(#${uid}-p)`} />
          <rect x="19" y="19" width="82" height="112" fill="#f6f3ec" />
        </g>
        <circle cx="60" cy="60" r="20" fill="#a9cdeb" />
        <Plane c="#13294b" x={60} y={60} s={0.9} />
        <text x="60" y="104" textAnchor="middle" fill="#13294b" style={{ fontFamily: SERIF }} fontStyle="italic" fontSize="17">
          Авиа
        </text>
        <text x="60" y="120" textAnchor="middle" fill="#a3433b" style={{ fontFamily: FONT }} fontWeight="700" fontSize="8.5" letterSpacing="1.6">
          TÜRKİYE
        </text>
      </svg>
    );
  }

  const [code, city] = CODES[kind];
  return (
    <svg viewBox="0 0 200 124" {...common}>
      <rect x="3" y="3" width="194" height="118" rx="16" fill="none" stroke={c} strokeWidth="3.5" />
      <rect x="11" y="11" width="178" height="102" rx="10" fill="none" stroke={c} strokeWidth="1.3" />
      <text x="100" y="35" textAnchor="middle" fill={c} style={{ fontFamily: FONT }} fontWeight="600" fontSize="12" letterSpacing="3.4">
        {city}
      </text>
      <text x="100" y="84" textAnchor="middle" fill={c} style={{ fontFamily: FONT }} fontWeight="800" fontSize="50" letterSpacing="5">
        {code}
      </text>
      <line x1="26" y1="96" x2="174" y2="96" stroke={c} strokeWidth="1.3" />
      <text x="100" y="108" textAnchor="middle" fill={c} style={{ fontFamily: FONT }} fontWeight="600" fontSize="8.5" letterSpacing="2.4">
        VARIŞ · FASHION TOURS
      </text>
    </svg>
  );
}

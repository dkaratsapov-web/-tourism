import type { Metadata, Viewport } from "next";
import { Noto_Serif_Display, Onest } from "next/font/google";
import "./globals.css";

// Антиква мастхеда и заголовков: оси ширины (wdth 62,5–100) и насыщенности, прямое и курсивное начертание.
const display = Noto_Serif_Display({
  variable: "--font-display-face",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  display: "swap",
});

// Гротеск для текста и служебных строк. latin-ext — для турецких букв в штампах (İ, Ş).
const text = Onest({
  variable: "--font-text",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fashion Tours — отдых и маршруты по Турции под вашу семью",
  description:
    "Онлайн-турагентство Натальи: отели на побережье и индивидуальные маршруты по Турции — Анталия, Эгейское побережье, Бодрум, Каппадокия, Стамбул.",
  openGraph: {
    title: "Fashion Tours — Турция, собранная под вашу семью",
    description: "Отели на побережье и маршруты по стране: Каппадокия, Эгейское побережье, Бодрум, Стамбул.",
    locale: "ru_RU",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f3ec",
  colorScheme: "light",
  viewportFit: "cover",
};

// Класс js ставится до первой отрисовки: скрытые начальные состояния анимаций действуют только при живом JavaScript.
const JS_FLAG = "document.documentElement.classList.add('js')";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${text.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--paper)] transition-transform focus-visible:translate-y-0"
        >
          Перейти к содержанию
        </a>
        {children}
      </body>
    </html>
  );
}

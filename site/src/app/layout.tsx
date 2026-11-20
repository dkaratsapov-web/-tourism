import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Временные шрифты с кириллицей. Финальная пара — после выбора направления.
const display = Cormorant_Garamond({
  variable: "--font-display-face",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const text = Manrope({
  variable: "--font-text",
  subsets: ["latin", "cyrillic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Fashion Tours — премиальный отдых и индивидуальные поездки по Турции",
  description:
    "Подбираем отели и маршруты по Турции под ваши пожелания: Анталия, Эгейское побережье, Бодрум, Каппадокия, Стамбул.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${text.variable} ${mono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}

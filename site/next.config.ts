import type { NextConfig } from "next";

/**
 * Два режима сборки:
 * - обычный (`npm run build`) — сервер Next.js, для будущего VPS с приёмом заявок;
 * - статический (`npm run build:pages`) — папка `out/` для временного хостинга на GitHub Pages.
 *   Сайт там живёт в подпапке репозитория, поэтому нужен basePath (`/-tourism`).
 */
const isPages = process.env.STATIC_EXPORT === "1";
const basePath = isPages ? process.env.PAGES_BASE_PATH ?? "/-tourism" : "";

const nextConfig: NextConfig = {
  // Частичный пререндер несовместим со статическим экспортом — в режиме Pages выключен.
  cacheComponents: !isPages,
  partialPrefetching: !isPages,
  ...(isPages && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: {
    // Нужен клиентскому коду для путей к файлам из public/ (картинки, видео).
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

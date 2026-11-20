#!/usr/bin/env node
// Аудит сайта глазами браузера: скриншоты ПК и телефона, кадры по ходу скролла,
// запись видео скролла, определение технологий анимации, шрифты, цвета, метрики скорости.
//
// Запуск:  node tools/web/audit.cjs <url> [--out .out/audit/имя] [--frames 12] [--no-video] [--mobile-only|--desktop-only]
// Результат: папка с desktop-*.png, mobile-*.png, scroll-*.webm и report.json.
// Кадры удобно склеить в одну картинку: python3 tools/web/contact_sheet.py <папка>

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
if (!url) {
  console.error('Укажите адрес: node tools/web/audit.cjs https://example.com');
  process.exit(1);
}
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};
const flag = (name) => args.includes(`--${name}`);

const slug = new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '_');
const outDir = path.resolve(opt('out', path.join('.out', 'audit', slug)));
const frames = Number(opt('frames', 12));
fs.mkdirSync(outDir, { recursive: true });

const DEVICES = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false, deviceScaleFactor: 1 },
  {
    name: 'mobile',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  },
].filter((d) => !(flag('mobile-only') && d.name === 'desktop') && !(flag('desktop-only') && d.name === 'mobile'));

// Что ищем на странице: глобальные объекты библиотек и следы в разметке.
function detectInPage() {
  const w = window;
  const has = (k) => typeof w[k] !== 'undefined';
  const scripts = [...document.scripts].map((s) => s.src).filter(Boolean);
  const html = document.documentElement.outerHTML;
  const libs = {
    gsap: has('gsap') ? w.gsap.version || true : /gsap/i.test(scripts.join(' ')),
    scrollTrigger: has('ScrollTrigger') || !!(w.gsap && w.gsap.plugins && w.gsap.plugins.scrollTrigger),
    lenis: has('lenis') || has('Lenis') || document.documentElement.classList.contains('lenis'),
    locomotive: /locomotive/i.test(html.slice(0, 200000)) || !!document.querySelector('[data-scroll-container]'),
    three: has('THREE') || /three(\.module)?(\.min)?\.js/i.test(scripts.join(' ')),
    webgl: [...document.querySelectorAll('canvas')].some((c) => {
      try { return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
    }),
    canvasCount: document.querySelectorAll('canvas').length,
    lottie: has('lottie') || !!document.querySelector('lottie-player, dotlottie-player, [data-animation-path]'),
    rive: /rive/i.test(scripts.join(' ')),
    barba: has('barba'),
    swup: has('swup'),
    swiper: has('Swiper') || !!document.querySelector('.swiper'),
    splitting: has('Splitting') || has('SplitType') || !!document.querySelector('.char, .word, [data-splitting]'),
    framerMotion: /framer-motion|data-framer/i.test(html.slice(0, 300000)),
    nextjs: has('__NEXT_DATA__') || !!document.querySelector('#__next, script[src*="/_next/"]'),
    nuxt: has('__NUXT__'),
    webflow: !!document.querySelector('html[data-wf-site]'),
    tilda: /tilda/i.test(html.slice(0, 200000)),
    wordpress: /wp-content/i.test(html.slice(0, 200000)),
    react: !!document.querySelector('[data-reactroot]') || has('React') || has('__REACT_DEVTOOLS_GLOBAL_HOOK__'),
    vue: has('Vue') || !!document.querySelector('[data-v-app]'),
    videoCount: document.querySelectorAll('video').length,
  };

  // Шрифты, которые реально загружены.
  const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);

  // Частые цвета текста и фона в видимых элементах.
  const colors = {};
  const bump = (c) => { if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') colors[c] = (colors[c] || 0) + 1; };
  [...document.querySelectorAll('body *')].slice(0, 4000).forEach((el) => {
    const s = getComputedStyle(el);
    bump(s.color);
    bump(s.backgroundColor);
  });
  const palette = Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 14);

  const headings = [...document.querySelectorAll('h1, h2, h3')].slice(0, 40).map((h) => ({
    tag: h.tagName.toLowerCase(),
    text: h.innerText.trim().replace(/\s+/g, ' ').slice(0, 140),
    font: getComputedStyle(h).fontFamily.split(',')[0],
    size: getComputedStyle(h).fontSize,
  }));

  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    lang: document.documentElement.lang,
    pageHeight: document.documentElement.scrollHeight,
    libs,
    fonts: [...new Set(fonts)].slice(0, 30),
    palette,
    headings,
    scripts: scripts.slice(0, 60),
  };
}

async function scrollCapture(page, device) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const shots = [];
  for (let i = 0; i <= frames; i++) {
    const y = Math.round((total * i) / frames);
    // Скроллим колесом, а не scrollTo: так срабатывают Lenis и ScrollTrigger.
    const cur = await page.evaluate(() => window.scrollY);
    const delta = y - cur;
    const steps = Math.max(1, Math.ceil(Math.abs(delta) / 120));
    for (let s = 0; s < steps; s++) {
      await page.mouse.wheel(0, delta / steps);
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(700);
    const file = path.join(outDir, `${device.name}-frame-${String(i).padStart(2, '0')}.png`);
    try {
      await page.screenshot({ path: file, timeout: 15000 });
      shots.push(path.basename(file));
    } catch (e) {
      // Тяжёлый кадр (обычно WebGL в программном рендере) — отмечаем и идём дальше.
      shots.push(`ПРОПУЩЕН ${path.basename(file)}: ${e.name}`);
      console.warn(`! ${device.name}: кадр ${i} не снят за 15 с — тяжёлая отрисовка`);
    }
  }
  return shots;
}

(async () => {
  const browser = await chromium.launch();
  const report = { url, date: new Date().toISOString(), devices: {} };

  for (const device of DEVICES) {
    const context = await browser.newContext({
      viewport: device.viewport,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
      deviceScaleFactor: device.deviceScaleFactor,
      userAgent: device.userAgent,
      locale: 'ru-RU',
      recordVideo: flag('no-video') ? undefined : { dir: outDir, size: device.viewport },
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 300)));
    page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 300)));

    // Метрики скорости: LCP и CLS.
    await page.addInitScript(() => {
      window.__vitals = { lcp: 0, cls: 0 };
      try {
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__vitals.lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__vitals.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
      } catch {}
    });

    const t0 = Date.now();
    let status = null;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      status = resp && resp.status();
    } catch (e) {
      consoleErrors.push(`Загрузка: ${e.message.slice(0, 200)}`);
    }
    const loadMs = Date.now() - t0;
    await page.waitForTimeout(2500); // прелоадеры и вступительные анимации

    await page.screenshot({ path: path.join(outDir, `${device.name}-first-screen.png`), timeout: 15000 }).catch(() => console.warn('! первый экран не снят'));
    // CLS отдельно: при загрузке (то, что видит посетитель) и после скролла (пины, подгрузка).
    const clsLoad = await page.evaluate(() => window.__vitals.cls);
    const info = await page.evaluate(detectInPage);
    const shots = await scrollCapture(page, device);
    const vitals = await page.evaluate(() => window.__vitals);
    const transfer = await page.evaluate(() =>
      Math.round(performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0) / 1024)
    );

    // Полная страница одним кадром (анимации по скроллу на ней могут быть не дорисованы).
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `${device.name}-full.png`), fullPage: true }).catch(() => {});

    const video = page.video();
    await context.close();
    let videoFile = null;
    if (video) {
      const src = await video.path();
      videoFile = `scroll-${device.name}.webm`;
      fs.renameSync(src, path.join(outDir, videoFile));
    }

    report.devices[device.name] = {
      status,
      loadMs,
      transferKB: transfer,
      lcpMs: Math.round(vitals.lcp),
      clsLoad: Number(clsLoad.toFixed(3)),
      cls: Number(vitals.cls.toFixed(3)),
      consoleErrors: consoleErrors.slice(0, 20),
      frames: shots,
      video: videoFile,
      ...info,
    };
    console.log(`✓ ${device.name}: HTTP ${status}, загрузка ${loadMs} мс, LCP ${Math.round(vitals.lcp)} мс, ${transfer} КБ`);
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`Готово: ${outDir}`);
})();

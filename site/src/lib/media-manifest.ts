// Сгенерировано tools/web/media_variants.py — не править руками.
/** Размеры веб-вариантов кадров из public/media/w (ширина, высота) — для width/height у <img>. */
export const MEDIA = {
  "hero-aegean-640": [
    640,
    427
  ],
  "hero-aegean-960": [
    960,
    640
  ],
  "hero-aegean-1536": [
    1536,
    1024
  ],
  "story-coast-1120": [
    1120,
    630
  ],
  "story-coast-1672": [
    1672,
    941
  ],
  "story-terrace-1120": [
    1120,
    630
  ],
  "story-terrace-1672": [
    1672,
    941
  ],
  "story-window-1280": [
    1280,
    720
  ],
  "story-window-1920": [
    1920,
    1080
  ],
  "story-flatlay-1280": [
    1280,
    724
  ],
  "story-coast-m-480": [
    480,
    753
  ],
  "story-coast-m-600": [
    600,
    941
  ],
  "story-terrace-m-480": [
    480,
    753
  ],
  "story-terrace-m-600": [
    600,
    941
  ],
  "story-window-m-720": [
    720,
    1273
  ],
  "story-window-m-1080": [
    1080,
    1910
  ],
  "story-flatlay-m-720": [
    720,
    1273
  ],
  "format-coast-800": [
    800,
    597
  ],
  "format-coast-1280": [
    1280,
    956
  ],
  "format-family-800": [
    800,
    600
  ],
  "format-family-1280": [
    1280,
    960
  ],
  "format-cappadocia-800": [
    800,
    600
  ],
  "format-cappadocia-1280": [
    1280,
    960
  ],
  "format-istanbul-800": [
    800,
    600
  ],
  "format-istanbul-1280": [
    1280,
    960
  ],
  "format-route-800": [
    800,
    600
  ],
  "format-route-1280": [
    1280,
    960
  ],
  "step-talk-320": [
    320,
    320
  ],
  "step-options-320": [
    320,
    320
  ],
  "step-documents-320": [
    320,
    320
  ],
  "step-onway-320": [
    320,
    320
  ],
  "tex-water-1280": [
    1280,
    724
  ],
  "tex-water-m-720": [
    720,
    1273
  ],
  "tex-plaster-shadow-1600": [
    1600,
    905
  ],
  "tex-plaster-shadow-m-900": [
    900,
    1592
  ],
  "tex-tuff-768": [
    768,
    768
  ],
  "tex-linen-1024": [
    1024,
    1024
  ],
  "pack-passport-560": [
    356,
    560
  ],
  "pack-sunglasses-560": [
    560,
    363
  ],
  "pack-scarf-560": [
    560,
    552
  ],
  "pack-panama-560": [
    538,
    560
  ],
  "pack-boarding-pass-720": [
    720,
    266
  ],
  "sticker-luggage-tag-420": [
    358,
    420
  ],
  "sticker-postage-stamp-420": [
    362,
    420
  ],
  "tex-cloud-atlas-rgba-1024": [
    1024,
    1024
  ],
  "story-wing-800": [
    800,
    450
  ],
  "story-wing-1280": [
    1280,
    720
  ],
  "story-wing-1672": [
    1672,
    941
  ]
} as const satisfies Record<string, readonly [number, number]>;

export type MediaName = keyof typeof MEDIA;

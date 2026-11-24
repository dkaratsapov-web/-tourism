#!/usr/bin/env python3
"""
Веб-варианты атмосферных кадров Higgsfield для сайта.

Берёт исходники из site/public/media (PNG, если лежат рядом, иначе webp) и пишет
уменьшенные webp в site/public/media/w/<id>-<ширина>.webp. Размеры подобраны под реальный
показ на странице (×2 для ретины). Заодно пишет site/src/lib/media-manifest.ts с размерами
файлов — для атрибутов width/height (без сдвигов вёрстки).

- pack-* и sticker-*: прозрачные поля обрезаются по альфе, остаётся небольшой отступ под тень.
- tex-cloud-atlas: чёрный фон переводится в альфу (яркость → прозрачность), цвет «распремножается»,
  чтобы в WebGL работало обычное смешивание и туман без тёмной каймы.

Запуск: python3 tools/web/media_variants.py
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "site/public/media"
OUT = SRC / "w"
MANIFEST = ROOT / "site/src/lib/media-manifest.ts"

# id → (ширины, качество)
PLAN = {
    "hero-aegean": ([640, 960, 1536], 78),
    "story-coast": ([1280, 1600], 62),
    "story-terrace": ([1120, 1672], 88),
    "story-window": ([1280, 1920], 74),
    "story-wing": ([800, 1280, 1672], 88),
    "story-flatlay": ([1280], 76),
    "story-coast-m": ([720, 1080], 64),
    "story-terrace-m": ([480, 600], 88),
    "story-window-m": ([720, 1080], 74),
    "story-flatlay-m": ([720], 76),
    "format-coast": ([800, 1280], 74),
    "format-family": ([800, 1280], 76),
    "format-cappadocia": ([800, 1280], 74),
    "format-istanbul": ([800, 1280], 74),
    "format-route": ([800, 1280], 74),
    "step-talk": ([320], 76),
    "step-options": ([320], 76),
    "step-documents": ([320], 76),
    "step-onway": ([320], 76),
    "tex-water": ([1280], 66),
    "tex-water-m": ([720], 66),
    "tex-plaster-shadow": ([1600], 70),
    "tex-plaster-shadow-m": ([900], 70),
    "tex-tuff": ([768], 55),
    "tex-linen": ([1024], 66),
}
# Вырезки: обрезка по альфе, ширина по длинной стороне.
CUTOUTS = {
    "pack-passport": 560,
    "pack-sunglasses": 560,
    "pack-scarf": 560,
    "pack-panama": 560,
    "pack-boarding-pass": 720,
    "sticker-luggage-tag": 420,
    "sticker-postage-stamp": 420,
}


def source(name: str) -> Image.Image:
    png = SRC / f"{name}.png"
    return Image.open(png if png.exists() else SRC / f"{name}.webp")


def save(im: Image.Image, name: str, q: int, manifest: dict, alpha=False):
    OUT.mkdir(exist_ok=True)
    path = OUT / f"{name}.webp"
    im.save(path, "WEBP", quality=q, method=6, **({"alpha_quality": 90} if alpha else {}))
    manifest[name] = [im.width, im.height]
    print(f"{path.relative_to(ROOT)}  {im.width}×{im.height}  {path.stat().st_size // 1024} КБ")


def main():
    manifest: dict = {}
    for name, (widths, q) in PLAN.items():
        im = source(name).convert("RGB")
        for w in widths:
            h = round(im.height * w / im.width)
            save(im.resize((w, h), Image.LANCZOS) if w < im.width else im, f"{name}-{w}", q, manifest)

    for name, size in CUTOUTS.items():
        im = source(name).convert("RGBA")
        # Порог альфы отсекает почти прозрачный шум по краю.
        a = im.getchannel("A").point(lambda v: 255 if v > 8 else 0)
        l, t, r, b = a.getbbox()
        pad = round(max(r - l, b - t) * 0.02)
        im = im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))
        k = size / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        save(im, f"{name}-{size}", 82, manifest, alpha=True)

    # Атлас облаков: альфа = яркость (с подъёмом, чтобы серые тени облака остались плотными).
    im = source("tex-cloud-atlas").convert("RGB").resize((1024, 1024), Image.LANCZOS)
    px = im.load()
    out = Image.new("RGBA", im.size)
    po = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            lum = max(r, g, b) / 255
            a = min(1.0, max(0.0, (lum - 0.04) * 1.75))
            if a <= 0:
                po[x, y] = (255, 255, 255, 0)
                continue
            # Цвет «распремножаем»: на чёрном он уже умножен на прозрачность.
            k = 1 / max(a, 0.1)
            po[x, y] = (min(255, round(r * k)), min(255, round(g * k)), min(255, round(b * k)), round(a * 255))
    save(out, "tex-cloud-atlas-rgba-1024", 80, manifest, alpha=True)

    MANIFEST.write_text(
        "// Сгенерировано tools/web/media_variants.py — не править руками.\n"
        "/** Размеры веб-вариантов кадров из public/media/w (ширина, высота) — для width/height у <img>. */\n"
        f"export const MEDIA = {json.dumps(manifest, indent=2, ensure_ascii=False)} as const satisfies Record<string, readonly [number, number]>;\n"
        "\nexport type MediaName = keyof typeof MEDIA;\n",
        encoding="utf-8",
    )
    print(f"манифест: {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

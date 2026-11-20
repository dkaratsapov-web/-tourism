#!/usr/bin/env python3
"""Склеивает кадры аудита в одну картинку-лист, чтобы оценить весь сайт одним взглядом.

Запуск: python3 tools/web/contact_sheet.py <папка аудита> [--device desktop|mobile] [--cols 4] [--width 2400]
Результат: <папка>/sheet-<device>.png
"""
import argparse
import pathlib

from PIL import Image, ImageDraw


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("folder")
    p.add_argument("--device", default="desktop")
    p.add_argument("--cols", type=int, default=0, help="0 = 4 для ПК, 6 для телефона")
    p.add_argument("--width", type=int, default=2400, help="ширина итоговой картинки, px")
    a = p.parse_args()

    folder = pathlib.Path(a.folder)
    files = sorted(folder.glob(f"{a.device}-frame-*.png"))
    if not files:
        raise SystemExit(f"Нет кадров {a.device}-frame-*.png в {folder}")

    cols = a.cols or (4 if a.device == "desktop" else 6)
    gap = 12
    cell_w = (a.width - gap * (cols + 1)) // cols
    first = Image.open(files[0])
    cell_h = int(first.height * cell_w / first.width)
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (a.width, rows * (cell_h + gap + 22) + gap), "white")
    draw = ImageDraw.Draw(sheet)

    for i, f in enumerate(files):
        r, c = divmod(i, cols)
        x = gap + c * (cell_w + gap)
        y = gap + r * (cell_h + gap + 22)
        im = Image.open(f).convert("RGB").resize((cell_w, cell_h), Image.LANCZOS)
        sheet.paste(im, (x, y + 22))
        draw.text((x, y + 4), f"{i}: {f.stem}", fill=(60, 60, 60))

    out = folder / f"sheet-{a.device}.png"
    sheet.save(out, optimize=True)
    print(out)


if __name__ == "__main__":
    main()

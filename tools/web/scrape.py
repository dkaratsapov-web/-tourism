#!/usr/bin/env python3
"""Парсинг страницы: основной текст, заголовки, мета-теги, ссылки, картинки.

Запуск:
  python3 tools/web/scrape.py <url> [--json] [--render]
  --render  загрузить страницу через браузер (для сайтов, где текст рисует JavaScript)
  --json    вывести всё в JSON, иначе — читаемый Markdown

Примеры:
  python3 tools/web/scrape.py https://example.com
  python3 tools/web/scrape.py https://example.com --render --json > page.json
"""
import argparse
import json
import sys
from urllib.parse import urljoin

import httpx
import trafilatura
from selectolax.lexbor import LexborHTMLParser

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0 Safari/537.36"
)


def fetch(url: str, render: bool) -> str:
    if not render:
        r = httpx.get(url, headers={"User-Agent": UA, "Accept-Language": "ru,en;q=0.8"},
                      follow_redirects=True, timeout=30)
        r.raise_for_status()
        return r.text
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        b = pw.chromium.launch()
        page = b.new_page(user_agent=UA, locale="ru-RU")
        page.goto(url, wait_until="networkidle", timeout=60000)
        # Прокрутка, чтобы подгрузился ленивый контент.
        for _ in range(12):
            page.mouse.wheel(0, 1200)
            page.wait_for_timeout(250)
        html = page.content()
        b.close()
        return html


def parse(url: str, html: str) -> dict:
    tree = LexborHTMLParser(html)

    def meta(sel: str) -> str:
        n = tree.css_first(sel)
        return (n.attributes.get("content") or "").strip() if n else ""

    text = trafilatura.extract(html, url=url, include_links=False, include_tables=True,
                               favor_recall=True, output_format="markdown") or ""
    return {
        "url": url,
        "title": (tree.css_first("title").text(strip=True) if tree.css_first("title") else ""),
        "description": meta('meta[name="description"]'),
        "og": {k: meta(f'meta[property="og:{k}"]') for k in ("title", "description", "image")},
        "headings": [
            {"tag": n.tag, "text": " ".join(n.text(strip=True).split())}
            for n in tree.css("h1, h2, h3") if n.text(strip=True)
        ][:80],
        "links": sorted({urljoin(url, a.attributes.get("href") or "")
                         for a in tree.css("a[href]")
                         if not (a.attributes.get("href") or "").startswith(("#", "mailto:", "tel:", "javascript:"))})[:300],
        "images": sorted({urljoin(url, i.attributes.get("src") or i.attributes.get("data-src") or "")
                          for i in tree.css("img") if i.attributes.get("src") or i.attributes.get("data-src")})[:150],
        "text": text,
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("url")
    p.add_argument("--json", action="store_true")
    p.add_argument("--render", action="store_true")
    a = p.parse_args()

    data = parse(a.url, fetch(a.url, a.render))
    if a.json:
        json.dump(data, sys.stdout, ensure_ascii=False, indent=2)
        return
    print(f"# {data['title']}\n\n{data['description']}\n")
    print("## Заголовки\n")
    for h in data["headings"]:
        print(f"- {h['tag']}: {h['text']}")
    print(f"\n## Текст\n\n{data['text']}\n")
    print(f"## Ссылки ({len(data['links'])})\n")
    for link in data["links"][:60]:
        print(f"- {link}")


if __name__ == "__main__":
    main()

#!/usr/bin/env bash
# Выкладка сайта на GitHub Pages (временный хостинг до переезда на VPS).
# Собирает статическую версию из site/ и публикует папку out/ в ветку gh-pages
# отдельным коммитом без истории. Адрес: https://dkaratsapov-web.github.io/-tourism/
#
# Запуск из корня репозитория:  bash tools/deploy-pages.sh
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
REMOTE_URL="$(git -C "$ROOT" remote get-url origin)"
SRC_SHA="$(git -C "$ROOT" rev-parse --short HEAD)"

cd "$ROOT/site"
rm -rf out
npm run build:pages

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp -r out/. "$TMP/"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$ROOT" config user.name || echo deploy)" \
    -c user.email="$(git -C "$ROOT" config user.email || echo deploy@localhost)" \
    commit -q -m "Выкладка сайта на GitHub Pages из ${SRC_SHA}"
git push -f "$REMOTE_URL" gh-pages:gh-pages
echo "Готово: https://dkaratsapov-web.github.io/-tourism/ (обновится через 1–2 минуты)"

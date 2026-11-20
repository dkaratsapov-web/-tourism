#!/usr/bin/env bash
# Генерация визуалов главной в Higgsfield. Собран автоматически из docs/concept/higgsfield-prompts.md.
# Запуск: bash tools/higgsfield/generate.sh [id ...] — без аргументов генерирует всё, что ещё не скачано.
# С аргументами генерирует только перечисленные id (остальные шаги пропускаются).
set -uo pipefail
ONLY=("$@")
cd /home/user/-tourism
OUT=site/public/media
mkdir -p "$OUT"
LOG="$OUT/_higgsfield.log"

ANCHOR="contemporary fashion-magazine travel photography, editorial composition with generous negative space, natural daylight, soft contrast, palette of milk white #F6F3EC, deep navy #13294B, sky blue #A9CDEB, Cappadocia tuff beige #CFC2AE and Aegean teal water #2F6F8F with a rare small accent of brick red #A3433B, cool navy-tinted shadows and warm milky highlights, fine 35mm grain, no text, no logos, no brand marks, no airline livery"
TEX="seamless tileable flat surface texture, edges wrap perfectly, even diffused daylight, straight-on view without perspective, no vignette, low contrast, no text, no logos"
AVOID="text, letters, numbers, captions, watermark, signage, logos, brand labels, airline livery, recognizable faces, children in close-up, oversaturated HDR colors, vintage sepia, aged or torn paper, heavy vignette, tilt-shift, plastic CGI look, extra fingers"

# Прозрачный фон: заполнить после шага 0, если у gpt_image_2_6 есть параметр background
CUT=(--background transparent)

# Скачивает результат по последней ссылке из вывода CLI. kind: img | vid
fetch() {
  local id="$1" kind="$2" out="$3" url ext
  printf '\n== %s ==\n%s\n' "$id" "$out" >> "$LOG"
  url=$(grep -oE 'https://[^[:space:]"<>]+' <<<"$out" | tail -1)
  [ -n "$url" ] || { echo "ОШИБКА $id: нет ссылки, см. $LOG" >&2; return 1; }
  ext=$(sed -E 's/\?.*$//; s/.*\.//' <<<"$url" | tr 'A-Z' 'a-z')
  case "$ext" in png|webp|jpg|jpeg|mp4|webm) ;; *) [ "$kind" = vid ] && ext=mp4 || ext=png ;; esac
  curl -fsSL "$url" -o "$OUT/$id.$ext" && printf '%s\t%s\n' "$id" "$url" >> "$OUT/_manifest.tsv"
  echo "готово: $OUT/$id.$ext"
}

exists() {
  # Не из списка выбранных id — пропускаем молча.
  if [ ${#ONLY[@]} -gt 0 ] && [[ ! " ${ONLY[*]} " =~ " $1 " ]]; then return 0; fi
  compgen -G "$OUT/$1.*" >/dev/null && echo "пропуск: $1 уже есть"
}

# gen <id> <model> <prompt> <доп. негатив> [параметры модели...]  — со стиль-якорем
gen() {
  local id="$1" model="$2" prompt="$3" extra="$4"; shift 4
  # Качество по умолчанию у GPT Image — low; у моделей Soul такого параметра нет.
  local QUALITY=(); [ "$model" = gpt_image_2_6 ] && QUALITY=(--quality high)
  exists "$id" && return 0
  fetch "$id" img "$(higgsfield generate create "$model" \
    --prompt "$prompt. $ANCHOR. Avoid: $AVOID, $extra." "${QUALITY[@]}" "$@" --wait --wait-timeout 20m 2>&1)"
}

# gen_raw — без стиль-якоря (технические текстуры); якорь передаётся в prompt явно
gen_raw() {
  local id="$1" model="$2" prompt="$3" extra="$4"; shift 4
  exists "$id" && return 0
  fetch "$id" img "$(higgsfield generate create "$model" \
    --prompt "$prompt. Avoid: $extra." --quality high "$@" --wait --wait-timeout 20m 2>&1)"
}

# vid <id> <стартовый кадр> <prompt> [доп. флаги]  — Seedance 2.5, 5 с, 1080p
vid() {
  local id="$1" start="$2" prompt="$3"; shift 3
  exists "$id" && return 0
  fetch "$id" vid "$(higgsfield generate create seedance_2_5 --mode omni_reference \
    --start-image "$start" --prompt "$prompt" --duration 5 --resolution 1080p \
    --generate_audio false "$@" --wait --wait-timeout 30m 2>&1)"
}


gen pack-passport gpt_image_2_6 \
  "Single closed passport in a smooth deep navy leather travel cover without emblem, softly rounded corners, a thin sky blue ribbon bookmark peeking out, shot from directly overhead at 90 degrees, product still life, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "cast shadow, state emblem, coat of arms, embossed lettering, hands, cropped edges" \
  --aspect_ratio 1:1 --resolution 2k --output_format png "${CUT[@]}"

gen pack-boarding-pass gpt_image_2_6 \
  "Single blank paper boarding pass with a tear-off stub separated by a fine perforation line, matte milk-white card with one thin deep navy band along the top edge and empty unprinted fields, lying flat, shot from directly overhead at 90 degrees, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "cast shadow, printed characters, barcode, QR code, airline name, cropped edges" \
  --aspect_ratio 3:2 --resolution 2k --output_format png "${CUT[@]}"

gen pack-sunglasses gpt_image_2_6 \
  "A pair of modern acetate sunglasses in warm tuff-beige tortoiseshell with deep navy tinted lenses, arms open, lying flat, shot from directly overhead at 90 degrees, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "cast shadow, brand engraving on temples, reflections of a photographer, cropped edges" \
  --aspect_ratio 1:1 --resolution 2k --output_format png "${CUT[@]}"

gen pack-scarf gpt_image_2_6 \
  "Loosely folded square silk scarf with an original abstract print of overlapping arches and soft waves in deep navy, sky blue and milk white with a thin brick red border, natural folds and gentle sheen, flat lay shot from directly overhead at 90 degrees, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "cast shadow, designer monogram, recognizable fashion-house pattern, paisley cliche, cropped edges" \
  --aspect_ratio 1:1 --resolution 2k --output_format png "${CUT[@]}"

gen pack-panama gpt_image_2_6 \
  "Small child-size natural woven straw panama hat with a deep navy grosgrain ribbon, crown up, shot from directly overhead at 90 degrees, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "child, person, head, cast shadow, label, cropped edges" \
  --aspect_ratio 1:1 --resolution 2k --output_format png "${CUT[@]}"


# Фон вырезает сам Higgsfield (--background transparent), rembg не нужен.


gen story-flatlay gpt_image_2_6 \
  "Overhead flat lay on a matte milk-white paper surface with the referenced passport, boarding pass, sunglasses, silk scarf and child-size straw panama hat arranged in a loose editorial grid, objects grouped in the right two thirds of the frame, clean empty space across the left third for a text column, soft morning window light from the upper left with gentle short shadows" \
  "clutter, extra objects, phone, laptop, coffee cup, hands" \
  --aspect_ratio 16:9 --resolution 2k \
  --image "$OUT/pack-passport.png" --image "$OUT/pack-boarding-pass.png" --image "$OUT/pack-sunglasses.png" \
  --image "$OUT/pack-scarf.png" --image "$OUT/pack-panama.png"

gen story-flatlay-m gpt_image_2_6 \
  "Vertical overhead flat lay on a matte milk-white paper surface with only the referenced passport, boarding pass and child-size straw panama hat, larger in frame, grouped in the lower two thirds, clean empty space across the upper third for a headline, soft morning window light from the upper left with gentle short shadows" \
  "clutter, extra objects, hands" \
  --aspect_ratio 9:16 --resolution 2k \
  --image "$OUT/pack-passport.png" --image "$OUT/pack-boarding-pass.png" --image "$OUT/pack-panama.png"


gen story-window soul_location \
  "View from a passenger aircraft window seat at cruising altitude in early morning, the window frame itself out of shot, a soft sky gradient from pale sky blue at the zenith to milky white at the horizon, a calm sunlit cloud deck below, the tip of a plain white unmarked wing entering from the left edge in the lower third, low sun from the right casting warm rim light on the cloud tops, calm open sky above" \
  "window frame, cabin interior, airline livery, registration numbers, winglet logo, lens flare streaks, storm clouds" \
  --aspect_ratio 16:9

gen story-window-m gpt_image_2_6 \
  "Vertical view from a passenger aircraft window seat at cruising altitude in early morning, the window frame itself out of shot, tall soft sky gradient from pale sky blue at the top to milky white at the horizon, a calm sunlit cloud deck in the lower part, the tip of a plain white unmarked wing entering from the left edge in the lower quarter, low sun from the right, open clean sky in the upper third" \
  "window frame, cabin interior, airline livery, registration numbers, lens flare streaks" \
  --aspect_ratio 9:16 --resolution 2k

gen_raw tex-cloud-atlas gpt_image_2_6 \
  "Texture atlas for a real-time engine: four separate soft cumulus cloud puffs arranged in a 2 by 2 grid, each cloud centered in its own quadrant with wide empty margins and no overlap, white and pale grey volumetric clouds lit from the upper right with soft shading, on a pure flat black background, no text, no logos" \
  "horizon, sky gradient, ground, stars, overlap between quadrants, text, logos" \
  --aspect_ratio 1:1 --resolution 2k --output_format png

gen story-coast gpt_image_2_6 \
  "Aerial view at a 60-degree angle over the Aegean coast of Turkey in late morning, clear turquoise and deep teal water over pale limestone rocks and a small pebble cove, the coastline running diagonally from the upper left to the lower right, a few pine trees on the cliffs, open sea filling the right two thirds, calm and uninhabited" \
  "boats, yachts, buildings, people, umbrellas, drone shadow" \
  --aspect_ratio 16:9 --resolution 2k

gen story-coast-m soul_location \
  "Vertical aerial view at a 60-degree angle over the Aegean coast of Turkey in late morning, clear turquoise and deep teal water over pale limestone rocks, the coastline running diagonally from the top left to the bottom right, a few pine trees on the cliffs, calm open water in the upper third, uninhabited" \
  "boats, yachts, buildings, people, umbrellas" \
  --aspect_ratio 9:16

gen story-terrace soul_location \
  "Hotel terrace above the Aegean Sea at golden hour, eye-level view, a low whitewashed stone parapet across the lower third, one linen-covered sun lounger with a folded tuff-beige towel at the right third, calm sea running to a clean straight horizon, soft pale sky taking the upper half as open space, warm low sunlight from the left, quiet and uninhabited" \
  "people, pool, umbrellas with logos, cocktail props, hotel signage, tilted horizon" \
  --aspect_ratio 16:9

gen story-terrace-m gpt_image_2_6 \
  "Vertical view from a hotel terrace above the Aegean Sea at golden hour, eye level, a low whitewashed stone parapet and the end of one linen-covered sun lounger in the lower third, calm sea to a clean straight horizon, tall soft pale sky above as open space for a large headline, warm low sunlight from the left, uninhabited" \
  "people, pool, umbrellas with logos, hotel signage, tilted horizon" \
  --aspect_ratio 9:16 --resolution 2k


gen format-coast gpt_image_2_6 \
  "Bodrum peninsula on the Aegean coast, a woman in a loose milk-white linen dress with a navy silk scarf seen from behind with her back to the camera, face not visible, standing at a whitewashed terrace wall small in the left third of the frame, looking over a calm turquoise bay with white cubic houses and pink bougainvillea on the hillside, late afternoon sun" \
  "face, profile, children, yachts, gulets, crowds, swimwear, shop signs" \
  --aspect_ratio 4:3 --resolution 2k

gen format-cappadocia soul_location \
  "Cappadocia at sunrise seen from a cave hotel terrace, carved tuff stone arches and a low wall with a woven kilim and a brass lantern in the foreground at the lower left, beyond them fairy chimneys and soft tuff valleys, a dozen plain hot air balloons in muted cream, sky blue and brick tones floating in pale morning sky in the upper two thirds, uninhabited" \
  "lettering or logos on balloons, people, tourists with phones, oversaturated sunrise" \
  --aspect_ratio 4:3

gen format-istanbul soul_location \
  "Istanbul in early morning from a quiet rooftop terrace, a slim tulip-shaped glass of Turkish tea on a stone ledge in the foreground at the lower right, beyond it the Bosphorus in soft haze with the silhouettes of domes and minarets, one white passenger ferry crossing, a few gulls, pale sky blue and milky light, uninhabited" \
  "people, crowds, shop signs, flags with text, night lights, heavy fog" \
  --aspect_ratio 4:3

gen format-route soul_location \
  "Aerial view of a winding road curving in an S-shape through olive groves and pine hills above the Aegean, one small plain white car without badges on the road at the right third, warm tuff-coloured earth, teal sea along the top edge, late afternoon light, a quiet road-trip mood" \
  "car badges, license plates, traffic, road signs with text, trucks, people" \
  --aspect_ratio 4:3


gen_raw tex-tuff gpt_image_2_6 \
  "Macro surface of soft Cappadocia volcanic tuff stone, fine porous grain and faint gentle chisel marks, warm tuff beige #CFC2AE, $TEX" \
  "cracks, moss, dark stains, strong relief, text, logos" \
  --aspect_ratio 1:1 --resolution 2k

gen_raw tex-linen gpt_image_2_6 \
  "Close-up of washed milk-white linen fabric, fine slub weave, smooth and flat, color #F6F3EC, $TEX" \
  "wrinkles, folds, stitching, stains, text, logos" \
  --aspect_ratio 1:1 --resolution 2k

gen tex-water gpt_image_2_6 \
  "Top-down view of clear Aegean sea surface, gentle ripples with soft caustic light patterns, gradient from Aegean teal #2F6F8F to sky blue #A9CDEB, no horizon, calm and even, suitable as a full-bleed background" \
  "horizon, boats, swimmers, foam, sun glare hotspots" \
  --aspect_ratio 16:9 --resolution 2k

gen tex-water-m gpt_image_2_6 \
  "Vertical top-down view of clear Aegean sea surface, gentle ripples with soft caustic light, gradient from Aegean teal #2F6F8F at the bottom to sky blue #A9CDEB at the top, no horizon, calm and even, suitable as a full-bleed background" \
  "horizon, boats, swimmers, foam, sun glare hotspots" \
  --aspect_ratio 9:16 --resolution 2k

gen tex-plaster-shadow gpt_image_2_6 \
  "Sunlit milk-white lime-plaster wall seen straight on, soft blurred shadows of olive leaves falling only across the upper right corner, the rest of the wall calm and empty, airy and warm, suitable as a background behind text" \
  "window, furniture, cracks, dirt, hard sharp shadows across the whole frame" \
  --aspect_ratio 16:9 --resolution 2k

gen tex-plaster-shadow-m gpt_image_2_6 \
  "Vertical sunlit milk-white lime-plaster wall seen straight on, soft blurred shadows of olive leaves falling only across the top edge, the rest of the wall calm and empty, airy and warm, suitable as a background behind text" \
  "window, furniture, cracks, dirt, hard shadows across the whole frame" \
  --aspect_ratio 9:16 --resolution 2k


gen step-talk gpt_image_2_6 \
  "Two small cups of Turkish coffee and a glass of water on a round white marble café table with a folded deep navy linen napkin, shot from directly overhead, soft morning light from the upper left" \
  "hands, people, saucers with logos, sugar packets with text" \
  --aspect_ratio 1:1 --resolution 2k

gen step-options gpt_image_2_6 \
  "A calm arrangement on a milk-white surface of a folded linen towel, a smooth tuff stone pebble, a sprig of olive and a brass room key without engraving, shot from directly overhead, soft morning light from the upper left" \
  "numbers on the key, brochures, printed paper, hands" \
  --aspect_ratio 1:1 --resolution 2k

gen step-documents gpt_image_2_6 \
  "A deep navy leather travel document folder slightly open with blank cream cards inside and a brass paper clip, on a milk-white surface, shot from directly overhead, soft morning light from the upper left" \
  "printed text, tickets with characters, passport emblem, hands" \
  --aspect_ratio 1:1 --resolution 2k

gen step-onway gpt_image_2_6 \
  "A smartphone lying face down beside a slim glass of Turkish tea on a sunlit stone terrace table, the sea softly blurred in the background, warm late afternoon light" \
  "visible screen, phone brand logo, camera bump branding, hands, people" \
  --aspect_ratio 1:1 --resolution 2k


gen sticker-luggage-tag gpt_image_2_6 \
  "A single blank cream card luggage tag with a reinforced round eyelet and a looped deep navy string, very slightly curled, no printing, shot from directly overhead, evenly lit, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "printed text, barcode, airline name, cast shadow, cropped edges" \
  --aspect_ratio 1:1 --resolution 2k --output_format png "${CUT[@]}"

gen sticker-postage-stamp gpt_image_2_6 \
  "A single blank postage stamp with a perforated deckle edge and a milk-white border, inside a small flat illustration of one hot air balloon over soft tuff hills in brick red, deep navy and sky blue, no denomination and no lettering, flat scan, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "numbers, lettering, country name, postmark text, cast shadow, cropped edges" \
  --aspect_ratio 1:1 --resolution 2k --output_format png "${CUT[@]}"


vid story-coast-loop "$OUT/story-coast.png" \
  "Locked-off static camera. Gentle waves and sparkling light glints move across the water, foam softly breathes at the rocks, pine branches barely sway. Subtle seamless loop, no camera movement, no new objects, no boats appear, no text." \
  --end-image "$OUT/story-coast.png"

vid story-terrace-loop "$OUT/story-terrace.png" \
  "Locked-off static camera. The calm sea shimmers, the edge of the folded towel lifts slightly in a light breeze, soft light flickers on the water. Subtle seamless loop, no camera movement, no people appear, no text." \
  --end-image "$OUT/story-terrace.png"

vid format-coast-loop "$OUT/format-coast.png" \
  "Locked-off static camera. A light breeze moves the hem of the linen dress and the ends of the scarf, the woman stays still with her back to the camera and does not turn around, the water sparkles in the bay. Subtle seamless loop, no camera movement, no text." \
  --end-image "$OUT/format-coast.png"

vid format-cappadocia "$OUT/format-cappadocia.png" \
  "Very slow locked-off shot. The hot air balloons rise gently and drift slightly to the right, the lantern flame flickers softly. Calm, no camera movement, no new objects, no lettering on balloons."


# Картинки → WebP (ПК 1920 px по длинной стороне, телефон 1080 px), кроме прозрачных вырезок — их в WebP с альфой
for f in "$OUT"/*.png; do cwebp -q 80 -resize 1920 0 -alpha_q 90 "$f" -o "${f%.png}.webp"; done
for f in "$OUT"/*-m.png; do cwebp -q 78 -resize 1080 0 "$f" -o "${f%.png}.webp"; done
# AVIF для постеров сцен — через sharp или squoosh (ставить с разрешения пользователя), q≈50

# Видео → H.264 без звука, тег Rec.709 (иначе цвет «плывёт» между браузерами), faststart
for f in "$OUT"/*-loop.mp4 "$OUT"/format-cappadocia.mp4; do
  ffmpeg -y -i "$f" -an -vf "scale=1600:-2,format=yuv420p" -c:v libx264 -crf 26 -preset slow \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart "${f%.mp4}.web.mp4"
done

# Если стык петли заметен — кроссфейд конца в начало (0,4 с), длина ролика 5 с
ffmpeg -y -i "$OUT/story-coast-loop.mp4" -filter_complex \
  "[0]split[a][b];[a]trim=0.4:5,setpts=PTS-STARTPTS[main];[b]trim=0:0.4,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=0.4:offset=4.2,format=yuv420p" \
  -an -c:v libx264 -crf 24 "$OUT/story-coast-loop.seam.mp4"


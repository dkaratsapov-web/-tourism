# Пакет промптов Higgsfield для главной

Версия 1 · 20.11.2026 · статус: готов к запуску, когда CLI будет авторизован.
Основа: `decision.md` (главный), `directions.md` (раздел А), `storyboard.md`. Скиллы: `higgsfield-generate`, `creative-direction`, `shot-composition`, `color-motion`.

## Правила, которые действуют для всего пакета

- **Все кадры атмосферные.** На сайте мы не выдаём их за поездки клиентов, отели из подборки или личные поездки Натальи. В разметке у каждого кадра стоит `data-atmosphere`, alt начинается со слов «Атмосферный кадр:». Подписей под картинками не делаем.
- **Наталью не генерируем.** Портрет на обложке, портрет в «Наталье», фото в поездках и видеообзоры отелей — только реальная съёмка. До неё остаются подписанные плейсхолдеры («Портрет Натальи — нужна съёмка»).
- **Не генерируем отзывы, скриншоты переписок, «наших туристов», яхты** (продукт пока не подтверждён), MICE, Мальдивы, Азию.
- **Люди** — только со спины или без лиц, мелко или средним планом. Детей в кадре нет: о семьях говорит детская панама, а не ребёнок.
- **Текста в кадре нет.** Подписи, номера рейсов, штрихкоды и штампы «TÜRKİYE / AYT / IST / NAV» делаем в HTML и SVG. Так текст точный, с кириллицей и турецкой «İ», и доступен скринридеру.
- **Без логотипов и брендов:** у самолёта нет ливреи, на машине нет значков, на шарах нет надписей, у вещей нет этикеток.
- **Не генерируем бумажные текстуры с состаренными краями.** Это риск направления А: журнал должен выглядеть современным, а не ретро.

## Стиль-якорь

Одна строка, которую дописываем ко всем промптам, кроме технических текстур (для них — отдельный якорь `TEX`, см. команды).

```text
contemporary fashion-magazine travel photography, editorial composition with generous negative space, natural daylight, soft contrast, palette of milk white #F6F3EC, deep navy #13294B, sky blue #A9CDEB, Cappadocia tuff beige #CFC2AE and Aegean teal water #2F6F8F with a rare small accent of brick red #A3433B, cool navy-tinted shadows and warm milky highlights, fine 35mm grain, no text, no logos, no brand marks, no airline livery
```

**Общий негатив.** У моделей Higgsfield обычно нет отдельного `negative_prompt`, поэтому негатив дописываем в конец промпта: `Avoid: …`. К нему добавляется негатив конкретного кадра из таблиц ниже.

```text
text, letters, numbers, captions, watermark, signage, logos, brand labels, airline livery, recognizable faces, children in close-up, oversaturated HDR colors, vintage sepia, aged or torn paper, heavy vignette, tilt-shift, plastic CGI look, extra fingers
```

**Почему якорь такой.** Сквозной сплит-тон из скилла `color-motion` (холодные тени в синий, тёплые молочные света) склеивает кадры из разных моделей в один номер журнала. HEX-коды дублируем словами: модели надёжнее понимают «deep navy», чем код.

## Выбор моделей

| Задача | Модель | Почему |
| --- | --- | --- |
| Предметы сборов, стикеры, флэтлей, натюрморты шагов, текстуры | `gpt_image_2_6` (GPT Image 2.6 Sunburst) | Модель по умолчанию в скилле: точная форма предметов, принимает референсы (до 16), поэтому флэтлей собирается из уже готовых вырезок. |
| Места без людей: иллюминатор, побережье, терраса, Каппадокия, Стамбул, дорога | `soul_location` (Soul Location) | В скилле она лучшая для локаций без людей. Работает только по промпту, качество не выбирается, есть 16:9, 9:16, 4:3, 3:4 и 21:9. |
| Кадр с человеком со спины (Бодрум) | `text2image_soul_v2` (Soul 2.0) | Скилл рекомендует её для fashion-editorial с новым человеком. `--quality 2k`. |
| Видео (image-to-video) | `seedance_2_5` (Seedance 2.5), `--mode omni_reference` | Видео по умолчанию в скилле. Длительность от 4 с, берём 5 с. Для петли подаём один и тот же кадр как `--start-image` и `--end-image`. |

**Сомнения, которые нужно снять до запуска (шаг 0).**

1. **Вырезанный фон.** В документации скилла у `gpt_image_2_6` прозрачный фон не описан: есть только `--output_format png|jpeg|webp|gif|svg`. У исходной модели OpenAI есть параметр `background: transparent`. Если `higgsfield model get gpt_image_2_6` покажет `background`, ставим `CUT=(--background transparent)`. Если нет — предметы генерируются на ровном светло-сером фоне (так задано в промпте), а потом вырезаются локально через `rembg` (его установка — только с разрешения пользователя) или вручную.
2. **Соотношения сторон у `gpt_image_2_6`** в документации не перечислены. Если 3:2 или 16:9 не поддерживаются, CLI подставит ближайшее и выведет `Note: adjustments applied`. Это нужно увидеть в логе.
3. **`soul_location` для иллюминатора.** Модель сделана для мест. Если вместо вида с высоты получится салон или аэропорт, перегенерируем кадр на `gpt_image_2_6` тем же промптом.
4. **`seedance_2_5`:** принимает ли он `--aspect_ratio` при стартовом кадре и как записывается `--generate_audio false`. В командах `--aspect_ratio` не передаём, формат берётся из стартового кадра. Звук в любом случае убираем через ffmpeg (`-an`).
5. **Точные ID моделей** — сверить по `higgsfield model list`. В частности, у Soul Location ID в каталоге скилла не указан, `soul_location` взят из таблицы медиа-ролей.

## Сводная таблица кадров

Имена файлов: `<id>.<ext>` — основной (ПК), `<id>-m.<ext>` — отдельная постановка для телефона, `<id>-loop.mp4` — видео. Путь — `site/public/media/`.
«Тот же файл» — на телефоне используется тот же кадр (формат в раскадровке одинаковый), отдельная генерация не нужна.

| id | Куда на сайте | ПК | Телефон | Модель | Вырезанный фон | Видео | Кадрирование |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pack-passport` | Сцена 2 «Сборы», предмет | 1:1 | тот же файл | `gpt_image_2_6` | да, PNG | нет | вид строго сверху, свет слева сверху |
| `pack-boarding-pass` | Сцена 2, предмет; из него вырастает иллюминатор | 3:2 | тот же файл | `gpt_image_2_6` | да, PNG | нет | пустой талон, текст кладётся поверх в HTML |
| `pack-sunglasses` | Сцена 2, предмет | 1:1 | тот же файл (на телефоне не используется) | `gpt_image_2_6` | да, PNG | нет | дужки раскрыты |
| `pack-scarf` | Сцена 2, предмет | 1:1 | тот же файл (на телефоне не используется) | `gpt_image_2_6` | да, PNG | нет | платок сложен свободно |
| `pack-panama` | Сцена 2, предмет | 1:1 | тот же файл | `gpt_image_2_6` | да, PNG | нет | только панама, ребёнка нет |
| `story-flatlay` | Сцена 2: постер до загрузки вырезок, share-картинка | 16:9 | 9:16 (`-m`, 3 предмета) | `gpt_image_2_6` + референсы вырезок | нет | нет | ПК: предметы в правых 2/3, левая треть пустая под текст. Телефон: предметы в нижних 2/3 |
| `story-window` | Сцена 3 «Полёт»: AVIF-постер внутри маски иллюминатора, reduced motion, слабый GPU | 16:9 | 9:16 (`-m`) | `soul_location` | нет | нет (облака делает R3F) | без рамки окна — её даёт SVG-маска. Крыло в нижней трети слева, солнце справа |
| `tex-cloud-atlas` | Сцена 3: атлас облаков для билбордов R3F | 1:1 | тот же файл | `gpt_image_2_6` | нет (альфа = яркость на чёрном) | нет | 4 облака в сетке 2×2, без перекрытий |
| `story-coast` | Сцена 4 «Прилёт»: плоскость с картой глубины, reduced motion | 16:9 | 9:16 (`-m`) | `soul_location` | нет | да, петля 5 с (ПК) | линия берега по диагонали, вода — в правых 2/3 |
| `story-terrace` | Сцена 5 «Вид с террасы», H2 и кнопка поверх | 16:9 | 9:16 (`-m`) | `soul_location` | нет | да, петля 5 с (ПК) | парапет в нижней трети, верхняя половина — чистое небо под H2 |
| `format-coast` | Сцена 6, формат «Отдых на побережье» (Бодрум) | 4:3 | тот же файл | `text2image_soul_v2` | нет | да, петля 5 с (ПК, при наведении) | женщина со спины, мелко, в левой трети |
| `format-cappadocia` | Сцена 6, формат «Каппадокия» | 4:3 | тот же файл | `soul_location` | нет | да, 5 с без петли (ПК, один раз) | терраса пещерного отеля на первом плане слева внизу, шары — в верхних 2/3 |
| `format-istanbul` | Сцена 6, формат «Стамбул» | 4:3 | тот же файл | `soul_location` | нет | нет | стакан чая на первом плане справа внизу, Босфор в дымке |
| `format-route` | Сцена 6, формат «Маршрут по стране» | 4:3 | тот же файл | `soul_location` | нет | нет | дорога S-образно, машина на правой трети |
| `tex-tuff` | Фон цитат и разворотов (туф) | 1:1, тайл | тот же файл | `gpt_image_2_6` | нет | нет | бесшовная, низкий контраст |
| `tex-linen` | Фон формы-талона и белых разворотов | 1:1, тайл | тот же файл | `gpt_image_2_6` | нет | нет | бесшовная, почти однотонная |
| `tex-water` | Лента-разворот перед «Форматами», фон табло | 16:9 | 9:16 (`-m`) | `gpt_image_2_6` | нет | нет | вид сверху, без горизонта |
| `tex-plaster-shadow` | Фон разворота «Наталья» и «Как мы работаем» | 16:9 | 9:16 (`-m`) | `gpt_image_2_6` | нет | нет | тени листьев в одном углу, остальное — чистое поле |
| `step-talk` | Сцена 9, шаг 01 «Разговор и пожелания» | 1:1 | тот же файл | `gpt_image_2_6` | нет | нет | вид сверху |
| `step-options` | Сцена 9, шаг 02 «Подбор вариантов» | 1:1 | тот же файл | `gpt_image_2_6` | нет | нет | вид сверху |
| `step-documents` | Сцена 9, шаг 03 «Бронирование и документы» | 1:1 | тот же файл | `gpt_image_2_6` | нет | нет | вид сверху |
| `step-onway` | Сцена 9, шаг 04 «Связь во время поездки» | 1:1 | тот же файл | `gpt_image_2_6` | нет | нет | телефон экраном вниз — без текста на экране |
| `sticker-luggage-tag` | Стикер: обложка, история, форма; надпись — SVG поверх | 1:1 | тот же файл | `gpt_image_2_6` | да, PNG | нет | пустая бирка |
| `sticker-postage-stamp` | Стикер «марка авиапочты» у выпуска и формы | 1:1 | тот же файл | `gpt_image_2_6` | да, PNG | нет | марка без номинала и надписей |

**Итого:** 24 кадра. С отдельными вариантами для телефона — 30 генераций картинок. Плюс 4 видео.

Видео — только на ПК. На телефоне вместо них постер (тот же кадр `-m`): так экономим трафик и держим LCP. Если после прототипа решим, что на телефоне петли нужны, их можно сделать из кадров `-m` теми же командами.

Паспортные штампы «TÜRKİYE / AYT / IST / NAV» в пакет не входят: по `decision.md` это SVG, их рисуем вручную.

**Видео на сайте:** `muted playsinline loop preload="none"`, играет, только пока видно (IntersectionObserver). У петель есть кнопка паузы (WCAG 2.2.2: движение дольше 5 с). При `prefers-reduced-motion` и `saveData` показываем только постер. Петли не ставим рядом с текстом, который читают в этот момент: на террасе H2 короткий, а форматы на ПК играют только при наведении или фокусе.

## Промпты по сценам

Колонка «Негатив» — добавка к общему негативу. Alt — черновик на русском.

### Сцена 2 «Сборы» — предметы (вырезанный фон)

Все предметы снимаются одинаково: строго сверху, мягкий свет из окна слева сверху, без отбрасываемой тени. Тень на сайте добавляем одну и ту же через CSS `drop-shadow`, тогда при параллаксе на трёх уровнях предметы выглядят как одна раскладка.

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `pack-passport` | Single closed passport in a smooth deep navy leather travel cover without emblem, softly rounded corners, a thin sky blue ribbon bookmark peeking out, shot from directly overhead at 90 degrees, product still life, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background | cast shadow, state emblem, coat of arms, embossed lettering, hands, cropped edges | Атмосферный кадр: паспорт в синей обложке |
| `pack-boarding-pass` | Single blank paper boarding pass with a tear-off stub separated by a fine perforation line, matte milk-white card with one thin deep navy band along the top edge and empty unprinted fields, lying flat, shot from directly overhead at 90 degrees, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background | cast shadow, printed characters, barcode, QR code, airline name, cropped edges | Атмосферный кадр: посадочный талон |
| `pack-sunglasses` | A pair of modern acetate sunglasses in warm tuff-beige tortoiseshell with deep navy tinted lenses, arms open, lying flat, shot from directly overhead at 90 degrees, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background | cast shadow, brand engraving on temples, reflections of a photographer, cropped edges | Атмосферный кадр: солнцезащитные очки |
| `pack-scarf` | Loosely folded square silk scarf with an original abstract print of overlapping arches and soft waves in deep navy, sky blue and milk white with a thin brick red border, natural folds and gentle sheen, flat lay shot from directly overhead at 90 degrees, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background | cast shadow, designer monogram, recognizable fashion-house pattern, paisley cliche, cropped edges | Атмосферный кадр: шёлковый платок |
| `pack-panama` | Small child-size natural woven straw panama hat with a deep navy grosgrain ribbon, crown up, shot from directly overhead at 90 degrees, evenly lit by soft window light from the upper left, whole object in frame with wide margin, isolated on a plain seamless light grey background | child, person, head, cast shadow, label, cropped edges | Атмосферный кадр: детская соломенная панама |

### Сцена 2 «Сборы» — общий кадр раскладки

Генерируется **после** вырезок: файлы `pack-*.png` подаются как `--image` (референсы), чтобы предметы в общем кадре совпадали с теми, что лежат в DOM.

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `story-flatlay` (ПК, 16:9) | Overhead flat lay on a matte milk-white paper surface with the referenced passport, boarding pass, sunglasses, silk scarf and child-size straw panama hat arranged in a loose editorial grid, objects grouped in the right two thirds of the frame, clean empty space across the left third for a text column, soft morning window light from the upper left with gentle short shadows | clutter, extra objects, phone, laptop, coffee cup, hands | Атмосферный кадр: вещи к поездке — паспорт, талон, очки, платок, детская панама |
| `story-flatlay-m` (телефон, 9:16) | Vertical overhead flat lay on a matte milk-white paper surface with only the referenced passport, boarding pass and child-size straw panama hat, larger in frame, grouped in the lower two thirds, clean empty space across the upper third for a headline, soft morning window light from the upper left with gentle short shadows | clutter, extra objects, hands | Атмосферный кадр: паспорт, посадочный талон и детская панама |

### Сцена 3 «Полёт»

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `story-window` (16:9) | View from a passenger aircraft window seat at cruising altitude in early morning, the window frame itself out of shot, a soft sky gradient from pale sky blue at the zenith to milky white at the horizon, a calm sunlit cloud deck below, the tip of a plain white unmarked wing entering from the left edge in the lower third, low sun from the right casting warm rim light on the cloud tops, calm open sky above | window frame, cabin interior, airline livery, registration numbers, winglet logo, lens flare streaks, storm clouds | Атмосферный кадр: крыло самолёта над облаками утром |
| `story-window-m` (9:16) | Vertical view from a passenger aircraft window seat at cruising altitude in early morning, the window frame itself out of shot, tall soft sky gradient from pale sky blue at the top to milky white at the horizon, a calm sunlit cloud deck in the lower part, the tip of a plain white unmarked wing entering from the left edge in the lower quarter, low sun from the right, open clean sky in the upper third | window frame, cabin interior, airline livery, registration numbers, lens flare streaks | Атмосферный кадр: крыло самолёта над облаками утром |
| `tex-cloud-atlas` (1:1, без якоря) | Texture atlas for a real-time engine: four separate soft cumulus cloud puffs arranged in a 2 by 2 grid, each cloud centered in its own quadrant with wide empty margins and no overlap, white and pale grey volumetric clouds lit from the upper right with soft shading, on a pure flat black background, no text, no logos | horizon, sky gradient, ground, stars, overlap between quadrants | — (декоративная текстура, `aria-hidden`) |

`tex-cloud-atlas` — техническая текстура: альфу получаем из яркости (чёрный = прозрачно), в шейдере `alpha = luminance`. Карта глубины для сцены 4 считается отдельно и офлайн (Depth Anything) из `story-coast.png`, Higgsfield для неё не нужен.

### Сцена 4 «Прилёт»

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `story-coast` (16:9) | Aerial view at a 60-degree angle over the Aegean coast of Turkey in late morning, clear turquoise and deep teal water over pale limestone rocks and a small pebble cove, the coastline running diagonally from the upper left to the lower right, a few pine trees on the cliffs, open sea filling the right two thirds, calm and uninhabited | boats, yachts, buildings, people, umbrellas, drone shadow | Атмосферный кадр: Эгейское побережье сверху |
| `story-coast-m` (9:16) | Vertical aerial view at a 60-degree angle over the Aegean coast of Turkey in late morning, clear turquoise and deep teal water over pale limestone rocks, the coastline running diagonally from the top left to the bottom right, a few pine trees on the cliffs, calm open water in the upper third, uninhabited | boats, yachts, buildings, people, umbrellas | Атмосферный кадр: Эгейское побережье сверху |

### Сцена 5 «Вид с террасы»

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `story-terrace` (16:9) | Hotel terrace above the Aegean Sea at golden hour, eye-level view, a low whitewashed stone parapet across the lower third, one linen-covered sun lounger with a folded tuff-beige towel at the right third, calm sea running to a clean straight horizon, soft pale sky taking the upper half as open space, warm low sunlight from the left, quiet and uninhabited | people, pool, umbrellas with logos, cocktail props, hotel signage, tilted horizon | Атмосферный кадр: терраса с видом на море вечером |
| `story-terrace-m` (9:16) | Vertical view from a hotel terrace above the Aegean Sea at golden hour, eye level, a low whitewashed stone parapet and the end of one linen-covered sun lounger in the lower third, calm sea to a clean straight horizon, tall soft pale sky above as open space for a large headline, warm low sunlight from the left, uninhabited | people, pool, umbrellas with logos, hotel signage, tilted horizon | Атмосферный кадр: терраса с видом на море вечером |

### Сцена 6 «Форматы Турции»

Все четыре кадра в одном формате 4:3, чтобы табло и карточки шли ровным рядом. У всех один свет — мягкий, без полуденной жёсткости.

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `format-coast` | Bodrum peninsula on the Aegean coast, a woman in a loose milk-white linen dress with a navy silk scarf seen from behind with her back to the camera, face not visible, standing at a whitewashed terrace wall small in the left third of the frame, looking over a calm turquoise bay with white cubic houses and pink bougainvillea on the hillside, late afternoon sun | face, profile, children, yachts, gulets, crowds, swimwear, shop signs | Атмосферный кадр: побережье Бодрума |
| `format-cappadocia` | Cappadocia at sunrise seen from a cave hotel terrace, carved tuff stone arches and a low wall with a woven kilim and a brass lantern in the foreground at the lower left, beyond them fairy chimneys and soft tuff valleys, a dozen plain hot air balloons in muted cream, sky blue and brick tones floating in pale morning sky in the upper two thirds, uninhabited | lettering or logos on balloons, people, tourists with phones, oversaturated sunrise | Атмосферный кадр: воздушные шары над Каппадокией |
| `format-istanbul` | Istanbul in early morning from a quiet rooftop terrace, a slim tulip-shaped glass of Turkish tea on a stone ledge in the foreground at the lower right, beyond it the Bosphorus in soft haze with the silhouettes of domes and minarets, one white passenger ferry crossing, a few gulls, pale sky blue and milky light, uninhabited | people, crowds, shop signs, flags with text, night lights, heavy fog | Атмосферный кадр: Босфор утром |
| `format-route` | Aerial view of a winding road curving in an S-shape through olive groves and pine hills above the Aegean, one small plain white car without badges on the road at the right third, warm tuff-coloured earth, teal sea along the top edge, late afternoon light, a quiet road-trip mood | car badges, license plates, traffic, road signs with text, trucks, people | Атмосферный кадр: дорога через оливковые рощи у моря |

### Фон-текстуры для разворотов

Для бесшовных текстур (`tex-tuff`, `tex-linen`) вместо стиль-якоря используем технический якорь `TEX`, палитра задана в самом промпте. Текст поверх текстур — только при контрасте не ниже 4,5:1. Проверяем на самом светлом и самом тёмном месте текстуры. На сайте их можно тонировать CSS-слоем цвета палитры.

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `tex-tuff` (1:1, `TEX`) | Macro surface of soft Cappadocia volcanic tuff stone, fine porous grain and faint gentle chisel marks, warm tuff beige #CFC2AE | cracks, moss, dark stains, strong relief | — (`aria-hidden`) |
| `tex-linen` (1:1, `TEX`) | Close-up of washed milk-white linen fabric, fine slub weave, smooth and flat, color #F6F3EC | wrinkles, folds, stitching, stains | — (`aria-hidden`) |
| `tex-water` (16:9) | Top-down view of clear Aegean sea surface, gentle ripples with soft caustic light patterns, gradient from Aegean teal #2F6F8F to sky blue #A9CDEB, no horizon, calm and even, suitable as a full-bleed background | horizon, boats, swimmers, foam, sun glare hotspots | — (`aria-hidden`) |
| `tex-water-m` (9:16) | Vertical top-down view of clear Aegean sea surface, gentle ripples with soft caustic light, gradient from Aegean teal #2F6F8F at the bottom to sky blue #A9CDEB at the top, no horizon, calm and even, suitable as a full-bleed background | horizon, boats, swimmers, foam, sun glare hotspots | — (`aria-hidden`) |
| `tex-plaster-shadow` (16:9) | Sunlit milk-white lime-plaster wall seen straight on, soft blurred shadows of olive leaves falling only across the upper right corner, the rest of the wall calm and empty, airy and warm, suitable as a background behind text | window, furniture, cracks, dirt, hard sharp shadows across the whole frame | — (`aria-hidden`) |
| `tex-plaster-shadow-m` (9:16) | Vertical sunlit milk-white lime-plaster wall seen straight on, soft blurred shadows of olive leaves falling only across the top edge, the rest of the wall calm and empty, airy and warm, suitable as a background behind text | window, furniture, cracks, dirt, hard shadows across the whole frame | — (`aria-hidden`) |

### Сцена 9 «Как мы организуем поездку» — небольшие кадры шагов

Это необязательная часть: можно обойтись штампами-иконками в SVG. Решаем на прототипе. Все четыре кадра — натюрморты сверху, без людей. Картинки отражают смысл шага, но ничего не обещают: на них нет сроков, экранов и «24/7».

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `step-talk` | Two small cups of Turkish coffee and a glass of water on a round white marble café table with a folded deep navy linen napkin, shot from directly overhead, soft morning light from the upper left | hands, people, saucers with logos, sugar packets with text | Атмосферный кадр: две чашки кофе на столе |
| `step-options` | A calm arrangement on a milk-white surface of a folded linen towel, a smooth tuff stone pebble, a sprig of olive and a brass room key without engraving, shot from directly overhead, soft morning light from the upper left | numbers on the key, brochures, printed paper, hands | Атмосферный кадр: ключ, полотенце и ветка оливы |
| `step-documents` | A deep navy leather travel document folder slightly open with blank cream cards inside and a brass paper clip, on a milk-white surface, shot from directly overhead, soft morning light from the upper left | printed text, tickets with characters, passport emblem, hands | Атмосферный кадр: папка для документов в поездку |
| `step-onway` | A smartphone lying face down beside a slim glass of Turkish tea on a sunlit stone terrace table, the sea softly blurred in the background, warm late afternoon light | visible screen, phone brand logo, camera bump branding, hands, people | Атмосферный кадр: телефон и стакан чая на террасе |

### Стикеры (вырезанный фон)

Надписи на стикерах накладываем в SVG поверх пустой бирки или марки. Штампы «TÜRKİYE / AYT / IST / NAV» рисуем в SVG целиком.

| id | Промпт (EN) | Негатив (EN) | Alt (RU) |
| --- | --- | --- | --- |
| `sticker-luggage-tag` | A single blank cream card luggage tag with a reinforced round eyelet and a looped deep navy string, very slightly curled, no printing, shot from directly overhead, evenly lit, whole object in frame with wide margin, isolated on a plain seamless light grey background | printed text, barcode, airline name, cast shadow, cropped edges | — (декор, `aria-hidden`) |
| `sticker-postage-stamp` | A single blank postage stamp with a perforated deckle edge and a milk-white border, inside a small flat illustration of one hot air balloon over soft tuff hills in brick red, deep navy and sky blue, no denomination and no lettering, flat scan, whole object in frame with wide margin, isolated on a plain seamless light grey background | numbers, lettering, country name, postmark text, cast shadow, cropped edges | — (декор, `aria-hidden`) |

### Видео (image-to-video, Seedance 2.5, 5 с, только ПК)

Камера во всех видео неподвижна. Камеру ведёт скролл на сайте; если добавить в ролик собственное движение, получится два движения в одном кадре.

| Файл | Стартовый кадр | Петля | Промпт движения (EN) | Где и как играет |
| --- | --- | --- | --- | --- |
| `story-coast-loop.mp4` | `story-coast.png` | да (`--end-image` = старт) | Locked-off static camera. Gentle waves and sparkling light glints move across the water, foam softly breathes at the rocks, pine branches barely sway. Subtle seamless loop, no camera movement, no new objects, no boats appear, no text. | Видеотекстура плоскости в сцене 4 вместо фото. Карта глубины — из стартового кадра, поэтому камера в ролике обязана стоять. |
| `story-terrace-loop.mp4` | `story-terrace.png` | да | Locked-off static camera. The calm sea shimmers, the edge of the folded towel lifts slightly in a light breeze, soft light flickers on the water. Subtle seamless loop, no camera movement, no people appear, no text. | Фон сцены 5 под H2 и кнопкой. Перед отъездом камеры подменяется на DOM-картинку. |
| `format-coast-loop.mp4` | `format-coast.png` | да | Locked-off static camera. A light breeze moves the hem of the linen dress and the ends of the scarf, the woman stays still with her back to the camera and does not turn around, the water sparkles in the bay. Subtle seamless loop, no camera movement, no text. | Карточка формата при наведении или фокусе (ПК). |
| `format-cappadocia.mp4` | `format-cappadocia.png` | нет | Very slow locked-off shot. The hot air balloons rise gently and drift slightly to the right, the lantern flame flickers softly. Calm, no camera movement, no new objects, no lettering on balloons. | Проигрывается один раз при первом входе карточки в кадр (ПК) и остаётся на последнем кадре. Шары летят в одну сторону, поэтому бесшовная петля из этого ролика не получится. |

Если стык петли заметен, склеиваем конец с началом кроссфейдом 0,4 с в ffmpeg (команда ниже).

## Команды CLI

### Шаг 0. Подготовка (делает пользователь или по его подтверждению)

```bash
# Вход в аккаунт — интерактивно, запускает пользователь сам
higgsfield auth login
higgsfield workspace set <workspace_id>   # CLI сейчас пишет «No workspace selected»
higgsfield account status

# Сверить ID моделей и живые схемы (сомнения 1–5 выше)
higgsfield model list --json | jq -r '.. | .job_set_type? // empty' | grep -E 'gpt_image_2_6|soul_location|text2image_soul_v2|seedance_2_5'
for m in gpt_image_2_6 soul_location text2image_soul_v2 seedance_2_5; do
  higgsfield model get "$m" --json | jq '{aspect_ratios, durations, parameters, medias}'
done

# Необязательно: сколько стоит один кадр
higgsfield generate cost gpt_image_2_6 --prompt "test" --aspect_ratio 1:1 --resolution 2k
```

### Шаг 1. Общий заголовок (вставить в терминал один раз, дальше — блоки по сценам)

```bash
cd /home/user/-tourism
OUT=site/public/media
mkdir -p "$OUT"
LOG="$OUT/_higgsfield.log"

ANCHOR="contemporary fashion-magazine travel photography, editorial composition with generous negative space, natural daylight, soft contrast, palette of milk white #F6F3EC, deep navy #13294B, sky blue #A9CDEB, Cappadocia tuff beige #CFC2AE and Aegean teal water #2F6F8F with a rare small accent of brick red #A3433B, cool navy-tinted shadows and warm milky highlights, fine 35mm grain, no text, no logos, no brand marks, no airline livery"
TEX="seamless tileable flat surface texture, edges wrap perfectly, even diffused daylight, straight-on view without perspective, no vignette, low contrast, no text, no logos"
AVOID="text, letters, numbers, captions, watermark, signage, logos, brand labels, airline livery, recognizable faces, children in close-up, oversaturated HDR colors, vintage sepia, aged or torn paper, heavy vignette, tilt-shift, plastic CGI look, extra fingers"

# Прозрачный фон: заполнить после шага 0, если у gpt_image_2_6 есть параметр background
CUT=()            # например: CUT=(--background transparent)

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

exists() { compgen -G "$OUT/$1.*" >/dev/null && echo "пропуск: $1 уже есть"; }

# gen <id> <model> <prompt> <доп. негатив> [параметры модели...]  — со стиль-якорем
gen() {
  local id="$1" model="$2" prompt="$3" extra="$4"; shift 4
  exists "$id" && return 0
  fetch "$id" img "$(higgsfield generate create "$model" \
    --prompt "$prompt. $ANCHOR. Avoid: $AVOID, $extra." "$@" --wait --wait-timeout 20m 2>&1)"
}

# gen_raw — без стиль-якоря (технические текстуры); якорь передаётся в prompt явно
gen_raw() {
  local id="$1" model="$2" prompt="$3" extra="$4"; shift 4
  exists "$id" && return 0
  fetch "$id" img "$(higgsfield generate create "$model" \
    --prompt "$prompt. Avoid: $extra." "$@" --wait --wait-timeout 20m 2>&1)"
}

# vid <id> <стартовый кадр> <prompt> [доп. флаги]  — Seedance 2.5, 5 с, 1080p
vid() {
  local id="$1" start="$2" prompt="$3"; shift 3
  exists "$id" && return 0
  fetch "$id" vid "$(higgsfield generate create seedance_2_5 --mode omni_reference \
    --start-image "$start" --prompt "$prompt" --duration 5 --resolution 1080p \
    --generate_audio false "$@" --wait --wait-timeout 30m 2>&1)"
}
```

Повторный запуск пропускает уже скачанные кадры. Чтобы перегенерировать кадр, удалите его файл. **Первым запустите один кадр** (`pack-passport`) и проверьте, что `fetch` взял ссылку на результат, а не на загруженный референс: лог лежит в `site/public/media/_higgsfield.log`.

### Шаг 2. Сцена 2 «Сборы» — вырезки предметов

```bash
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
```

Если прозрачного фона в модели нет, вырезаем локально (установка `rembg` — только с разрешения пользователя):

```bash
for f in "$OUT"/pack-*.png "$OUT"/sticker-*.png; do rembg i "$f" "${f%.png}.cut.png" && mv "${f%.png}.cut.png" "$f"; done
```

### Шаг 3. Сцена 2 — общий кадр раскладки (после вырезок)

```bash
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
```

### Шаг 4. Сцены 3–5: полёт, прилёт, терраса

```bash
gen story-window soul_location \
  "View from a passenger aircraft window seat at cruising altitude in early morning, the window frame itself out of shot, a soft sky gradient from pale sky blue at the zenith to milky white at the horizon, a calm sunlit cloud deck below, the tip of a plain white unmarked wing entering from the left edge in the lower third, low sun from the right casting warm rim light on the cloud tops, calm open sky above" \
  "window frame, cabin interior, airline livery, registration numbers, winglet logo, lens flare streaks, storm clouds" \
  --aspect_ratio 16:9

gen story-window-m soul_location \
  "Vertical view from a passenger aircraft window seat at cruising altitude in early morning, the window frame itself out of shot, tall soft sky gradient from pale sky blue at the top to milky white at the horizon, a calm sunlit cloud deck in the lower part, the tip of a plain white unmarked wing entering from the left edge in the lower quarter, low sun from the right, open clean sky in the upper third" \
  "window frame, cabin interior, airline livery, registration numbers, lens flare streaks" \
  --aspect_ratio 9:16

gen_raw tex-cloud-atlas gpt_image_2_6 \
  "Texture atlas for a real-time engine: four separate soft cumulus cloud puffs arranged in a 2 by 2 grid, each cloud centered in its own quadrant with wide empty margins and no overlap, white and pale grey volumetric clouds lit from the upper right with soft shading, on a pure flat black background, no text, no logos" \
  "horizon, sky gradient, ground, stars, overlap between quadrants, text, logos" \
  --aspect_ratio 1:1 --resolution 2k --output_format png

gen story-coast soul_location \
  "Aerial view at a 60-degree angle over the Aegean coast of Turkey in late morning, clear turquoise and deep teal water over pale limestone rocks and a small pebble cove, the coastline running diagonally from the upper left to the lower right, a few pine trees on the cliffs, open sea filling the right two thirds, calm and uninhabited" \
  "boats, yachts, buildings, people, umbrellas, drone shadow" \
  --aspect_ratio 16:9

gen story-coast-m soul_location \
  "Vertical aerial view at a 60-degree angle over the Aegean coast of Turkey in late morning, clear turquoise and deep teal water over pale limestone rocks, the coastline running diagonally from the top left to the bottom right, a few pine trees on the cliffs, calm open water in the upper third, uninhabited" \
  "boats, yachts, buildings, people, umbrellas" \
  --aspect_ratio 9:16

gen story-terrace soul_location \
  "Hotel terrace above the Aegean Sea at golden hour, eye-level view, a low whitewashed stone parapet across the lower third, one linen-covered sun lounger with a folded tuff-beige towel at the right third, calm sea running to a clean straight horizon, soft pale sky taking the upper half as open space, warm low sunlight from the left, quiet and uninhabited" \
  "people, pool, umbrellas with logos, cocktail props, hotel signage, tilted horizon" \
  --aspect_ratio 16:9

gen story-terrace-m soul_location \
  "Vertical view from a hotel terrace above the Aegean Sea at golden hour, eye level, a low whitewashed stone parapet and the end of one linen-covered sun lounger in the lower third, calm sea to a clean straight horizon, tall soft pale sky above as open space for a large headline, warm low sunlight from the left, uninhabited" \
  "people, pool, umbrellas with logos, hotel signage, tilted horizon" \
  --aspect_ratio 9:16
```

### Шаг 5. Сцена 6 «Форматы Турции»

```bash
gen format-coast text2image_soul_v2 \
  "Bodrum peninsula on the Aegean coast, a woman in a loose milk-white linen dress with a navy silk scarf seen from behind with her back to the camera, face not visible, standing at a whitewashed terrace wall small in the left third of the frame, looking over a calm turquoise bay with white cubic houses and pink bougainvillea on the hillside, late afternoon sun" \
  "face, profile, children, yachts, gulets, crowds, swimwear, shop signs" \
  --aspect_ratio 4:3 --quality 2k

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
```

### Шаг 6. Фон-текстуры

```bash
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
```

### Шаг 7. Сцена 9 — кадры шагов (по решению на прототипе)

```bash
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
```

### Шаг 8. Стикеры

```bash
gen sticker-luggage-tag gpt_image_2_6 \
  "A single blank cream card luggage tag with a reinforced round eyelet and a looped deep navy string, very slightly curled, no printing, shot from directly overhead, evenly lit, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "printed text, barcode, airline name, cast shadow, cropped edges" \
  --aspect_ratio 1:1 --resolution 2k --output_format png "${CUT[@]}"

gen sticker-postage-stamp gpt_image_2_6 \
  "A single blank postage stamp with a perforated deckle edge and a milk-white border, inside a small flat illustration of one hot air balloon over soft tuff hills in brick red, deep navy and sky blue, no denomination and no lettering, flat scan, whole object in frame with wide margin, isolated on a plain seamless light grey background" \
  "numbers, lettering, country name, postmark text, cast shadow, cropped edges" \
  --aspect_ratio 1:1 --resolution 2k --output_format png "${CUT[@]}"
```

### Шаг 9. Видео (после утверждения стартовых кадров)

```bash
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
```

### Шаг 10. Подготовка к вебу (локально, после генерации)

Сырые PNG и MP4 тяжёлые. На GitHub Pages `next/image` не оптимизирует картинки (`images: { unoptimized: true }`), поэтому веб-версии готовим заранее.

```bash
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
```

Бюджет: постер сцены ≤ 250 КБ (ПК) и ≤ 150 КБ (телефон), вырезка предмета ≤ 120 КБ, петля 5 с ≤ 2,5 МБ. В репозиторий кладём только веб-версии. Исходники генераций храним вне публичного репо или добавляем в `.gitignore` — решить с пользователем.

## Приёмка кадра (перед тем как ставить на сайт)

- В кадре нет текста, букв, цифр, логотипов, ливреи, значков на машине и надписей на шарах. Если есть, перегенерировать или зачистить.
- Нет лиц и детей. Человек в `format-coast` стоит строго спиной.
- Горизонт ровный. Пустая зона под текст стоит там, где указано в «Кадрировании».
- Палитра в пределах якоря: море — бирюза и эгейский синий, без кислотного циана. Кирпичный — только точкой.
- Все предметы сборов сняты в одной проекции (строго сверху) с одним светом (слева сверху).
- У вырезок чистый край, без серого ореола от фона.
- Петли: камера стоит, стык не виден, ничего не появляется и не исчезает.
- В разметке: `data-atmosphere`, alt из таблиц выше. Подписей под картинками нет. Ни один кадр не стоит рядом со словами «наши туристы», «наша поездка», «отель из подборки».

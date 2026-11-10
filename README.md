# Tin học vui

Interactive lessons for Tin học lớp 4 and lớp 5 (Kết nối tri thức curriculum), built for tablets and the Kindle Paperwhite 5 browser.

Plain HTML + CSS + ES5 JavaScript. There is no build step and nothing to install.

## Run locally

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 8765
```

Open http://localhost:8765. Opening the files directly with `file://` also works in a normal browser.

## Structure

- `index.html`: home page, learner names, lesson list (the `GRADES` data marks which lessons are ready)
- `assets/css/main.css`: design tokens, e-ink mode (`html.eink`), shared widgets
- `assets/js/core.js`: profiles, stars, the step pager, quiz, and the tap-to-sort widget
- `assets/js/icons.js`: inline SVG icons (no emoji, since Kindle may lack an emoji font)
- `assets/js/blocklab.js`: a Scratch-like grid game for the programming lessons
- `lop4/`, `lop5/`: one HTML file per lesson

## E-ink mode

E-ink mode turns on automatically for Kindle, Kobo and PocketBook browsers. It can also be turned on with `?eink=1` or the "Màn hình mực" button. It switches to black and white and removes motion. It shows state with borders and words, never with colour alone.

## Adding a lesson

1. Copy an existing lesson page.
2. Keep the SGK phases: Khởi động → Khám phá → Luyện tập → Vận dụng.
3. Make every step fit one tablet screen (1300×700, no scrolling). Start the step with `.step-head` (phase badge and title on one line). Split content into `.cols` with `.col` / `.col-side` children: they sit side by side from 900px wide and stack on narrow screens. If a step still doesn't fit, split it into two steps.
4. Give each activity a star with `Core.award(lessonId, activityId)`. The `Core.quiz` and `Core.sort` widgets already call it.
5. In `index.html`, add `id`, `href` and `stars` (the number of starred activities) to the lesson entry.

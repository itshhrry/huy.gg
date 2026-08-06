# Impeccable remediation progress

Baseline critique: `.impeccable/critique/2026-08-05T22-32-55Z__index-html.md`, scored **24/40**, 4 P1 and 1 P2.
Scope agreed: everything, including the aesthetic rework. Direction: design the light theme properly, keep `#F4F1EA`.

All work is **local and uncommitted**. Branch `main` at `b1fd4b8`. huy.gg still serves the pre-remediation build.

---

## Done

### 1. colorize: the light theme, composed against its own ground

| Page | Light AA failures before | After |
|---|---|---|
| index.html | 21 | **0** |
| resume.html | 10 | **0** (all three tabs driven) |
| projects.html | 5 | **1** |
| about.html | 1 | **0** |
| dark theme | 0 | **0**, untouched |

The one survivor is the terminal hint text on projects.html at 3.82:1, `rgba(255,255,255,.4)` on a hard-coded `#0F1115` block. Independent of the token system; needs that block's own value changed.

Token changes, light block only:

- `--muted2` `#837C70` to `#675F53`. Old value failed every light ground, worst 2.88:1 under the hero stat cells.
- `--surface` / `--surface2` from a dark wash to a white wash. This is the real fix for the 2.88:1 case: `rgba(26,22,19,.05)` composited to `#DDD7CC` there. Light-mode elevation now rises toward white, matching what `--panel-grad` already did.
- `--accent` `#C04000` to `#AB3900`. Small accent text was failing on the card rim at 4.06:1.
- `--flare` given a distinct value, `#B32B00`. It had collapsed to the same hex as `--accent`, leaving light mode with no two-tone system. **First attempt used `#D24A12` and took failures from 21 to 61**, because flare carries text, not just decoration. Corrected by moving the heat into hue rather than lightness.
- `--strong` `#000000` to `#12100E`, tinted toward its ground.
- `body{background:#08090B}` removed on all five pages. Dark now comes from `html:has(#home-root[data-theme="dark"]) body`.

### 2. clarify: the metric error

- `NPS 92%` to `NPS score 92`. Net Promoter Score is an index from -100 to +100, not a percentage. `data-suffix` emptied so the count-up no longer appends one.
- `Retention` to `Staff retention`, giving the figure its population.
- `resume-data.js`: `89-93% net promoter scores` to `89 to 93 net promoter scores`.

### 3. harden: partial

- **Per-page `<title>`, meta description, canonical, author, `color-scheme`, favicon link, six `og:` tags, three `twitter:` tags** on all five pages. Verified: tab now reads `Harry Nguyen | Revenue Cycle and Data Analyst`.
- **Both dead Google Fonts preconnects deleted** from all five pages. No stylesheet, no `@font-face`, body stack is Arial, so they were opening two DNS and TLS handshakes per load for nothing.
- **Real `@media (prefers-reduced-motion: reduce)`** in CSS on all five pages, so it applies before scripts run and cannot be bypassed by the hard-coded `data-rm="0"`. Suppresses `#phx-canvas` outright rather than running it at 1ms, since a 1ms flight still teleports the bird across the headline.
- **Designed focus state.** `#home-root :focus-visible{outline:2px solid var(--accent);outline-offset:3px}` plus `:focus:not(:focus-visible){outline:none}`. Verified on real keyboard focus: matches `:focus-visible`, 5.61:1 against the page ground where 3:1 is the bar.

---

### 4. harden, second pass

- **Resume tabs are now a real tablist.** `role="tablist"` with a label, `role="tab"` with ids and `aria-controls` on all three buttons, `aria-selected` and a roving `tabIndex` kept in sync inside `renderTab`, `role="tabpanel"` plus `tabindex="0"` and `aria-live="polite"` on `#r-exp`, `aria-live="polite"` on `#r-note`, and Left/Right/Home/End arrow-key navigation. Verified: exactly one tab reachable by Tab, correct roles and relationships.
- **Touch targets.** Nav and footer links now measure **44px** tall, verified in the render. The hit area grows via `padding-inline:8px` cancelled by `margin-inline:-8px`, so nothing moves visually. Brand link stays 34px and the theme toggle 38px; both clear the 24x24 AA floor.
- **`aria-current="page"`** on each page's own nav link. It had been marked by colour alone.
- **Theme toggle** now keeps `aria-pressed` and its `aria-label` in sync with the real state instead of a static label.

### 5. optimize

- **All 8 content images plus every logo now carry intrinsic `width`/`height`**, so layout reserves space before decode. Verified: 0 images missing dimensions.
- **`loading="lazy"` and `decoding="async"`** on everything below the first screen.
- **`logo-cream.png`** (128KB, the dark-theme logo, permanently `display:none` under the light default) is now lazy, so it is no longer fetched eagerly on every page load.
- **Fragment-scroll correction** added to index and projects: re-applies `location.hash` on `window.load` and again 250ms later.

---

## Retracted: the resume is not broken

An earlier revision of this file claimed the three-variant resume rendered nothing in production. **That was wrong and has been retracted.** The resume works correctly.

What actually happened: `componentDidMount` defers the real work with `requestAnimationFrame(() => this.enhance())`, and `enhance()` is what wires the tab listeners and calls `renderTab('operations')`. **rAF does not fire while the Browser pane is hidden and no frame is being produced.** Every check I ran was script-only, so `enhance()` never executed, so the panels stayed empty and the buttons had no listeners. Taking a screenshot forces a frame; the page then rendered fully and every tab behaved.

The comparison against `git show HEAD:resume.html` reproduced the same emptiness for the same reason, which made a test artifact look like corroboration. Two observations agreeing does not make them evidence when both share a defect.

**Lesson for future verification in this environment: any behaviour behind `requestAnimationFrame` requires a forced frame before it can be observed.** Take a screenshot first, then measure. This applies to the resume tabs, the index count-up animation, the phoenix canvas, and the section reveal transitions.

Verified working after the ARIA changes: clicking Analyst recomposes `#r-exp` from 10,758 to 6,729 characters, so bullets are genuinely re-filtered per variant. The note swaps, `aria-selected` and the roving tabindex follow, ArrowRight wraps from last to first, and End jumps to last.

---

## Remaining

### harden, the rest
- **Skip link.** Needs markup: no `<main>` landmark exists, headers use `id="top"` on index only. Add a landmark first.
- **Resume tab ARIA.** Three bare `<button data-tab>` at `resume.html:116-118`. No `role="tablist"`, `aria-selected`, `aria-controls`, `role="tabpanel"`, `aria-live`, or arrow keys. WCAG 4.1.2 failure on the site's best feature.
- **`#term-input`** at `projects.html:404`: `tabIndex -1`, rect `0 x 14px`, `outline:none`. Mouse-only, no accessible name.
- **Theme toggle** has no `aria-pressed`; its icon SVGs have no accessible name.
- **Touch targets.** Nav links measure 36.6x16, 50.6x16, 52.1x16 at every breakpoint against a 44x44 minimum. Footer links 15 to 22px tall. Theme toggle 38x38.
- **Terminal hint text** on projects.html, the last remaining contrast failure.

### optimize
- **No `<img>` carries `width`/`height`**, zero of twelve. This is what breaks deep links: the document is short when the browser performs the fragment scroll and grows past the target as images decode. `projects.html#infra` lands at `scrollY 63` while `#infra` sits at `y 6835`.
- **No `loading="lazy"` anywhere.** projects.html ships 2.22MB eagerly.
- `rcm-report-analysis.png` 943KB for a 283x132 box; `rcm-report-summary.png` 757KB for 283x123. Roughly 9.6x linear over-delivery.
- `logo-cream.png` 128KB is fetched on every page load and rendered at 0x0, because it is the dark-theme logo and light is the default.
- Re-apply `location.hash` on `window.load` as a correction.

### typeset
- Every glyph on the site is Arial. 103 inline `font-family:Arial` declarations mark where a second family used to live. The reflex-reject list rules out most obvious replacements, so this needs a real decision. `projects.html:391` also ships a malformed stack, `Arial,Helvetica,sans-serif,ui-monospace,monospace`, where `sans-serif` terminates the chain and the mono entries are dead, so the terminal block renders in Arial.

### quieter
The AI-grammar layer, six absolute-ban violations: gradient text on the h1 (`index.html:98`), the hero-metric card (`:106-138`), side-stripe borders (`about.html:104`, `projects.html:356`), 37 uppercase eyebrows with 23 on projects alone, numbered scaffolding (`about.html` 01-06, `index.html:174-176`), and an identical three-card grid (`:206-275`). Plus the ghost-card pattern on 15 elements and 22px radii on 12 cards against a 12-16px ceiling.

### Open decisions, not defects
- **The bird.** Confirmed by screenshot to read as a squid rather than a phoenix, and it crosses the h1. Now hidden under reduced motion; not otherwise removed.
- **The eight-month gap.** Most recent role reads May to Dec 2025 against a date of August 2026. The site says nothing about it anywhere.
- **`PRODUCT.md` is at the repo root**, which GitHub Pages serves. It will be readable at `huy.gg/PRODUCT.md` if committed.
- **`og:image` points at `logo.png`**, a 1080x1080 square. Interim; a purpose-built 1200x630 card would unfurl properly.
- **No `prefers-color-scheme`.** `data-theme="light"` is hard-coded, so a visitor whose OS is dark still gets light.

---

## Working notes

- Files are **LF**, written by `build-static.py` with `newline="\n"`. PowerShell here-strings emit CRLF and will not match. Build replacement strings with an explicit `` "`n" ``.
- **Windows PowerShell 5.1 reads a BOM-less `.ps1` as ANSI.** A literal en-dash in script source is mangled before it reaches `.Replace()`. Use `[char]0x2013`. This cost one silent no-op on `resume-data.js`.
- `about.html` and `resume.html` had `crossorigin=""`; the other three had bare `crossorigin`. Two variants, not one.
- All edits must use `[System.IO.File]::ReadAllText(path, Encoding::UTF8)` and `WriteAllText(path, text, UTF8Encoding($false))`. These files carry `&bull;` entities and literal U+2022. Verified after every pass: zero mojibake, no BOM, no CR.
- **`requestAnimationFrame` never fires while the Browser pane is hidden.** Any `await` on rAF hangs the 30s tool budget. Use `void document.body.offsetHeight` for a synchronous style and layout flush instead.
- Contrast sweeps must composite **foreground** alpha, not just background. Missing that reported `rgba(255,255,255,.4)` as pure white.
- Always cache-bust (`?v=`) when verifying; the browser served a stale build on the first check and the measurement looked like a total failure.

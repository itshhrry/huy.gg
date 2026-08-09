# DESIGN.md

The visual system for huy.gg. PRODUCT.md governs strategy and voice. This file governs everything visual, and it wins on visual decisions.

---

## The one-sentence identity

A paper-ground document with black ink, a single burnt-orange accent, and figures set in tabular mono, arranged as a dense record rather than a marketing page.

---

## Ground and theme

**There is one theme, and it is light.** The dark theme was removed on 2026-08-07 along with its toggle, its stored preference, and its second token block. This is a deliberate commitment, not an omission, and it should not be reintroduced without a specific reason.

Three reasons it went:

1. **The audience never toggles.** A recruiter opens the link once, in whatever their browser already defaults to, and leaves inside two minutes. A theme control serves the site's owner and nobody else.
2. **Two grounds doubled every decision and halved the verification.** The light palette had been derived from the dark one by removing contrast rather than composed against paper, which produced 37 measured WCAG AA failures and a regression to 61 when a single token moved.
3. **The evidence is light.** Every screenshot on the site (the carbon grid, the RCM report, the confusion matrix) is a capture of a light interface. On paper they belong to the page. On a dark ground they become glowing rectangles that fight everything around them.

---

## Tokens

Declared once on `#home-root` in each page's inline style block. There is no second block and no `[data-theme]` variant.

| Token | Value | Job |
|---|---|---|
| `--bg` | `#FCFAF6` | The paper. Warm off-white, deliberately outside the L 0.84 to 0.97 / hue 40 to 100 cream band. |
| `--panel-grad` | `#ffffff` to `#FDFBF7` | Raised surfaces. Elevation rises toward white, which is how light-mode elevation actually works. |
| `--card-rim` | `#E8E3D9` | The outer edge on raised cards. |
| `--text` | `#17140F` | Body ink. |
| `--strong` | `#0E0C09` | Headings and emphasis. |
| `--muted` | `#635C51` | Secondary copy. |
| `--muted2` | `#5A5349` | Labels and captions. |
| `--accent` | `#C04000` | The single colour. Actions, figures, active states. |
| `--flare` | `#A93700` | The accent where it carries text on paper. Darker than `--accent` because it has to clear 4.5:1, and heat moves into hue rather than lightness. |
| `--border` / `--border2` / `--border3` | ink at 10% / 17% / 27% | Three rule weights, hairline to structural. |

**`--flare` carries text.** It is not decorative. It sits on "View Resume", "Selected work", and the footer link. Lightening it to add warmth breaks contrast in three places at once, which is exactly the regression that took the failure count from 21 to 61 on 2026-08-06. When more heat is wanted, move the hue, never the lightness.

**No atmosphere layers.** The aurora blobs and the noise overlay were built to give a black page atmosphere, and on paper they read as smudges. They were first neutralized by setting `--glowA`, `--glowB`, and `--glowC` to `transparent` and `--grain-op` to `0`, which hid them but left six blurred divs compositing and animating on every page for no visible output. Tokens and elements are both gone now. Do not reintroduce a decorative layer to give the page atmosphere; the ground, the type, and the evidence carry it.

---

## Colour discipline

One accent, and it earns its place every time it appears. The page is otherwise ink on paper.

Colour is allowed to mean something. Where a figure represents money recovered or an outcome achieved, the accent may carry it. Where a figure is context rather than outcome, it stays in ink. Colouring every number makes them all equally loud, which is the same failure as colouring none.

**No categorical palettes.** Multiple hues encoding multiple variables belong in a chart with a legend, not in page chrome. A four-colour stat row reads as a template.

---

## Type

- **Display and body:** a system grotesque stack. Arial is being retired across the site and should not be extended to new work.
- **Long-form copy:** Charter, falling back to Bitstream Charter, Iowan Old Style, then Georgia. A serif against a grotesque is a real contrast axis; two sans faces that almost match is not.
- **Figures:** `ui-monospace` with `font-variant-numeric: tabular-nums`. Mono is reserved for numbers, labels, and terminal content, so it reads as claims data rather than as costume.

Scale contrast does the work. Large figures against small labels, not medium against medium.

---

## Banned outright

These are absolute. A variant that reaches for one is wrong regardless of how it looks.

- **Gradient text.** The homepage `<h1>` carried an animated gradient clip; it is now solid `--accent`.
- **The hero metric card.** Figures belong beside the claim they support, in prose or in a rule-separated rail, never floating in a tilting card.
- **Side-stripe borders** as section decoration.
- **Uppercase eyebrows** stacked above headings. There were 37 across the site, 23 on the projects page alone.
- **Numbered scaffolding** (`01 / 02 / 03`) used as ornament.
- **Identical three-card grids** where three things are given equal weight because there happen to be three of them.
- **Shadows tuned for a black page.** `rgba(0,0,0,.35)` and heavier read as dirt on paper. Ink at 12 to 16 percent is the ceiling.

---

## Structure

The page opens in content. Identity, availability, and navigation sit in a thin bar; the substance starts immediately underneath. Nothing sells before the evidence arrives.

Header and footer are deliberately slim. They are orientation, not architecture.

Figures live inline, at the point of the claim they support. Where a set of figures needs to be read together, they go in a rule-separated rail, which is a table, not a row of cards.

Anything built and running carries its live URL on the entry itself. The argument the site makes is that the work is reachable, so the reachability is part of the design rather than a footnote.

---

## Accessibility

WCAG 2.1 AA is the floor, verified in a browser against computed styles with foreground alpha composited against the resolved ground, not asserted from token arithmetic.

- Body text clears 4.5:1. Large text and UI component boundaries clear 3:1.
- The focus ring is `2px solid var(--accent)` at `3px` offset, measured at 5.61:1. It is a designed state, not a browser default.
- Interactive targets are at least 44px tall.
- `prefers-reduced-motion: reduce` collapses animation to `.001ms` and hides the canvas entirely.

---

## Rendering

**Content must not wait on `requestAnimationFrame`.** A recruiter opens a candidate link into a background tab, and `rAF` does not fire in a non-compositing tab, so anything gated behind it renders blank for exactly the visitor the site is built for. The resume shipped in that state until 2026-08-06. Decorative canvas work may stay behind `rAF`; content may not.

Default content belongs in the HTML. JavaScript may enhance and may swap between states, but the page has to be complete and readable with scripting disabled.

---

## Contact

The email address does not appear on the page. It lives in the resume PDF, which is what a recruiter downloads anyway, and keeping it out of the markup avoids handing it to scrapers for no gain.

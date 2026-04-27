/* eslint-disable no-undef */
/* bg.jsx — site-wide static parallax background with 5 variants
   - Renders a fixed background layer behind everything.
   - On non-home pages: owns its own Tweaks panel (just the bg picker).
   - On the home page: hero.jsx merges bg controls into its panel and
     sets `window.__BG_OWNED_BY_HERO = true` BEFORE this script runs.
*/

const { useState, useEffect, useRef } = React;

/* ──────────────────────────────────────────────────────────
   Variant 1: Layered horizon — pale sand bottom → cream top
────────────────────────────────────────────────────────── */
function BgHorizon() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bgh-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--bg-horizon-top)"  />
          <stop offset="55%" stopColor="var(--bg-horizon-mid)" />
          <stop offset="100%" stopColor="var(--bg-horizon-bot)" />
        </linearGradient>
        <radialGradient id="bgh-sun" cx="0.78" cy="0.32" r="0.35">
          <stop offset="0%"  stopColor="var(--bg-horizon-glow)" stopOpacity="0.55" />
          <stop offset="60%" stopColor="var(--bg-horizon-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1100" fill="url(#bgh-grad)" />
      <rect width="1600" height="1100" fill="url(#bgh-sun)" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 2: Warm grain — flat cream + film grain
────────────────────────────────────────────────────────── */
function BgGrain() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bgg-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.18 0" />
        </filter>
      </defs>
      <rect width="1600" height="1100" fill="var(--bg)" />
      <rect width="1600" height="1100" filter="url(#bgg-noise)" opacity="0.6" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 3: Enso brushstroke — single faint circle top-right
────────────────────────────────────────────────────────── */
function BgEnso() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bge-rough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="22" />
        </filter>
        <radialGradient id="bge-fade" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%"  stopColor="black" stopOpacity="0" />
          <stop offset="55%" stopColor="black" stopOpacity="0.7" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <mask id="bge-mask">
          <rect width="1600" height="1100" fill="black" />
          <circle cx="1380" cy="240" r="380" fill="url(#bge-fade)" />
        </mask>
      </defs>
      <rect width="1600" height="1100" fill="var(--bg)" />
      <g opacity="0.55" mask="url(#bge-mask)">
        <circle cx="1380" cy="240" r="320"
          fill="none"
          stroke="var(--bg-enso-stroke)"
          strokeWidth="48"
          strokeLinecap="round"
          strokeDasharray="1900 250"
          strokeDashoffset="180"
          filter="url(#bge-rough)" />
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 4: Sumi ink wash — diagonal cloud
────────────────────────────────────────────────────────── */
function BgSumi() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bgs-blur"><feGaussianBlur stdDeviation="55" /></filter>
        <filter id="bgs-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.16  0 0 0 0 0.13  0 0 0 0.32 0" />
        </filter>
        <linearGradient id="bgs-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="var(--bg-sumi-ink)" stopOpacity="0" />
          <stop offset="40%"  stopColor="var(--bg-sumi-ink)" stopOpacity="0.18" />
          <stop offset="65%"  stopColor="var(--bg-sumi-ink)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--bg-sumi-ink)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1100" fill="var(--bg)" />
      <g filter="url(#bgs-blur)">
        <ellipse cx="900" cy="550" rx="900" ry="280" fill="url(#bgs-grad)" transform="rotate(-18 900 550)" />
        <ellipse cx="500" cy="800" rx="500" ry="180" fill="url(#bgs-grad)" transform="rotate(-22 500 800)" opacity="0.6" />
      </g>
      <rect width="1600" height="1100" filter="url(#bgs-noise)" opacity="0.4" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 5: Washi paper — fibers + warm paper tone
────────────────────────────────────────────────────────── */
function BgWashi() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bgw-fibers" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.012 0.45" numOctaves="2" seed="5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0.22 0" />
        </filter>
        <filter id="bgw-flecks" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="13" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.50  0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 0.10 0" />
        </filter>
      </defs>
      <rect width="1600" height="1100" fill="var(--bg)" />
      <rect width="1600" height="1100" filter="url(#bgw-fibers)" opacity="0.7" />
      <rect width="1600" height="1100" filter="url(#bgw-flecks)" opacity="0.4" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 6: Mist — soft horizontal bands, foggy gradient
────────────────────────────────────────────────────────── */
function BgMist() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bgm-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--bg-mist-top)" />
          <stop offset="100%" stopColor="var(--bg-mist-bot)" />
        </linearGradient>
        <filter id="bgm-blur"><feGaussianBlur stdDeviation="60" /></filter>
      </defs>
      <rect width="1600" height="1100" fill="url(#bgm-grad)" />
      <g filter="url(#bgm-blur)" opacity="0.7">
        <ellipse cx="200"  cy="280" rx="900" ry="55" fill="var(--bg-mist-band)" />
        <ellipse cx="1300" cy="500" rx="900" ry="40" fill="var(--bg-mist-band)" opacity="0.8" />
        <ellipse cx="400"  cy="750" rx="900" ry="50" fill="var(--bg-mist-band)" opacity="0.6" />
        <ellipse cx="1100" cy="950" rx="900" ry="35" fill="var(--bg-mist-band)" opacity="0.5" />
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 7: Paper — off-white with deckle edges + speckle
────────────────────────────────────────────────────────── */
function BgPaper() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bgp-deckle" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.012" numOctaves="2" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="120" />
        </filter>
        <filter id="bgp-speckle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="17" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.32  0 0 0 0.12 0" />
        </filter>
        <filter id="bgp-fiber" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="9" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0.06 0" />
        </filter>
      </defs>
      <rect width="1600" height="1100" fill="var(--bg-paper-shadow)" />
      <rect x="100" y="-50" width="1400" height="1200" fill="var(--bg-paper-sheet)" filter="url(#bgp-deckle)" />
      <rect width="1600" height="1100" filter="url(#bgp-fiber)" opacity="0.5" />
      <rect width="1600" height="1100" filter="url(#bgp-speckle)" opacity="0.4" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 8: Linen — woven cross-hatch fabric texture
────────────────────────────────────────────────────────── */
function BgLinen() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="bgl-weave" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="var(--bg-linen-base)" />
          <line x1="0" y1="0" x2="6" y2="6" stroke="var(--bg-linen-thread)" strokeWidth="0.6" opacity="0.5" />
          <line x1="6" y1="0" x2="0" y2="6" stroke="var(--bg-linen-thread)" strokeWidth="0.6" opacity="0.35" />
        </pattern>
        <filter id="bgl-soften" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="21" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.38  0 0 0 0 0.32  0 0 0 0.08 0" />
        </filter>
      </defs>
      <rect width="1600" height="1100" fill="url(#bgl-weave)" />
      <rect width="1600" height="1100" filter="url(#bgl-soften)" opacity="0.5" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 9: Garden — abstract leaves/branches in low-contrast
────────────────────────────────────────────────────────── */
function BgGarden() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bgg-soft"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      <rect width="1600" height="1100" fill="var(--bg-garden-base)" />
      <g stroke="var(--bg-garden-stroke)" fill="none" strokeLinecap="round" opacity="0.42" filter="url(#bgg-soft)">
        {/* Branch 1 (top-left) */}
        <path d="M -20 220 C 180 200, 260 180, 360 240 S 540 360, 700 320" strokeWidth="1.2" />
        <path d="M 200 215 q 25 -45 60 -55" strokeWidth="1" />
        <path d="M 320 240 q 30 -50 70 -60" strokeWidth="1" />
        <path d="M 440 280 q 35 -55 75 -60" strokeWidth="1" />
        <ellipse cx="245" cy="155" rx="22" ry="9" transform="rotate(-32 245 155)" fill="var(--bg-garden-stroke)" opacity="0.5" />
        <ellipse cx="375" cy="170" rx="24" ry="10" transform="rotate(-28 375 170)" fill="var(--bg-garden-stroke)" opacity="0.5" />
        <ellipse cx="495" cy="210" rx="26" ry="11" transform="rotate(-22 495 210)" fill="var(--bg-garden-stroke)" opacity="0.5" />

        {/* Branch 2 (mid-right) */}
        <path d="M 1620 480 C 1420 460, 1320 440, 1180 500 S 980 620, 820 580" strokeWidth="1.2" />
        <ellipse cx="1395" cy="420" rx="22" ry="9" transform="rotate(28 1395 420)" fill="var(--bg-garden-stroke)" opacity="0.45" />
        <ellipse cx="1265" cy="440" rx="24" ry="10" transform="rotate(22 1265 440)" fill="var(--bg-garden-stroke)" opacity="0.45" />
        <ellipse cx="1115" cy="475" rx="26" ry="11" transform="rotate(18 1115 475)" fill="var(--bg-garden-stroke)" opacity="0.45" />

        {/* Branch 3 (bottom) */}
        <path d="M -20 920 C 220 900, 380 870, 560 920 S 880 1000, 1100 970" strokeWidth="1.2" opacity="0.7" />
        <ellipse cx="280" cy="855" rx="20" ry="8" transform="rotate(-18 280 855)" fill="var(--bg-garden-stroke)" opacity="0.4" />
        <ellipse cx="450" cy="850" rx="22" ry="9" transform="rotate(-12 450 850)" fill="var(--bg-garden-stroke)" opacity="0.4" />
        <ellipse cx="640" cy="880" rx="24" ry="10" transform="rotate(-8 640 880)" fill="var(--bg-garden-stroke)" opacity="0.4" />
        <ellipse cx="830" cy="920" rx="22" ry="9" transform="rotate(-4 830 920)" fill="var(--bg-garden-stroke)" opacity="0.4" />
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 10: Stone — mottled cool minerality (river rock)
────────────────────────────────────────────────────────── */
function BgStone() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bgst-mottle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="29" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.40  0 0 0 0 0.43  0 0 0 0 0.46  0 0 0 0.42 0" />
        </filter>
        <filter id="bgst-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="37" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.38  0 0 0 0 0.42  0 0 0 0.10 0" />
        </filter>
      </defs>
      <rect width="1600" height="1100" fill="var(--bg-stone-base)" />
      <rect width="1600" height="1100" filter="url(#bgst-mottle)" opacity="0.85" />
      <rect width="1600" height="1100" filter="url(#bgst-grain)" opacity="0.5" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 11: Dawn — pink/peach gradient (warm, not yellow)
────────────────────────────────────────────────────────── */
function BgDawn() {
  // Deterministic scattered stars for ambient continuity across all sections.
  // Subtle in light mode, slightly more visible in dark mode (CSS opacity hook).
  const stars = [];
  let s = 1234;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < 90; i++) {
    stars.push({
      x: rnd() * 1600,
      y: rnd() * 1100,
      r: 0.6 + rnd() * 1.6,
      o: 0.25 + rnd() * 0.55,
    });
  }
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bgdn-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--bg-dawn-top)" />
          <stop offset="50%"  stopColor="var(--bg-dawn-mid)" />
          <stop offset="100%" stopColor="var(--bg-dawn-bot)" />
        </linearGradient>
        <radialGradient id="bgdn-glow" cx="0.22" cy="0.78" r="0.42">
          <stop offset="0%"  stopColor="var(--bg-dawn-glow)" stopOpacity="0.5" />
          <stop offset="65%" stopColor="var(--bg-dawn-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1100" fill="url(#bgdn-grad)" />
      <rect width="1600" height="1100" fill="url(#bgdn-glow)" />
      {/* Faint diagonal trajectory lines — very subtle, more visible in dark mode via CSS */}
      <g className="bg-lines">
        <line x1="-50" y1="850" x2="1700" y2="200" stroke="var(--bg-dawn-glow)" strokeWidth="1" strokeDasharray="3 14" opacity="0.45" />
        <line x1="-50" y1="950" x2="1700" y2="450" stroke="var(--bg-dawn-glow)" strokeWidth="1" strokeDasharray="2 18" opacity="0.3" />
      </g>
      <g className="bg-stars">
        {stars.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="var(--bg-dawn-glow)" opacity={st.o} />
        ))}
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 12: Dusk — purple-blue gradient (cool, different mood)
────────────────────────────────────────────────────────── */
function BgDusk() {
  const stars = [];
  let s = 5678;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < 90; i++) {
    stars.push({ x: rnd() * 1600, y: rnd() * 1100, r: 0.6 + rnd() * 1.6, o: 0.25 + rnd() * 0.55 });
  }
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bgdk-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--bg-dusk-top)" />
          <stop offset="55%"  stopColor="var(--bg-dusk-mid)" />
          <stop offset="100%" stopColor="var(--bg-dusk-bot)" />
        </linearGradient>
        <radialGradient id="bgdk-glow" cx="0.82" cy="0.18" r="0.32">
          <stop offset="0%"  stopColor="var(--bg-dusk-glow)" stopOpacity="0.45" />
          <stop offset="60%" stopColor="var(--bg-dusk-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1100" fill="url(#bgdk-grad)" />
      <rect width="1600" height="1100" fill="url(#bgdk-glow)" />
      <g className="bg-lines">
        <line x1="-50" y1="850" x2="1700" y2="200" stroke="var(--bg-dusk-glow)" strokeWidth="1" strokeDasharray="3 14" opacity="0.45" />
        <line x1="-50" y1="950" x2="1700" y2="450" stroke="var(--bg-dusk-glow)" strokeWidth="1" strokeDasharray="2 18" opacity="0.3" />
      </g>
      <g className="bg-stars">
        {stars.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="var(--bg-dusk-glow)" opacity={st.o} />
        ))}
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Variant 13: Snow — flat white + single faint ridgeline
────────────────────────────────────────────────────────── */
function BgSnow() {
  return (
    <svg className="bg-svg" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="bgsn-ridge"><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <rect width="1600" height="1100" fill="var(--bg-snow-base)" />
      <g opacity="0.55" filter="url(#bgsn-ridge)">
        <path d="M -50 580 L 220 380 L 400 480 L 620 280 L 880 420 L 1100 220 L 1340 380 L 1650 240 L 1650 1100 L -50 1100 Z"
              fill="none" stroke="var(--bg-snow-ridge)" strokeWidth="1.4" />
      </g>
      <g opacity="0.32" filter="url(#bgsn-ridge)">
        <path d="M -50 760 L 320 640 L 540 720 L 800 580 L 1080 700 L 1340 620 L 1650 700 L 1650 1100 L -50 1100 Z"
              fill="none" stroke="var(--bg-snow-ridge)" strokeWidth="1.1" />
      </g>
    </svg>
  );
}

const BG_VARIANTS = {
  horizon: BgHorizon,
  grain:   BgGrain,
  enso:    BgEnso,
  sumi:    BgSumi,
  washi:   BgWashi,
  mist:    BgMist,
  paper:   BgPaper,
  linen:   BgLinen,
  garden:  BgGarden,
  stone:   BgStone,
  dawn:    BgDawn,
  dusk:    BgDusk,
  snow:    BgSnow,
  none:    null
};

/* ──────────────────────────────────────────────────────────
   BackgroundLayer — fixed full-viewport, parallax drift
────────────────────────────────────────────────────────── */
function BackgroundLayer({ variant }) {
  if (variant === "none") return null;
  const V = BG_VARIANTS[variant] || BG_VARIANTS.horizon;
  return (
    <div
      className={`bg-layer bg-${variant}`}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <V />
    </div>
  );
}

const BG_DEFAULTS = /*EDITMODE-BEGIN*/{
  "bgDark": "dusk",
  "bgLight": "dawn"
}/*EDITMODE-END*/;

const BG_OPTIONS = [
  { value: "horizon", label: "Horizon" },
  { value: "grain",   label: "Warm grain" },
  { value: "enso",    label: "Enso" },
  { value: "sumi",    label: "Sumi wash" },
  { value: "washi",   label: "Washi" },
  { value: "mist",    label: "Mist" },
  { value: "paper",   label: "Paper" },
  { value: "linen",   label: "Linen" },
  { value: "garden",  label: "Garden" },
  { value: "stone",   label: "Stone" },
  { value: "dawn",    label: "Dawn" },
  { value: "dusk",    label: "Dusk" },
  { value: "snow",    label: "Snow" },
  { value: "none",    label: "Off" }
];

/* Hook: returns 'dark' or 'light' and re-renders when html[data-theme] changes */
function useThemeMode() {
  const get = () => document.documentElement.getAttribute('data-theme') || 'dark';
  const [mode, setMode] = React.useState(get);
  React.useEffect(() => {
    const obs = new MutationObserver(() => setMode(get()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return mode;
}

/* ──────────────────────────────────────────────────────────
   Standalone root: used on pages where hero.jsx is NOT loaded.
   Skips its Tweaks panel if the host page already owns one.
────────────────────────────────────────────────────────── */
function BgStandaloneRoot() {
  const ownedByHero = !!window.__BG_OWNED_BY_HERO;
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(BG_DEFAULTS)
    : [BG_DEFAULTS, () => {}];

  const mode = useThemeMode();
  const variant = mode === 'light'
    ? (tweaks.bgLight || tweaks.bg || "dawn")
    : (tweaks.bgDark  || tweaks.bg || "dusk");

  const TweaksPanel = window.TweaksPanel;
  const TweakSection = window.TweakSection;
  const TweakSelect = window.TweakSelect;

  return (
    <>
      <BackgroundLayer variant={variant} />
      {!ownedByHero && TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Background" subtitle="Choose a different layer for each theme.">
            <TweakSelect
              label="Dark mode"
              value={tweaks.bgDark || "dusk"}
              options={BG_OPTIONS}
              onChange={(v) => setTweak("bgDark", v)}
            />
            <TweakSelect
              label="Light mode"
              value={tweaks.bgLight || "dawn"}
              options={BG_OPTIONS}
              onChange={(v) => setTweak("bgLight", v)}
            />
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
}

window.BackgroundLayer = BackgroundLayer;
window.BG_OPTIONS = BG_OPTIONS;
window.BG_DEFAULTS = BG_DEFAULTS;

const bgRoot = document.getElementById("bg-root");
if (bgRoot && !window.__BG_OWNED_BY_HERO) {
  ReactDOM.createRoot(bgRoot).render(<BgStandaloneRoot />);
}

/* eslint-disable no-undef */
/* hero.jsx — three home page hero variants for huy.gg
   Variant A: Subtle  — current hero + animated KPI strip below
   Variant B: Mini-dash — right card becomes a live mini RCM preview
   Variant C: Bold     — full-width hero with animated SVG chart bg + KPI strip
*/

const { useState, useEffect, useRef, useMemo } = React;

/* ──────────────────────────────────────────────────────────
   Counter — counts up to `to` over `duration` ms with easing
────────────────────────────────────────────────────────── */
function Counter({ to, duration = 1400, prefix = "", suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  const formatted = decimals > 0
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString();
  return <span>{prefix}{formatted}{suffix}</span>;
}

/* ──────────────────────────────────────────────────────────
   KPI Strip — small horizontal row of three accent stats
────────────────────────────────────────────────────────── */
function KPIStrip({ items, dense = false }) {
  return (
    <div className={`hero-kpi-strip ${dense ? "is-dense" : ""}`}>
      {items.map((it, i) => (
        <div key={i} className="hero-kpi" style={{ animationDelay: `${i * 90}ms` }}>
          <div className="hero-kpi-num">
            <Counter
              to={it.value}
              prefix={it.prefix || ""}
              suffix={it.suffix || ""}
              decimals={it.decimals || 0}
              duration={1400 + i * 200}
            />
          </div>
          <div className="hero-kpi-label">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

const KPI_ITEMS = [
  { value: 250000, label: "claims analyzed", suffix: "+" },
  { value: 91,     label: "% model accuracy", suffix: "%" },
  { value: 10,     label: "yrs in healthcare ops", suffix: " yrs" },
];

/* ──────────────────────────────────────────────────────────
   Credentials strip — three institutions, real content
   Replaces arbitrary KPI numbers. MIT gets visual lift.
────────────────────────────────────────────────────────── */
function CredStrip() {
  const items = [
    {
      school: "MIT",
      degree: "Applied AI, Machine Learning, and Data Science",
      detail: "Professional Certificate",
      featured: true
    },
    {
      school: "Colorado State University",
      degree: "B.S. Computer Science",
      detail: "Bachelor of Science"
    },
    {
      school: "University of Denver",
      degree: "M.S. Healthcare Administration",
      detail: "Master of Science"
    }
  ];
  return (
    <div className="hero-cred-strip">
      {items.map((it, i) => (
        <div
          key={i}
          className={`hero-cred ${it.featured ? "is-featured" : ""}`}
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <div className="hero-cred-school">{it.school}</div>
          <div className="hero-cred-degree">{it.degree}</div>
          <div className="hero-cred-detail">{it.detail}</div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Mini RCM dashboard — used in Variant B (right side)
────────────────────────────────────────────────────────── */
function MiniDashboard() {
  // Deterministic monthly billed/income — mirrors playground vibe
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const billed = [3.6, 3.2, 3.5, 3.4, 3.9, 3.6, 3.5, 3.6, 3.5, 3.5, 3.4, 3.6]; // $M
  const income = [2.7, 2.3, 2.6, 2.4, 2.9, 2.7, 2.5, 2.7, 2.6, 2.6, 2.5, 2.7];
  const max = 4.2;
  const W = 320, H = 130, pad = 18;
  const bw = (W - pad * 2) / months.length;

  const linePts = income.map((v, i) => {
    const x = pad + i * bw + bw / 2;
    const y = H - pad - (v / max) * (H - pad * 2);
    return [x, y];
  });
  const lineD = linePts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <div className="mini-dash">
      <div className="mini-dash-head">
        <div>
          <div className="mini-dash-eyebrow">Live preview</div>
          <div className="mini-dash-title">Income vs Billed · 2025</div>
        </div>
        <a className="mini-dash-cta" href="dashboard.html">Open dashboard →</a>
      </div>

      <div className="mini-kpi-row">
        <div className="mini-kpi">
          <div className="mini-kpi-num"><Counter to={48910} /></div>
          <div className="mini-kpi-lbl">Visits</div>
        </div>
        <div className="mini-kpi">
          <div className="mini-kpi-num">$<Counter to={24.85} decimals={2} />M</div>
          <div className="mini-kpi-lbl">Income</div>
        </div>
        <div className="mini-kpi">
          <div className="mini-kpi-num"><Counter to={47} suffix="%" /></div>
          <div className="mini-kpi-lbl">Open A/R</div>
        </div>
      </div>

      <svg className="mini-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* Bars (billed) */}
        {billed.map((v, i) => {
          const h = (v / max) * (H - pad * 2);
          const x = pad + i * bw + 2;
          const y = H - pad - h;
          return (
            <rect
              key={i}
              x={x} y={y}
              width={bw - 4} height={h}
              fill="var(--accent-soft)"
              opacity="0.55"
              rx="2"
              className="mini-bar"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          );
        })}
        {/* Line (income) */}
        <path
          d={lineD}
          fill="none"
          stroke="var(--hero-headline)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mini-line"
        />
        {linePts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.4" fill="var(--hero-headline)" className="mini-dot" style={{ animationDelay: `${600 + i * 50}ms` }} />
        ))}
        {/* Month ticks */}
        {months.map((m, i) => (
          <text key={i} x={pad + i * bw + bw / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{m}</text>
        ))}
      </svg>

      <div className="mini-legend">
        <span><i className="dot dot-bar"></i>Billed</span>
        <span><i className="dot dot-line"></i>Income</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Background data viz — used in Variant C (full-bleed)
────────────────────────────────────────────────────────── */
function HeroBackdropViz() {
  // Layered area paths that gently shimmer.
  // Phase tuned so the first peak crests between "View Resume" and "About me"
  // rather than directly behind the About me button.
  const W = 1400, H = 600;
  const seriesA = [];
  const seriesB = [];
  for (let i = 0; i <= 28; i++) {
    const x = (i / 28) * W;
    const yA = H * 0.55 + Math.sin(i * 0.6 + 1.9) * 50 + Math.cos(i * 0.3 + 1.0) * 30;
    const yB = H * 0.7  + Math.sin(i * 0.4 + 3.0) * 38 + Math.cos(i * 0.25 + 0.7) * 22;
    seriesA.push([x, yA]);
    seriesB.push([x, yB]);
  }
  const toArea = (pts) => {
    const top = pts.map(([x,y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return `${top} L${W},${H} L0,${H} Z`;
  };
  const toLine = (pts) => pts.map(([x,y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg className="hero-backdrop-viz" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="hbA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--hero-headline)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--hero-headline)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hbB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--accent)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={toArea(seriesA)} fill="url(#hbA)" className="hb-area hb-area-a" />
      <path d={toArea(seriesB)} fill="url(#hbB)" className="hb-area hb-area-b" />
      <path d={toLine(seriesA)} fill="none" stroke="var(--hero-headline)" strokeOpacity="0.35" strokeWidth="2" />
      <path d={toLine(seriesB)} fill="none" stroke="var(--accent)" strokeOpacity="0.30" strokeWidth="2" />
      {/* Scatter of data points */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = ((i + 0.5) / 14) * W;
        const y = H * 0.35 + ((i * 37) % 80);
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" opacity="0.5" />;
      })}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   Hero backdrop variants — each renders into the bold hero.
   Tuned so the active region clears the CTA row at upper-mid.
────────────────────────────────────────────────────────── */

// Topographic contours — concentric organic isolines, like a map
function HeroBackdropTopo() {
  const W = 1400, H = 600;
  // Generate concentric closed loops with small lobes
  const rings = [];
  const cx = W * 0.55, cy = H * 0.62;
  for (let r = 0; r < 9; r++) {
    const baseR = 60 + r * 55;
    const pts = [];
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      // organic lobe modulation per ring
      const wob = Math.sin(t * 3 + r * 0.7) * 14
                + Math.cos(t * 5 + r * 1.3) * 8
                + Math.sin(t * 2 + r * 0.4) * 18;
      const rad = baseR + wob;
      const x = cx + Math.cos(t) * rad * 1.4; // wider than tall
      const y = cy + Math.sin(t) * rad * 0.55;
      pts.push([x, y]);
    }
    rings.push(pts);
  }
  const toPath = (pts) =>
    pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z";

  return (
    <svg className="hero-backdrop-viz" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      {rings.map((pts, i) => (
        <path
          key={i}
          d={toPath(pts)}
          fill="none"
          stroke={i % 3 === 0 ? "var(--accent)" : "var(--hero-headline)"}
          strokeOpacity={0.16 + (i / rings.length) * 0.18}
          strokeWidth={i === rings.length - 1 ? 2 : 1}
        />
      ))}
      {/* faint accent dot at the center, like a peak marker */}
      <circle cx={cx} cy={cy} r="4" fill="var(--accent)" opacity="0.55" />
    </svg>
  );
}

// Scatter cloud — dense regression cloud with two faint trend lines
function HeroBackdropScatter() {
  const W = 1400, H = 600;
  // Deterministic pseudo-random
  const rnd = (seed) => {
    const s = Math.sin(seed * 9301 + 49297) * 233280;
    return s - Math.floor(s);
  };
  // Sparse static scatter — data points the streams are connecting
  const N = 28;
  const dots = [];
  for (let i = 0; i < N; i++) {
    const tx = rnd(i * 1.3);
    const ty = rnd(i * 2.7 + 0.5);
    const x = tx * W;
    // bias toward lower 60% so headline stays clean
    const y = H * 0.42 + ty * H * 0.5;
    const big = i % 7 === 0;
    const accent = i % 4 === 0;
    dots.push({ x, y, r: big ? 3 : 2, accent });
  }

  // Two trend "stream" lines + endpoints for pulse animation
  const lineA = { x1: 0, y1: H * 0.85, x2: W, y2: H * 0.45, color: "var(--hero-headline)", op: 0.32 };
  const lineB = { x1: 0, y1: H * 0.92, x2: W, y2: H * 0.6,  color: "var(--accent)",        op: 0.28 };

  return (
    <svg className="hero-backdrop-viz" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {/* Soft glow for pulse heads */}
        <filter id="hero-pulse-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* trend lines (streams) */}
      <line
        x1={lineA.x1} y1={lineA.y1} x2={lineA.x2} y2={lineA.y2}
        stroke={lineA.color} strokeOpacity={lineA.op} strokeWidth="1.5"
        strokeDasharray="6 6"
      />
      <line
        x1={lineB.x1} y1={lineB.y1} x2={lineB.x2} y2={lineB.y2}
        stroke={lineB.color} strokeOpacity={lineB.op} strokeWidth="1.5"
      />

      {/* Pulse heads traveling along each stream */}
      {[
        { line: lineA, dur: 5.5, delay: 0,    color: "var(--hero-headline)", glowOp: 0.45 },
        { line: lineA, dur: 5.5, delay: -2.7, color: "var(--hero-headline)", glowOp: 0.45 },
        { line: lineB, dur: 7.0, delay: -1.2, color: "var(--accent)",        glowOp: 0.55 },
        { line: lineB, dur: 7.0, delay: -4.5, color: "var(--accent)",        glowOp: 0.55 },
      ].map((p, i) => (
        <g key={"pulse" + i}>
          {/* Glow halo */}
          <circle r="6" fill={p.color} opacity={p.glowOp} filter="url(#hero-pulse-glow)">
            <animate
              attributeName="cx"
              values={`${p.line.x1};${p.line.x2}`}
              dur={`${p.dur}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${p.line.y1};${p.line.y2}`}
              dur={`${p.dur}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
          {/* Bright core */}
          <circle r="2.2" fill={p.color} opacity="0.95">
            <animate
              attributeName="cx"
              values={`${p.line.x1};${p.line.x2}`}
              dur={`${p.dur}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${p.line.y1};${p.line.y2}`}
              dur={`${p.dur}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}

      {/* Sparse static data points */}
      {dots.map((d, i) => (
        <circle
          key={i} cx={d.x} cy={d.y} r={d.r}
          fill={d.accent ? "var(--accent)" : "var(--hero-headline)"}
          opacity={d.accent ? 0.7 : 0.55}
        />
      ))}
    </svg>
  );
}

// Sankey ribbons — flowing curved ribbons left-to-right
function HeroBackdropSankey() {
  const W = 1400, H = 600;
  // 5 ribbons, each a thick cubic bezier curve, varying widths and y-offsets
  const ribbons = [
    { y0: H * 0.45, y1: H * 0.78, w: 38, color: "var(--hero-headline)", op: 0.12 },
    { y0: H * 0.55, y1: H * 0.55, w: 28, color: "var(--accent)",       op: 0.14 },
    { y0: H * 0.70, y1: H * 0.40, w: 46, color: "var(--hero-headline)", op: 0.10 },
    { y0: H * 0.82, y1: H * 0.92, w: 32, color: "var(--accent)",       op: 0.10 },
    { y0: H * 0.92, y1: H * 0.62, w: 24, color: "var(--hero-headline)", op: 0.14 },
  ];
  const toBand = (y0, y1, w) => {
    // top and bottom edges of ribbon, both as cubic beziers from x=0 to x=W
    const cx1 = W * 0.35, cx2 = W * 0.65;
    const top = `M 0,${y0 - w/2} C ${cx1},${y0 - w/2} ${cx2},${y1 - w/2} ${W},${y1 - w/2}`;
    const bot = `L ${W},${y1 + w/2} C ${cx2},${y1 + w/2} ${cx1},${y0 + w/2} 0,${y0 + w/2} Z`;
    return top + " " + bot;
  };
  return (
    <svg className="hero-backdrop-viz" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      {ribbons.map((r, i) => (
        <path key={i} d={toBand(r.y0, r.y1, r.w)} fill={r.color} opacity={r.op} />
      ))}
      {/* thin centerlines for definition */}
      {ribbons.map((r, i) => (
        <path
          key={"c" + i}
          d={`M 0,${r.y0} C ${W * 0.35},${r.y0} ${W * 0.65},${r.y1} ${W},${r.y1}`}
          fill="none" stroke={r.color} strokeOpacity={0.35} strokeWidth="1"
        />
      ))}
    </svg>
  );
}

const HERO_BACKDROPS = {
  area:    HeroBackdropViz,
  topo:    HeroBackdropTopo,
  scatter: HeroBackdropScatter,
  sankey:  HeroBackdropSankey,
};
const HERO_BACKDROP_OPTIONS = [
  { value: "area",    label: "Area chart" },
  { value: "topo",    label: "Topo contours" },
  { value: "scatter", label: "Scatter cloud" },
  { value: "sankey",  label: "Sankey ribbons" },
];

/* ──────────────────────────────────────────────────────────
   Hero variants
────────────────────────────────────────────────────────── */
function VariantSubtle() {
  return (
    <section className="hero hero-variant-subtle">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Operations · Data · A decade of both</p>
          <h1>Simple solutions to complex problems.</h1>
          <p className="hero-text">
            Ten years in operations gave me deep domain knowledge in business. A technical
            background in computer and data science gave me the tools to build the answers.
            The industry matters less than the quality of the problem, and I want to provide
            simple solutions to complex cases.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="resume.html">View Resume</a>
            <a className="button button-secondary" href="dashboard.html">View live dashboard</a>
          </div>
        </div>

        <aside className="hero-panel">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
            <img src="logo.png" alt="huy.gg" />
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.6rem", marginBottom: "1rem" }}>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text)" }}>
              <strong>Master's in Healthcare Administration</strong>{" "}
              <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>DU</span>
            </p>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text)" }}>
              <strong>B.S. Computer Science</strong>{" "}
              <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>CSU</span>{" "}
              <strong>•</strong>{" "}
              <strong>Applied AI, ML & Data Science</strong>{" "}
              <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>MIT</span>
            </p>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <a className="button button-secondary" href="about.html" style={{ width: "100%", justifyContent: "center" }}>About me</a>
          </div>
        </aside>
      </div>

      <div className="container">
        <CredStrip />
      </div>
    </section>
  );
}

function VariantMiniDash() {
  return (
    <section className="hero hero-variant-minidash">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Operations · Data · A decade of both</p>
          <h1>Simple solutions to complex problems.</h1>
          <p className="hero-text">
            Ten years in operations gave me deep domain knowledge in business. A technical
            background in computer and data science gave me the tools to build the answers.
            The industry matters less than the quality of the problem, and I want to provide
            simple solutions to complex cases.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="dashboard.html">Open live dashboard</a>
            <a className="button button-secondary" href="resume.html">View Resume</a>
          </div>
          <div style={{ marginTop: "2rem" }}>
            <CredStrip />
          </div>
        </div>

        <aside className="hero-panel hero-panel-dash">
          <MiniDashboard />
        </aside>
      </div>
    </section>
  );
}

function VariantBold({ Backdrop }) {
  const B = Backdrop || HeroBackdropViz;
  return (
    <section className="hero hero-variant-bold">
      <B />
      <div className="container hero-bold-inner">
        <p className="eyebrow">Operations · Data · A decade of both</p>
        <h1>Simple solutions to complex problems.</h1>
        <p className="hero-text">
          Ten years in operations gave me deep domain knowledge in business. A technical
          background in computer and data science gave me the tools to build the answers.
          The industry matters less than the quality of the problem, and I want to provide
          simple solutions to complex cases.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="resume.html">View Resume</a>
          <a className="button button-secondary" href="about.html">About me</a>
        </div>
        <CredStrip />
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Tweaks panel + root
────────────────────────────────────────────────────────── */
// Tell bg.jsx not to render its own Tweaks panel — we'll merge bg into ours.
window.__BG_OWNED_BY_HERO = true;

const HERO_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "bold",
  "heroBackdrop": "scatter",
  "bgDark": "dusk",
  "bgLight": "dawn"
}/*EDITMODE-END*/;

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

function HeroRoot() {
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(HERO_DEFAULTS)
    : [HERO_DEFAULTS, () => {}];

  const themeMode = useThemeMode();
  const variant = tweaks.heroVariant || "minidash";
  const bgVariant = themeMode === 'light'
    ? (tweaks.bgLight || tweaks.bg || "dawn")
    : (tweaks.bgDark  || tweaks.bg || "dusk");
  const backdropKey = tweaks.heroBackdrop || "area";
  const Backdrop = HERO_BACKDROPS[backdropKey] || HeroBackdropViz;

  let Variant = VariantMiniDash;
  if (variant === "subtle") Variant = VariantSubtle;
  else if (variant === "bold") Variant = VariantBold;

  const TweaksPanel = window.TweaksPanel;
  const TweakSection = window.TweakSection;
  const TweakRadio = window.TweakRadio;
  const TweakSelect = window.TweakSelect;
  const BackgroundLayer = window.BackgroundLayer;
  const BG_OPTIONS = window.BG_OPTIONS || [];

  // Render the background layer into #bg-root via a portal so it stays
  // outside the hero subtree but shares this root's state.
  const bgEl = typeof document !== "undefined" ? document.getElementById("bg-root") : null;
  const bgPortal = (BackgroundLayer && bgEl)
    ? ReactDOM.createPortal(<BackgroundLayer variant={bgVariant} />, bgEl)
    : null;

  return (
    <>
      {bgPortal}
      <Variant Backdrop={Backdrop} />
      {TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Home page hero" subtitle="Three variants — pick the one that lands.">
            <TweakRadio
              label="Variant"
              value={variant}
              options={[
                { value: "subtle",   label: "Subtle" },
                { value: "minidash", label: "Mini-dash" },
                { value: "bold",     label: "Bold" },
              ]}
              onChange={(v) => setTweak("heroVariant", v)}
            />
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              <strong>Subtle:</strong> current hero + KPI strip.<br/>
              <strong>Mini-dash:</strong> live preview replaces side card.<br/>
              <strong>Bold:</strong> full-bleed with animated chart backdrop.
            </p>
          </TweakSection>
          {variant === "bold" && TweakSelect && (
            <TweakSection title="Hero backdrop" subtitle="The data-viz layer behind the bold hero.">
              <TweakSelect
                label="Style"
                value={backdropKey}
                options={HERO_BACKDROP_OPTIONS}
                onChange={(v) => setTweak("heroBackdrop", v)}
              />
            </TweakSection>
          )}
          {TweakSelect && BG_OPTIONS.length > 0 && (
            <TweakSection title="Background" subtitle="Choose a different layer for each theme. Toggle the sun/moon to compare.">
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
          )}
        </TweaksPanel>
      )}
    </>
  );
}

// Mount the background layer as soon as React is ready (separate root, no panel).
const bgRootEl = document.getElementById("bg-root");
function HeroBgMount() {
  // No-op: BackgroundLayer is portaled into #bg-root from inside HeroRoot
  // so it stays in sync with the hero's tweak state.
  return null;
}

const root = ReactDOM.createRoot(document.getElementById("hero-root"));
root.render(<HeroRoot />);

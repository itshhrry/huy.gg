/* eslint-disable no-undef */
/* rcm-charts.jsx — SVG chart primitives for the RCM playground.
   Hand-rolled, no chart libs. Tooltips, hover states, animations.
*/

const { useState, useMemo, useRef, useEffect } = React;

/* ──────────────────────────────────────────────────────────
   Tooltip
────────────────────────────────────────────────────────── */
function Tooltip({ x, y, visible, children, anchor = "top" }) {
  if (!visible) return null;
  return (
    <div
      className="rcm-tooltip"
      style={{
        left: x,
        top: y,
        transform: anchor === "top" ? "translate(-50%, -110%)" : "translate(-50%, 14px)"
      }}
    >
      {children}
    </div>
  );
}

/* Currency / number formatters */
const fmt$ = (v) => "$" + Math.round(v).toLocaleString();
const fmt$M = (v) => "$" + (v / 1_000_000).toFixed(2) + "M";
const fmtPct = (v, d = 1) => (v * 100).toFixed(d) + "%";
const fmtN = (v) => Math.round(v).toLocaleString();

/* ──────────────────────────────────────────────────────────
   Counter — easing on prop change
────────────────────────────────────────────────────────── */
function useEasedNumber(target, duration = 900) {
  const [v, setV] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef(performance.now());
  useEffect(() => {
    fromRef.current = v;
    startRef.current = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(fromRef.current + (target - fromRef.current) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}

/* ──────────────────────────────────────────────────────────
   KPI tile
────────────────────────────────────────────────────────── */
function KPITile({ label, value, format = "n", trend, trendInverse = false, sublabel, accent = "default" }) {
  const eased = useEasedNumber(value);
  let display;
  if (format === "$M") display = fmt$M(eased);
  else if (format === "$") display = fmt$(eased);
  else if (format === "%") display = fmtPct(eased);
  else display = fmtN(eased);
  // For metrics where DOWN is good (denial rate, open A/R), invert good/bad
  const isGood = trendInverse ? trend < 0 : trend >= 0;
  return (
    <div className={`kpi-tile kpi-accent-${accent}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{display}</div>
      {sublabel && <div className="kpi-sublabel">{sublabel}</div>}
      {trend !== undefined && (
        <div className={`kpi-trend ${isGood ? "up" : "down"}`}>
          <span className="kpi-trend-arrow">{trend >= 0 ? "▲" : "▼"}</span>
          <span>{Math.abs(trend).toFixed(1)}% vs prior year</span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Income vs Billed combo chart (bars + line, monthly)
────────────────────────────────────────────────────────── */
function IncomeVsBilledChart({ income, billed, months, benchmark }) {
  const W = 720, H = 320, padL = 60, padR = 16, padT = 30, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...billed, benchmark || 0) * 1.1;
  const slot = innerW / months.length;
  const barW = Math.max(10, slot * 0.55);
  const [hover, setHover] = useState(null);

  // Income line points
  const incomePts = income.map((v, i) => {
    const x = padL + i * slot + slot / 2;
    const y = padT + innerH - (v / max) * innerH;
    return [x, y];
  });

  const smooth = (pts) => {
    if (pts.length < 2) return "";
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)},${y0.toFixed(1)} ${cx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return d;
  };
  const incomeLineD = smooth(incomePts);

  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  return (
    <div className="rcm-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="rcm-chart" role="img" aria-label="Income vs Billed by month">
        <defs>
          <linearGradient id="ivb-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="var(--rcm-ink)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--rcm-ink)" stopOpacity="0.10" />
          </linearGradient>
        </defs>

        {/* gridlines + y labels */}
        {tickVals.map((t, i) => {
          const y = padT + innerH - (t / max) * innerH;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray={i === 0 ? "none" : "2 4"} />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-muted)">{fmt$M(t)}</text>
            </g>
          );
        })}

        {/* Billed: bars */}
        {billed.map((v, i) => {
          const h = (v / max) * innerH;
          const x = padL + i * slot + (slot - barW) / 2;
          const y = padT + innerH - h;
          const isHov = hover && hover.i === i;
          return (
            <rect key={`b${i}`} x={x} y={y} width={barW} height={h} rx="2"
              fill="url(#ivb-bar)"
              stroke="var(--rcm-ink)" strokeOpacity={isHov ? 0.55 : 0.22} strokeWidth="1" />
          );
        })}

        {/* Income: line */}
        <path d={incomeLineD} fill="none" stroke="var(--hero-headline)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {incomePts.map(([x, y], i) => (
          <circle key={`p${i}`} cx={x} cy={y} r={hover && hover.i === i ? 5 : 3.25}
            fill="var(--hero-headline)" stroke="var(--surface)" strokeWidth="1.75" />
        ))}

        {/* Benchmark: prior-year monthly average */}
        {benchmark > 0 && (() => {
          const by = padT + innerH - (benchmark / max) * innerH;
          return (
            <g pointerEvents="none">
              <line x1={padL} x2={W - padR} y1={by} y2={by}
                stroke="var(--accent-dark, #a36a3c)" strokeOpacity="0.8" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x={W - padR - 4} y={by - 4} textAnchor="end" fontSize="9" fontWeight="600"
                fill="var(--accent-dark, #a36a3c)" letterSpacing="0.02em">
                PRIOR-YEAR AVG · {fmt$M(benchmark)}
              </text>
            </g>
          );
        })()}

        {/* Hover capture: invisible columns */}
        {months.map((m, i) => {
          const cx = padL + i * slot + slot / 2;
          return (
            <rect key={`h${i}`} x={padL + i * slot} y={padT} width={slot} height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover({ i, x: cx, y: incomePts[i][1] })}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {/* Hover guide */}
        {hover && (
          <g pointerEvents="none">
            <line x1={hover.x} x2={hover.x} y1={padT} y2={padT + innerH}
              stroke="var(--text-muted)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 3" />
          </g>
        )}

        {/* X labels */}
        {months.map((m, i) => (
          <text key={i} x={padL + i * slot + slot / 2} y={H - 14} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="600">{m}</text>
        ))}
      </svg>

      {hover && (
        <Tooltip x={hover.x} y={hover.y - 10} visible>
          <div className="tt-title">{months[hover.i]}</div>
          <div className="tt-row"><span className="tt-dot" style={{ background: "var(--rcm-ink)", opacity: 0.4 }}></span>Billed: <strong>{fmt$(billed[hover.i])}</strong></div>
          <div className="tt-row"><span className="tt-dot" style={{ background: "var(--hero-headline)", borderRadius: "50%" }}></span>Income: <strong>{fmt$(income[hover.i])}</strong></div>
          <div className="tt-row tt-muted">NCR: {fmtPct(income[hover.i] / billed[hover.i])}</div>
        </Tooltip>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Service line performance — visits, revenue, NCR%
   Horizontal grouped chart per service line
────────────────────────────────────────────────────────── */
function ServiceLineChart({ rows }) {
  // rows: [{ line, visits, revenue, billed, ncr }]
  const W = 720, H = 280, padL = 110, padR = 24, padT = 24, padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const rowH = innerH / rows.length;
  const maxRev = Math.max(...rows.map(r => r.revenue)) * 1.05;
  const [hover, setHover] = useState(null);

  return (
    <div className="rcm-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="rcm-chart" role="img" aria-label="Service line performance">
        <defs>
          <linearGradient id="svc-rev" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="var(--accent)" stopOpacity="0.92" />
            <stop offset="100%" stopColor="var(--accent-soft)" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="svc-rev-track" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="var(--rcm-ink)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--rcm-ink)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {rows.map((r, i) => {
          const y = padT + i * rowH + rowH / 2 - 18;
          const w = (r.revenue / maxRev) * innerW;
          const isHov = hover === i;
          return (
            <g key={r.line}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}>
              {/* row label */}
              <text x={padL - 14} y={y + 24} textAnchor="end" fontSize="13" fontWeight="700" fill="var(--text)">{r.line}</text>
              <text x={padL - 14} y={y + 40} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontWeight="600">{fmtN(r.visits)} visits</text>

              {/* track */}
              <rect x={padL} y={y + 8} width={innerW} height={28} rx="6" fill="url(#svc-rev-track)" />
              {/* revenue bar */}
              <rect x={padL} y={y + 8} width={w} height={28} rx="6"
                fill="url(#svc-rev)"
                opacity={hover === null || isHov ? 1 : 0.5}
                style={{ transition: "opacity 0.2s" }} />
              {/* revenue label inside bar if room, else after */}
              {w > 90 ? (
                <text x={padL + w - 10} y={y + 27} textAnchor="end" fontSize="12" fontWeight="800" fill="rgba(255,255,255,0.96)">{fmt$M(r.revenue)}</text>
              ) : (
                <text x={padL + w + 8} y={y + 27} fontSize="12" fontWeight="800" fill="var(--text)">{fmt$M(r.revenue)}</text>
              )}

              {/* NCR pill on the right */}
              <g transform={`translate(${padL + innerW - 70}, ${y + 44})`}>
                <rect x="0" y="0" width="70" height="18" rx="9" fill="var(--tag-bg)" stroke="var(--tag-border)" />
                <text x="35" y="13" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--accent-dark)">
                  NCR {fmtPct(r.ncr, 1)}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <Tooltip x={W * 0.5} y={padT + hover * rowH + rowH / 2} visible>
          <div className="tt-title">{rows[hover].line}</div>
          <div className="tt-row">Visits: <strong>{fmtN(rows[hover].visits)}</strong></div>
          <div className="tt-row">Revenue: <strong>{fmt$(rows[hover].revenue)}</strong></div>
          <div className="tt-row">Billed: <strong>{fmt$(rows[hover].billed)}</strong></div>
          <div className="tt-row tt-muted">NCR: {fmtPct(rows[hover].ncr, 1)} · Avg/visit: {fmt$(rows[hover].revenue / Math.max(1, rows[hover].visits))}</div>
        </Tooltip>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Bubble chart — packed circles (e.g. visits by facility)
   Deterministic spiral pack from largest → smallest.
────────────────────────────────────────────────────────── */
function BubbleChart({ data, total, label, sublabel, palette }) {
  const sum = data.reduce((a, d) => a + d.v, 0) || 1;
  const W = 520, H = 360;
  const [hover, setHover] = useState(null);

  // Sort by value desc, keep original index for color stability
  const sorted = useMemo(
    () => [...data].map((d, i) => ({ ...d, _origIdx: i })).sort((a, b) => b.v - a.v),
    [data]
  );

  // Pack circles: radius proportional to sqrt(value), but auto-fit so all fit in canvas
  const packed = useMemo(() => {
    const n = sorted.length;
    const max = sorted[0]?.v || 1;
    // Total area we can devote to circles ≈ ~28% of canvas (gives breathing room)
    const targetArea = W * H * 0.28;
    // Sum of v gives weight; radius = k * sqrt(v) so area sum = k² * π * Σv
    const totalV = sorted.reduce((a, d) => a + d.v, 0) || 1;
    const k = Math.sqrt(targetArea / (Math.PI * totalV));
    // Compute and clip
    const minR = 22;
    const maxR = 88;
    const radii = sorted.map(d => Math.max(minR, Math.min(maxR, k * Math.sqrt(d.v))));
    const placed = [];
    sorted.forEach((d, i) => {
      const r = radii[i];
      if (i === 0) {
        placed.push({ ...d, x: W / 2, y: H / 2, r });
        return;
      }
      let best = null;
      const step = 2;
      for (let radius = 0; radius < Math.max(W, H) && !best; radius += step) {
        const aSteps = Math.max(8, Math.round((2 * Math.PI * radius) / 6));
        for (let a = 0; a < aSteps; a++) {
          const ang = (a / aSteps) * Math.PI * 2 + i * 0.7;
          const x = W / 2 + Math.cos(ang) * radius;
          const y = H / 2 + Math.sin(ang) * radius;
          if (x - r < 6 || x + r > W - 6 || y - r < 6 || y + r > H - 6) continue;
          const ok = placed.every(p => {
            const dx = p.x - x, dy = p.y - y;
            return Math.sqrt(dx * dx + dy * dy) >= p.r + r + 4;
          });
          if (ok) { best = { x, y }; break; }
        }
      }
      if (!best) best = { x: W / 2, y: H / 2 };
      placed.push({ ...d, ...best, r });
    });
    return placed;
  }, [sorted]);

  const hoverItem = hover !== null ? packed[hover] : null;
  const heroNum = hoverItem ? fmtN(hoverItem.v) : fmtN(total);
  const heroLabel = hoverItem ? hoverItem.k : (sublabel || label);
  const heroPct = hoverItem ? fmtPct(hoverItem.v / sum, 0) : null;

  return (
    <div className="rcm-bubble">
      <div className="rcm-bubble-hero">
        <div className="rcm-bubble-num">{heroNum}</div>
        <div className="rcm-bubble-label">
          {heroLabel}
          {heroPct && <span className="rcm-bubble-pct"> · {heroPct}</span>}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Visits by facility — bubble chart">
        {packed.map((p, i) => {
          const color = palette[p._origIdx % palette.length];
          const isHov = hover === i;
          const dim = hover !== null && !isHov;
          // Only render label if bubble is big enough
          const showLabel = p.r >= 32;
          // Truncate facility name for very tight bubbles
          const labelText = p.r < 48
            ? p.k.length > 12 ? p.k.slice(0, 11) + "…" : p.k
            : p.k;
          return (
            <g
              key={p.k}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer", opacity: dim ? 0.32 : 1, transition: "opacity 0.2s ease" }}
            >
              <circle
                cx={p.x} cy={p.y} r={p.r}
                fill={color}
                stroke={isHov ? "var(--text)" : "transparent"}
                strokeWidth={isHov ? 2 : 0}
              />
              {showLabel && (
                <>
                  <text
                    x={p.x} y={p.y - 4}
                    textAnchor="middle"
                    fontSize={p.r < 50 ? 10 : 12}
                    fontWeight="700"
                    fill="#fff"
                    style={{ pointerEvents: "none" }}
                  >
                    {labelText}
                  </text>
                  <text
                    x={p.x} y={p.y + (p.r < 50 ? 9 : 13)}
                    textAnchor="middle"
                    fontSize={p.r < 50 ? 10 : 13}
                    fontWeight="800"
                    fill="#fff"
                    style={{ pointerEvents: "none", fontVariantNumeric: "tabular-nums", opacity: 0.95 }}
                  >
                    {fmtN(p.v)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Donut chart — visits by facility (legacy, replaced by BubbleChart)
────────────────────────────────────────────────────────── */
function DonutChart({ data, total, label, sublabel, palette }) {
  const sum = data.reduce((a, d) => a + d.v, 0);
  const sorted = [...data].map((d, i) => ({ ...d, _origIdx: i })).sort((a, b) => b.v - a.v);
  const max = sorted[0]?.v || 1;
  const [hover, setHover] = useState(null);

  return (
    <div className="rcm-rank">
      <div className="rcm-rank-hero">
        <div className="rcm-rank-num">{fmtN(hover !== null ? sorted[hover].v : total)}</div>
        <div className="rcm-rank-label">{hover !== null ? sorted[hover].k : (sublabel || label)}</div>
      </div>
      <div className="rcm-rank-rows">
        {sorted.map((d, i) => {
          const pct = d.v / sum;
          const w = (d.v / max) * 100;
          const color = palette[d._origIdx % palette.length];
          const isHov = hover === i;
          const dim = hover !== null && !isHov;
          return (
            <div
              key={d.k}
              className={`rcm-rank-row ${isHov ? "is-hover" : ""}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="rcm-rank-row-head">
                <span className="rcm-rank-row-label">{d.k}</span>
                <span className="rcm-rank-row-pct">{fmtPct(pct, 0)}</span>
              </div>
              <div className="rcm-rank-track">
                <div
                  className="rcm-rank-fill"
                  style={{
                    width: `${w}%`,
                    background: `linear-gradient(90deg, ${color} 0%, color-mix(in oklab, ${color} 70%, var(--surface)) 100%)`,
                    opacity: dim ? 0.35 : 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Stacked horizontal bars — write-off by facility & service line
────────────────────────────────────────────────────────── */
function StackedHBarChart({ rows, services, palette }) {
  // Sort facilities by total write-off so the worst sits on top
  const withTotals = rows.map(r => ({
    ...r,
    _total: services.reduce((a, s) => a + (r[s] || 0), 0)
  })).sort((a, b) => b._total - a._total);

  const padL = 130, padR = 64, padT = 18, padB = 14;
  const W = 720;
  const rowH = 46;
  const H = padT + withTotals.length * rowH + padB;
  const innerW = W - padL - padR;
  const max = Math.max(...withTotals.map(r => r._total)) * 1.05;
  const [hover, setHover] = useState(null);

  return (
    <div className="rcm-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="rcm-chart" role="img" aria-label="Write-off by facility and service line">
        <defs>
          <linearGradient id="wo-track" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="var(--rcm-ink)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--rcm-ink)" stopOpacity="0.02" />
          </linearGradient>
          {services.map((s, si) => (
            <linearGradient key={s} id={`wo-seg-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={palette[si]} stopOpacity="0.95" />
              <stop offset="100%" stopColor={palette[si]} stopOpacity="0.78" />
            </linearGradient>
          ))}
        </defs>

        {withTotals.map((r, ri) => {
          const y = padT + ri * rowH;
          const total = r._total;
          const totalW = (total / max) * innerW;

          // Build segments
          let acc = 0;
          const segs = services.map((s, si) => {
            const v = r[s] || 0;
            const w = (v / max) * innerW;
            const x = padL + (acc / max) * innerW;
            acc += v;
            return { s, si, v, w, x };
          }).filter(seg => seg.v > 0);

          return (
            <g key={ri}>
              {/* facility label */}
              <text x={padL - 14} y={y + 24} textAnchor="end" fontSize="13" fontWeight="700" fill="var(--text)">{r.label}</text>
              <text x={padL - 14} y={y + 39} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontWeight="600">{fmt$(total)} total</text>

              {/* track */}
              <rect x={padL} y={y + 14} width={innerW} height={20} rx="5" fill="url(#wo-track)" />

              {/* segments — rounded only on the leftmost / rightmost edges via clip */}
              <clipPath id={`wo-clip-${ri}`}>
                <rect x={padL} y={y + 14} width={totalW} height={20} rx="5" />
              </clipPath>
              <g clipPath={`url(#wo-clip-${ri})`}>
                {segs.map(seg => {
                  const isHov = hover && hover.r === ri && hover.s === seg.si;
                  const dim = hover !== null && !isHov;
                  return (
                    <g key={seg.s}>
                      <rect
                        x={seg.x} y={y + 14}
                        width={seg.w} height={20}
                        fill={`url(#wo-seg-${seg.si})`}
                        opacity={dim ? 0.4 : 1}
                        style={{ transition: "opacity 0.2s" }}
                        onMouseEnter={() => setHover({ r: ri, s: seg.si, label: r.label, svc: seg.s, val: seg.v })}
                        onMouseLeave={() => setHover(null)}
                      />
                      {/* white separator on the right edge of every segment except the last */}
                      {seg.x + seg.w < padL + totalW - 0.5 && (
                        <rect x={seg.x + seg.w - 1} y={y + 14} width="2" height="20" fill="var(--surface)" pointerEvents="none" />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* total label outside the bar */}
              <text x={padL + totalW + 8} y={y + 28} fontSize="11" fontWeight="800" fill="var(--text)">{fmt$M(total)}</text>
            </g>
          );
        })}
      </svg>

      {hover && (() => {
        const ri = withTotals.findIndex(r => r.label === hover.label);
        return (
          <Tooltip x={W * 0.5} y={padT + ri * rowH + rowH / 2} visible>
            <div className="tt-title">{hover.label} · {hover.svc}</div>
            <div className="tt-row"><strong>{fmt$(hover.val)}</strong> avg write-off</div>
          </Tooltip>
        );
      })()}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Stacked vertical bars — payer mix
────────────────────────────────────────────────────────── */
function PayerMixChart({ payers, mix, palette }) {
  // Sort by revenue desc so the ranking reads top→bottom
  const sorted = [...payers].sort((a, b) => mix[b].revenue - mix[a].revenue);
  const padL = 130, padR = 28, padT = 18, padB = 14;
  const W = 720;
  const rowH = 56;
  const H = padT + sorted.length * rowH + padB;
  const innerW = W - padL - padR;
  const max = Math.max(...sorted.map(p => mix[p].revenue)) * 1.05;
  const [hover, setHover] = useState(null);

  // Map denial rate to a tone — calmer = sage, hotter = terracotta
  const denialTone = (rate) => {
    if (rate < 0.06) return { fg: "var(--hero-headline)", bg: "color-mix(in oklab, var(--hero-headline) 14%, transparent)" };
    if (rate < 0.10) return { fg: "#a37b32", bg: "color-mix(in oklab, #a37b32 16%, transparent)" };
    return { fg: "var(--accent)", bg: "color-mix(in oklab, var(--accent) 14%, transparent)" };
  };

  return (
    <div className="rcm-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="rcm-chart" role="img" aria-label="Revenue by payer">
        <defs>
          <linearGradient id="payer-track" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="var(--rcm-ink)" stopOpacity="0.09" />
            <stop offset="100%" stopColor="var(--rcm-ink)" stopOpacity="0.02" />
          </linearGradient>
          {sorted.map((p, i) => (
            <linearGradient key={p} id={`payer-bar-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"  stopColor={palette[payers.indexOf(p) % palette.length]} stopOpacity="0.95" />
              <stop offset="100%" stopColor={palette[payers.indexOf(p) % palette.length]} stopOpacity="0.72" />
            </linearGradient>
          ))}
        </defs>

        {sorted.map((p, i) => {
          const m = mix[p];
          const y = padT + i * rowH;
          const w = (m.revenue / max) * innerW;
          const isHov = hover === i;
          const tone = denialTone(m.denialRate);
          const pillW = 96;

          return (
            <g key={p}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}>
              {/* row label */}
              <text x={padL - 14} y={y + 24} textAnchor="end" fontSize="13" fontWeight="700" fill="var(--text)">{p}</text>
              <text x={padL - 14} y={y + 40} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontWeight="600">{fmtN(m.claims)} claims</text>

              {/* track */}
              <rect x={padL} y={y + 12} width={innerW} height={24} rx="6" fill="url(#payer-track)" />
              {/* revenue bar */}
              <rect x={padL} y={y + 12} width={w} height={24} rx="6"
                fill={`url(#payer-bar-${i})`}
                opacity={hover === null || isHov ? 1 : 0.45}
                style={{ transition: "opacity 0.2s" }} />
              {/* revenue label */}
              {w > 90 ? (
                <text x={padL + w - 10} y={y + 29} textAnchor="end" fontSize="11" fontWeight="800" fill="rgba(255,255,255,0.96)">{fmt$M(m.revenue)}</text>
              ) : (
                <text x={padL + w + 8} y={y + 29} fontSize="11" fontWeight="800" fill="var(--text)">{fmt$M(m.revenue)}</text>
              )}

              {/* denial rate pill, right-aligned beneath the bar */}
              <g transform={`translate(${padL + innerW - pillW}, ${y + 40})`}>
                <rect x="0" y="0" width={pillW} height="16" rx="8" fill={tone.bg} />
                <text x={pillW / 2} y="11" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={tone.fg}>
                  {fmtPct(m.denialRate, 1)} denied
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {hover !== null && (() => {
        const p = sorted[hover];
        const m = mix[p];
        return (
          <Tooltip x={W * 0.55} y={padT + hover * rowH + rowH / 2} visible>
            <div className="tt-title">{p}</div>
            <div className="tt-row">Revenue: <strong>{fmt$(m.revenue)}</strong></div>
            <div className="tt-row">Claims: <strong>{fmtN(m.claims)}</strong></div>
            <div className="tt-row tt-muted">Denial rate: {fmtPct(m.denialRate, 1)} · Avg/claim: {fmt$(m.revenue / Math.max(1, m.claims))}</div>
          </Tooltip>
        );
      })()}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   A/R aging buckets — vertical bars with totals
────────────────────────────────────────────────────────── */
function ARAgingChart({ aging }) {
  const total = aging.reduce((a, b) => a + b.amount, 0);
  const [hover, setHover] = useState(null);

  // Risk weights from notebook: probability of *not* being collected at all
  // 0-30: ~3%, 31-60: ~12%, 61-90: ~28%, 91-180: ~45%, 181+: ~70%
  const RISK = [0.03, 0.12, 0.28, 0.45, 0.70];
  const RISK_LABELS = ["Low risk", "Moderate", "Elevated", "High risk", "Critical"];

  // Color ramp — calm sage → terracotta as buckets age
  const tones = [
    { fg: "var(--hero-headline)", bg: "color-mix(in oklab, var(--hero-headline) 88%, var(--surface))", glow: "color-mix(in oklab, var(--hero-headline) 14%, transparent)" },
    { fg: "#a37b32",              bg: "color-mix(in oklab, #a37b32 86%, var(--surface))",              glow: "color-mix(in oklab, #a37b32 14%, transparent)" },
    { fg: "var(--accent-soft)",   bg: "color-mix(in oklab, var(--accent-soft) 88%, var(--surface))",   glow: "color-mix(in oklab, var(--accent-soft) 14%, transparent)" },
    { fg: "var(--accent)",        bg: "color-mix(in oklab, var(--accent) 92%, var(--surface))",        glow: "color-mix(in oklab, var(--accent) 14%, transparent)" },
    { fg: "var(--accent-dark)",   bg: "color-mix(in oklab, var(--accent-dark) 92%, var(--surface))",   glow: "color-mix(in oklab, var(--accent-dark) 14%, transparent)" }
  ];

  return (
    <div className="rcm-ar-chart">
      {/* Top row — composite stacked bar, color cascade */}
      <div className="rcm-ar-bar" role="img" aria-label="A/R aging distribution">
        {aging.map((a, i) => {
          const pct = a.amount / total;
          const isHov = hover === i;
          const dim = hover !== null && !isHov;
          return (
            <div
              key={i}
              className="rcm-ar-seg"
              style={{
                width: `${pct * 100}%`,
                background: tones[i].bg,
                opacity: dim ? 0.35 : 1,
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              title={`${a.bucket} — ${fmt$(a.amount)}`}
            />
          );
        })}
      </div>

      {/* Detail rows — each bucket */}
      <div className="rcm-ar-rows">
        {aging.map((a, i) => {
          const pct = a.amount / total;
          const isHov = hover === i;
          return (
            <div
              key={i}
              className={`rcm-ar-row ${isHov ? "is-hover" : ""}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ background: isHov ? tones[i].glow : "transparent" }}
            >
              <div className="rcm-ar-row-bucket">
                <i className="rcm-ar-dot" style={{ background: tones[i].bg }}></i>
                <span className="rcm-ar-bucket-label">{a.bucket}</span>
                <span className="rcm-ar-bucket-risk" style={{ color: tones[i].fg }}>{RISK_LABELS[i]}</span>
              </div>
              <div className="rcm-ar-row-amt">
                <strong>{fmt$M(a.amount)}</strong>
                <span>{fmtPct(pct, 0)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Denial summary — nested ring (overall / CPT / encounter)
────────────────────────────────────────────────────────── */
function DenialNestedRing({ overall, byCPT, byEncounter, palette }) {
  // Top-N rollup so the rings stay readable
  const topN = (data, n) => {
    const sorted = [...data].sort((a, b) => b.v - a.v);
    if (sorted.length <= n) return sorted;
    const head = sorted.slice(0, n);
    const tail = sorted.slice(n);
    const otherV = tail.reduce((a, d) => a + d.v, 0);
    if (otherV > 0) head.push({ k: "Other", v: otherV });
    return head;
  };
  const cpt = topN(byCPT, 5);
  const enc = topN(byEncounter, 5);

  // Bigger canvas + breathing room
  const W = 460, H = 460;
  const cx = W / 2, cy = H / 2;
  // Concentric rings: outer = encounter, middle = CPT, inner = overall rate
  const rings = [
    { key: "enc", data: enc, R: 200, r: 158, label: "By encounter" },
    { key: "cpt", data: cpt, R: 152, r: 110, label: "By CPT" },
    { key: "ovr", data: [
        { k: "Denial rate", v: overall },
        { k: "Clean", v: 1 - overall }
      ], R: 100, r: 64, label: "Overall" }
  ];

  const [hover, setHover] = useState(null); // { ringKey, idx, k, v }

  // Soft palette — accent for outer, sage for middle, terracotta+border for inner
  const palettes = {
    enc: [
      "var(--accent)",
      "color-mix(in oklab, var(--accent) 70%, var(--surface))",
      "color-mix(in oklab, var(--accent) 48%, var(--surface))",
      "color-mix(in oklab, var(--accent) 28%, var(--surface))",
      "color-mix(in oklab, var(--accent) 14%, var(--surface))",
      "color-mix(in oklab, var(--rcm-ink) 18%, var(--surface))",
    ],
    cpt: [
      "var(--hero-headline)",
      "color-mix(in oklab, var(--hero-headline) 72%, var(--surface))",
      "color-mix(in oklab, var(--hero-headline) 50%, var(--surface))",
      "color-mix(in oklab, var(--hero-headline) 30%, var(--surface))",
      "color-mix(in oklab, var(--hero-headline) 14%, var(--surface))",
      "color-mix(in oklab, var(--rcm-ink) 18%, var(--surface))",
    ],
    ovr: [
      "var(--accent)",
      "color-mix(in oklab, var(--rcm-ink) 8%, var(--surface))"
    ]
  };

  function arcs(ring) {
    const sum = ring.data.reduce((a, d) => a + d.v, 0);
    let acc = 0;
    return ring.data.map((d, i) => {
      const start = (acc / sum) * Math.PI * 2 - Math.PI / 2;
      acc += d.v;
      const end = (acc / sum) * Math.PI * 2 - Math.PI / 2;
      const large = end - start > Math.PI ? 1 : 0;
      const x1 = cx + Math.cos(start) * ring.R, y1 = cy + Math.sin(start) * ring.R;
      const x2 = cx + Math.cos(end)   * ring.R, y2 = cy + Math.sin(end)   * ring.R;
      const x3 = cx + Math.cos(end)   * ring.r, y3 = cy + Math.sin(end)   * ring.r;
      const x4 = cx + Math.cos(start) * ring.r, y4 = cy + Math.sin(start) * ring.r;
      const path = `M${x1.toFixed(2)},${y1.toFixed(2)} A${ring.R},${ring.R} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${ring.r},${ring.r} 0 ${large} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`;
      return { ...d, path, color: palettes[ring.key][i % palettes[ring.key].length], pct: d.v / sum, idx: i };
    });
  }

  // Hover summary text in the center
  const centerNum = hover
    ? (hover.ringKey === "ovr" ? fmtPct(hover.v, 1) : fmtPct(hover.pct, 0))
    : fmtPct(overall, 1);
  const centerLabel = hover
    ? (hover.k.length > 22 ? hover.k.slice(0, 22) + "…" : hover.k)
    : "claims with denial codes";
  const centerSub = hover
    ? (hover.ringKey === "enc" ? "encounter type" : hover.ringKey === "cpt" ? "CPT code share" : "overall rate")
    : null;

  return (
    <div className="rcm-denial-donut">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Denial breakdown">
        {/* concentric ring labels — outer "encounter", middle "CPT" — drawn behind rings */}
        {rings.slice(0, 2).map((ring) => (
          <text key={`label-${ring.key}`}
            x={cx} y={cy - (ring.R + ring.r) / 2 + 4}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="rgba(255,255,255,0.7)"
            style={{ pointerEvents: "none", textTransform: "uppercase", letterSpacing: "0.12em" }}
          >
            {ring.label}
          </text>
        ))}

        {rings.map((ring) =>
          arcs(ring).map((a) => {
            const isHov = hover && hover.ringKey === ring.key && hover.idx === a.idx;
            const dim = hover !== null && !isHov;
            return (
              <path
                key={`${ring.key}-${a.idx}`}
                d={a.path}
                fill={a.color}
                opacity={dim ? 0.32 : 1}
                style={{ transition: "opacity 0.2s ease" }}
                onMouseEnter={() => setHover({ ringKey: ring.key, idx: a.idx, k: a.k, v: a.v, pct: a.pct })}
                onMouseLeave={() => setHover(null)}
              />
            );
          })
        )}

        {/* center hero */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="44" fontWeight="800" fill="var(--text)" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
          {centerNum}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-muted)" style={{ textTransform: "uppercase", letterSpacing: "0.14em" }}>
          {centerLabel}
        </text>
        {centerSub && (
          <text x={cx} y={cy + 36} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-muted)">
            {centerSub}
          </text>
        )}
      </svg>
    </div>
  );
}

Object.assign(window, {
  KPITile, IncomeVsBilledChart, ServiceLineChart, DonutChart, BubbleChart, StackedHBarChart,
  PayerMixChart, ARAgingChart, DenialNestedRing,
  fmt$, fmt$M, fmtPct, fmtN
});

/* eslint-disable no-undef */
/* rcm-app.jsx — main RCM Playground app
   Filters: Facility (multi), Payer (multi), Service line (multi)
   Charts: KPI tiles, Income vs Billed combo, Visits donut by facility,
           Write-off stacked bars by facility, Payer mix bars,
           A/R aging buckets, Denial nested ring
*/

const { useState, useMemo, useEffect } = React;

const PALETTE_FACILITY = [
  "var(--accent)",         // Clinic A
  "var(--hero-headline)",  // Clinic B
  "var(--accent-soft)",    // Hospital OP
  "#8b6f47",               // ASC 1
  "#6b7c50"                // Telehealth
];

const PALETTE_PAYER = [
  "var(--accent)", "var(--accent-soft)", "var(--accent-dark)",
  "var(--hero-headline)", "#7a8754", "#a36a3c",
  "#6b7c50", "#b07650"
];

const PALETTE_SVC = ["var(--accent)", "var(--hero-headline)", "var(--accent-soft)"];

/* ──────────────────────────────────────────────────────────
   Multi-select chip group
────────────────────────────────────────────────────────── */
function ChipGroup({ label, options, selected, onToggle, onAll, onNone }) {
  const allSelected = selected.length === options.length;
  return (
    <div className="filter-group">
      <div className="filter-head">
        <span className="filter-label">{label}</span>
        <div className="filter-actions">
          <button type="button" className="filter-action" onClick={onAll} disabled={allSelected}>All</button>
          <span className="filter-sep">·</span>
          <button type="button" className="filter-action" onClick={onNone} disabled={selected.length === 0}>None</button>
        </div>
      </div>
      <div className="filter-chips">
        {options.map(opt => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`filter-chip ${on ? "is-on" : ""}`}
              onClick={() => onToggle(opt)}
              aria-pressed={on}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Filtered data computation
────────────────────────────────────────────────────────── */
function useFilteredData(data, fac, pay, svc) {
  return useMemo(() => {
    // Facility weights normalized
    const facWSum = fac.reduce((a, f) => a + (data.facilities.includes(f) ? 1 : 0), 0) || 1;
    const facShare = fac.length / data.facilities.length;
    const payShare = pay.length / data.payers.length;
    const svcShare = svc.length / data.serviceLines.length;
    // Visits: sum across selected facilities
    const facMonthlyFiltered = data.months.map((_, mi) =>
      fac.reduce((sum, f) => sum + (data.facMonthly[f]?.[mi] || 0), 0)
    );
    const totalVisits = facMonthlyFiltered.reduce((a,b) => a + b, 0);

    // Visits-by-facility donut: only selected facilities
    const visitsDonut = fac.map(f => ({ k: f, v: data.facVisits[f] || 0 }));

    // Denials-by-payer bubbles (excluding contractual CARC 45/59/253)
    // Filter to selected payers only.
    const paySet = new Set(pay);
    const denialsByPayer = (data.payerDenialsFiltered || [])
      .filter(p => paySet.has(p.payer) && p.denials > 0)
      .map(p => ({ k: p.payer, v: p.denials, deniedBilled: p.deniedBilled, rate: p.rate, lines: p.lines }));
    const denialsByPayerTotal = denialsByPayer.reduce((a,b) => a + b.v, 0);

    // Income / Billed scaled by all 3 filter shares (proxy for narrowing slice)
    const slice = facShare * payShare * svcShare;
    const incomeMonthly = data.incomeMonthly.map(v => Math.round(v * slice));
    const billedMonthly = data.billedMonthly.map(v => Math.round(v * slice));

    // KPIs
    const income = incomeMonthly.reduce((a,b)=>a+b,0);
    const billed = billedMonthly.reduce((a,b)=>a+b,0);

    // Weighted denial rate from selected payers
    const payRevSum = pay.reduce((a,p) => a + (data.payerMix[p]?.revenue || 0), 0) || 1;
    const denialRate = pay.reduce((a,p) => {
      const m = data.payerMix[p];
      return a + (m ? (m.denialRate * m.revenue / payRevSum) : 0);
    }, 0);

    const openARpct = data.kpis.openARpct;

    // Write-off rows: only selected facilities, only selected service lines
    const writeOffRows = fac.map(f => {
      const row = { label: f };
      svc.forEach(s => {
        row[s] = data.writeOffByFacSvc[f]?.[s] || 0;
      });
      return row;
    }).filter(r => svc.some(s => r[s] > 0));

    // Payer mix scaled
    const payerMix = {};
    pay.forEach(p => {
      const m = data.payerMix[p];
      if (m) payerMix[p] = { ...m, revenue: Math.round(m.revenue * facShare * svcShare) };
    });

    // A/R aging scaled
    const arAging = data.arAging.map(a => ({ ...a, amount: Math.round(a.amount * slice) }));

    // Service line performance — uses REAL per-line averages from FinSum data
    const perLine = data.svcLineAvgPerLine || {
      "Behavioral": { billed: 219, payment: 124 },
      "Integrated": { billed: 95,  payment: 53 },
      "Medical":    { billed: 172, payment: 98 }
    };
    const SVC_REIMB = { "Behavioral": Math.round(perLine.Behavioral.payment),
                        "Integrated": Math.round(perLine.Integrated.payment),
                        "Medical":    Math.round(perLine.Medical.payment) };
    const SVC_BILL  = { "Behavioral": Math.round(perLine.Behavioral.billed),
                        "Integrated": Math.round(perLine.Integrated.billed),
                        "Medical":    Math.round(perLine.Medical.billed) };
    const facShareForVisits = facShare; // already proportional
    const serviceLineRows = svc.map(s => {
      // Sum visits across selected facilities for this service line
      let lineVisits = 0;
      let lineClaims = 0;
      fac.forEach(f => {
        const mix = data.facSvcMix[f]?.[s] || 0;
        const facV = data.facVisits[f] || 0;
        const facC = data.claimsPerFac[f] || 0;
        lineVisits += Math.round(facV * mix);
        lineClaims += Math.round(facC * mix);
      });
      // Scale by payer share too (since revenue depends on payer mix)
      const claimsScaled = Math.round(lineClaims * payShare);
      const revenue = Math.round(claimsScaled * SVC_REIMB[s]);
      const billedAmt = Math.round(claimsScaled * SVC_BILL[s]);
      return {
        line: s,
        visits: lineVisits,
        revenue,
        billed: billedAmt,
        ncr: billedAmt > 0 ? revenue / billedAmt : 0
      };
    });

    // Denial nested
    const denials = data.denials;

    return {
      kpis: { visits: totalVisits, income, billed, openARpct, denialRate },
      incomeMonthly, billedMonthly,
      visitsDonut,
      denialsByPayer,
      denialsByPayerTotal,
      writeOffRows,
      serviceLineRows,
      payerMixObj: payerMix,
      payersFiltered: pay,
      arAging,
      denials,
      months: data.months,
      slice
    };
  }, [data, fac, pay, svc]);
}

/* ──────────────────────────────────────────────────────────
   Main App
────────────────────────────────────────────────────────── */
function RcmApp() {
  const data = window.RCM_DATA;
  const [fac, setFac] = useState(data.facilities);
  const [pay, setPay] = useState(data.payers);
  const [svc, setSvc] = useState(data.serviceLines);

  const filtered = useFilteredData(data, fac, pay, svc);

  // Drilldown panel state
  const [drill, setDrill] = useState(null); // { type, key, ... }

  const toggle = (arr, setArr, options) => (val) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  // Tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "scenario": "baseline",
    "density": "comfortable"
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];

  // Apply scenario to data (visual layer only — multipliers on KPIs)
  const scenarioMult = {
    healthy:  { income: 1.12, denialRate: 0.7,  ar: 0.85 },
    baseline: { income: 1.0,  denialRate: 1.0,  ar: 1.0 },
    stressed: { income: 0.86, denialRate: 1.4,  ar: 1.25 }
  }[tweaks.scenario || "baseline"];

  const adjKpis = {
    visits: filtered.kpis.visits,
    income: Math.round(filtered.kpis.income * scenarioMult.income),
    billed: filtered.kpis.billed,
    openARpct: Math.min(0.85, filtered.kpis.openARpct * scenarioMult.ar),
    denialRate: Math.min(0.4, filtered.kpis.denialRate * scenarioMult.denialRate)
  };
  const adjIncomeMonthly = filtered.incomeMonthly.map(v => Math.round(v * scenarioMult.income));
  const adjArAging = filtered.arAging.map(a => ({ ...a, amount: Math.round(a.amount * scenarioMult.ar) }));
  const adjDenials = { ...filtered.denials, overallRate: Math.min(0.95, filtered.denials.overallRate * scenarioMult.denialRate) };

  const noFilters = fac.length === 0 || pay.length === 0 || svc.length === 0;

  const TweaksPanel = window.TweaksPanel;
  const TweakSection = window.TweakSection;
  const TweakRadio = window.TweakRadio;

  return (
    <>
      <section className="rcm-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Simple Modeling</p>
            <h1>RCM by Design: A Multi-facility Analysis</h1>
            <p className="rcm-hero-text">
              A revenue-cycle dashboard built from real multi-provider, multi-facility billing
              data &mdash; {data.kpis.charges.toLocaleString()} charge lines across {data.totalClaims.toLocaleString()} unique claims, all aggregated
              from the raw ledger. Toggle filters, swap scenarios, and hover any chart for
              detail. A representative slice of the {(data.kpis.scaledLabel || '250,000+')} claims I worked across
              {' '}{data.meta?.facilities || 5} facilities and {data.meta?.payers || 8} payers.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="resume.html">View Resume</a>
              <a className="button button-secondary" href="projects.html">View Projects</a>
            </div>
          </div>

          <aside className="hero-panel">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
              <img src="logo.png" alt="huy.gg" />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 0 0.6rem" }}>
              <p className="panel-label" style={{ marginBottom: "0.5rem" }}>Sample slice</p>
              <ul style={{ margin: 0, padding: "0 0 0 1.1rem", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--text-muted)" }}>
                <li><strong style={{ color: "var(--text)" }}>{data.kpis.charges.toLocaleString()} charge lines</strong> across {data.totalClaims.toLocaleString()} claims</li>
                <li><strong style={{ color: "var(--text)" }}>${(data.kpis.billed/1e6).toFixed(2)}M billed · ${(data.kpis.income/1e6).toFixed(2)}M paid</strong> · {(data.kpis.ncr*100).toFixed(1)}% NCR</li>
                <li><strong style={{ color: "var(--text)" }}>{(data.kpis.denialRate*100).toFixed(0)}% denial rate</strong> drilled by encounter &amp; CPT</li>
                <li>Hand-rolled SVG charts, no chart library</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="rcm-filters-bar">
        <div className="container rcm-scenario-row">
          <span className="filter-label">Scenario</span>
          <div className="rcm-scenario-toggle" role="radiogroup" aria-label="Data scenario">
            {[
              { value: "healthy",  label: "Healthy",  hint: "+12% income, fewer denials" },
              { value: "baseline", label: "Baseline", hint: "as analyzed" },
              { value: "stressed", label: "Stressed", hint: "−14% income, denials spike" }
            ].map(opt => {
              const active = (tweaks.scenario || "baseline") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`rcm-scenario-btn ${active ? "is-on" : ""}`}
                  onClick={() => setTweak("scenario", opt.value)}
                  title={opt.hint}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <span className="rcm-scenario-hint">
            {tweaks.scenario === "healthy"  && "+12% income · fewer denials · faster A/R"}
            {(!tweaks.scenario || tweaks.scenario === "baseline") && "Dataset as analyzed"}
            {tweaks.scenario === "stressed" && "−14% income · denials spike · A/R extends"}
          </span>
        </div>
        <div className="container rcm-filters-inner">
          <ChipGroup
            label="Facility"
            options={data.facilities}
            selected={fac}
            onToggle={toggle(fac, setFac)}
            onAll={() => setFac(data.facilities)}
            onNone={() => setFac([])}
          />
          <ChipGroup
            label="Payer mix"
            options={data.payers}
            selected={pay}
            onToggle={toggle(pay, setPay)}
            onAll={() => setPay(data.payers)}
            onNone={() => setPay([])}
          />
          <ChipGroup
            label="Service line"
            options={data.serviceLines}
            selected={svc}
            onToggle={toggle(svc, setSvc)}
            onAll={() => setSvc(data.serviceLines)}
            onNone={() => setSvc([])}
          />
          <div className="rcm-filter-summary">
            <strong>{Math.round(filtered.slice * 100)}%</strong> of total dataset shown
          </div>
        </div>
      </section>

      {noFilters ? (
        <section className="section">
          <div className="container">
            <div className="rcm-empty">
              <p className="eyebrow">No data</p>
              <h2>Pick at least one option in each filter</h2>
              <p>Use the chips above to bring data back into view.</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="section">
          <div className={`container rcm-grid rcm-density-${tweaks.density || "comfortable"}`}>

            {/* KPI Strip */}
            <div className="rcm-kpi-row">
              <KPITile label="Visits"      value={adjKpis.visits}        format="n"   trend={3.2} />
              <KPITile label="Income"      value={adjKpis.income}        format="$M"  trend={tweaks.scenario === "stressed" ? -8.4 : 5.1} accent="green" />
              <KPITile label="Billed"      value={adjKpis.billed}        format="$M"  trend={2.4} />
              <KPITile label="Open A/R"    value={adjKpis.openARpct}     format="%"   trend={tweaks.scenario === "stressed" ? 6.2 : -1.4} trendInverse accent="warn" />
              <KPITile label="Denial rate" value={adjDenials.overallRate} format="%"   trend={tweaks.scenario === "stressed" ? 4.5 : -0.8} trendInverse accent="danger" />
            </div>

            {/* Income vs Billed */}
            <div className="rcm-card rcm-card-wide">
              <div className="rcm-card-head">
                <div>
                  <p className="eyebrow">Revenue trend</p>
                  <h3>Income vs Billed · Monthly</h3>
                </div>
                <div className="rcm-card-meta">
                  <span><i className="rcm-dot" style={{ background: "var(--rcm-ink)", opacity: 0.85 }}></i>Billed</span>
                  <span><i className="rcm-dot" style={{ background: "var(--hero-headline)", borderRadius: "50%" }}></i>Income</span>
                </div>
              </div>
              <IncomeVsBilledChart income={adjIncomeMonthly} billed={filtered.billedMonthly} months={filtered.months} benchmark={1320000} />
            </div>

            {/* Service line performance — utilization × yield */}
            <div className="rcm-card rcm-card-wide">
              <div className="rcm-card-head">
                <div>
                  <p className="eyebrow">Service line performance</p>
                  <h3>Utilization &amp; yield by service line</h3>
                </div>
                <div className="rcm-card-meta rcm-card-meta-muted">
                  Bar = revenue &bull; pill = NCR
                </div>
              </div>
              {filtered.serviceLineRows.length > 0
                ? <ServiceLineChart rows={filtered.serviceLineRows} />
                : <div className="rcm-empty-mini">No service lines selected.</div>
              }
              <p className="rcm-card-foot">
                {(() => {
                  const top = [...filtered.serviceLineRows].sort((a,b) => b.revenue - a.revenue)[0];
                  if (!top) return null;
                  return <><strong>{top.line}</strong> drives {fmt$M(top.revenue)} on {fmtN(top.visits)} visits at {fmtPct(top.ncr, 1)} NCR.</>;
                })()}
              </p>
            </div>

            {/* Distribution: visits + denials side-by-side */}
            <div className="rcm-card rcm-card-wide">
              <div className="rcm-card-head">
                <div>
                  <p className="eyebrow">Distribution</p>
                  <h3>Volume & denials by counterparty</h3>
                </div>
                <div className="rcm-card-meta rcm-card-meta-muted">
                  Denials exclude contractual CARCs (45, 59, 253)
                </div>
              </div>
              <div className="rcm-bubble-pair">
                <div className="rcm-bubble-cell">
                  <p className="rcm-bubble-cell-title">Visits by facility</p>
                  <BubbleChart
                    data={filtered.visitsDonut}
                    total={adjKpis.visits}
                    label="Visits"
                    sublabel="Visits"
                    palette={PALETTE_FACILITY}
                  />
                </div>
                <div className="rcm-bubble-cell">
                  <p className="rcm-bubble-cell-title">Denials issued by payer</p>
                  {filtered.denialsByPayer.length > 0 ? (
                    <BubbleChart
                      data={filtered.denialsByPayer}
                      total={Math.round(filtered.denialsByPayerTotal * (filtered.slice || 1))}
                      label="Denials"
                      sublabel="Denials"
                      palette={PALETTE_PAYER}
                    />
                  ) : (
                    <div className="rcm-empty-mini">No payers selected.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Write-off stacked */}
            <div className="rcm-card rcm-card-wide">
              <div className="rcm-card-head">
                <div>
                  <p className="eyebrow">Operational losses</p>
                  <h3>Average write-off by facility & service line</h3>
                </div>
                <div className="rcm-card-meta">
                  {svc.map((s, i) => (
                    <span key={s}><i className="rcm-dot" style={{ background: PALETTE_SVC[data.serviceLines.indexOf(s)] }}></i>{s}</span>
                  ))}
                </div>
              </div>
              {filtered.writeOffRows.length > 0
                ? <StackedHBarChart rows={filtered.writeOffRows} services={svc} palette={svc.map(s => PALETTE_SVC[data.serviceLines.indexOf(s)])} />
                : <div className="rcm-empty-mini">No facilities match the current filters.</div>
              }
            </div>

            {/* Denial nested ring */}
            <div className="rcm-card rcm-card-wide">
              <div className="rcm-card-head">
                <div>
                  <p className="eyebrow">Quality</p>
                  <h3>Denial summary</h3>
                </div>
                <div className="rcm-card-meta rcm-card-meta-muted">
                  Outer: encounter &bull; Middle: CPT &bull; Center: overall
                </div>
              </div>
              <DenialNestedRing
                overall={adjDenials.overallRate}
                byCPT={adjDenials.distByCPT}
                byEncounter={adjDenials.distByEncounter}
                palette={PALETTE_PAYER}
              />
              <div className="rcm-denial-legend">
                <div><strong>{fmtN(filtered.denials.issued)}</strong><span>denials issued</span></div>
                <div><strong>{fmtN(filtered.denials.affected)}</strong><span>claims affected</span></div>
              </div>
            </div>

            {/* Payer mix */}
            <div className="rcm-card rcm-card-wide">
              <div className="rcm-card-head">
                <div>
                  <p className="eyebrow">Payer performance</p>
                  <h3>Revenue by payer</h3>
                </div>
                <div className="rcm-card-meta rcm-card-meta-muted">
                  Hover over a bar for details
                </div>
              </div>
              {filtered.payersFiltered.length > 0
                ? <PayerMixChart payers={filtered.payersFiltered} mix={filtered.payerMixObj} palette={PALETTE_PAYER} />
                : <div className="rcm-empty-mini">No payers selected.</div>
              }
            </div>

            {/* A/R aging */}
            <div className="rcm-card rcm-card-wide">
              <div className="rcm-card-head">
                <div>
                  <p className="eyebrow">Cash flow risk</p>
                  <h3>A/R aging buckets</h3>
                </div>
              </div>
              <ARAgingChart aging={adjArAging} />
              <p className="rcm-card-foot">
                {fmtPct(adjArAging[adjArAging.length-1].amount / adjArAging.reduce((a,b)=>a+b.amount,0), 0)} of A/R is over 90 days; escalation candidate.
              </p>
            </div>

          </div>
        </section>
      )}

      {TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Data scenario" subtitle="Stress-test the dashboard with different financial scenarios.">
            <TweakRadio
              label="Scenario"
              value={tweaks.scenario || "baseline"}
              options={[
                { value: "healthy",  label: "Healthy" },
                { value: "baseline", label: "Baseline" },
                { value: "stressed", label: "Stressed" }
              ]}
              onChange={(v) => setTweak("scenario", v)}
            />
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              <strong>Healthy:</strong> +12% income, fewer denials, faster A/R.<br/>
              <strong>Baseline:</strong> as analyzed.<br/>
              <strong>Stressed:</strong> -14% income, denials spike, A/R extends.
            </p>
          </TweakSection>
          <TweakSection title="Layout">
            <TweakRadio
              label="Density"
              value={tweaks.density || "comfortable"}
              options={[
                { value: "compact",     label: "Compact" },
                { value: "comfortable", label: "Comfortable" }
              ]}
              onChange={(v) => setTweak("density", v)}
            />
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("rcm-root"));
root.render(<RcmApp />);

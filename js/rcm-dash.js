/* rcm-dash.js — faithful 1A-styled port of the huy.gg RCM dashboard.
   Reads window.RCM_DATA (copied from the repo). Vanilla JS; colors via CSS vars
   inherited from #home-root so it recolors with the site's dark/light theme. */
(function () {
  const D = window.RCM_DATA;
  if (!D) return;

  const MON = D.months;
  const PAL_FAC = ['var(--ser1)', 'var(--ser2)', 'var(--ser3)', 'var(--ser4)', 'var(--ser5)'];
  const PAL_PAY = ['var(--ser1)', 'var(--ser2)', 'var(--ser3)', 'var(--ser4)', 'var(--ser5)'];
  const PAL_SVC = { 'Behavioral': 'var(--sumi3)', 'Integrated': 'var(--sumi1)', 'Medical': 'var(--sumi)' };

  /* A fixed palette indexed with i % length restarts once the series is longer
     than the palette, so the 6th payer took the 1st payer's color and the sort
     read as noise. Interpolating across the ramp keeps color monotonic with
     value for any number of items. */
  const rampAt = (i, n) => n <= 1 ? 'var(--ser1)'
    : 'color-mix(in srgb, var(--ser5) ' + ((i / (n - 1)) * 100).toFixed(1) + '%, var(--ser1))';

  const fmtN = (n) => Math.round(n).toLocaleString('en-US');
  const fmtM = (n) => '$' + (n / 1e6).toFixed(2) + 'M';
  const fmtPct = (x, d) => (x * 100).toFixed(d || 0) + '%';
  const esc = (s) => String(s);

  const SCEN = {
    healthy: { income: 1.12, denialRate: 0.7, ar: 0.85 },
    baseline: { income: 1.0, denialRate: 1.0, ar: 1.0 },
    stressed: { income: 0.86, denialRate: 1.4, ar: 1.25 }
  };

  function compute(fac, pay, svc) {
    const facShare = fac.length / D.facilities.length;
    const payShare = pay.length / D.payers.length;
    const svcShare = svc.length / D.serviceLines.length;
    const slice = facShare * payShare * svcShare;
    const facMonthly = MON.map((_, mi) => fac.reduce((s, f) => s + ((D.facMonthly[f] || [])[mi] || 0), 0));
    const totalVisits = facMonthly.reduce((a, b) => a + b, 0);
    const visitsDonut = fac.map((f) => ({ k: f, v: D.facVisits[f] || 0 }));
    const paySet = new Set(pay);
    const denialsByPayer = (D.payerDenialsFiltered || []).filter((p) => paySet.has(p.payer) && p.denials > 0)
      .map((p) => ({ k: p.payer, v: p.denials, deniedBilled: p.deniedBilled, rate: p.rate }));
    const denByPayTotal = denialsByPayer.reduce((a, b) => a + b.v, 0);
    const incomeMonthly = D.incomeMonthly.map((v) => Math.round(v * slice));
    const billedMonthly = D.billedMonthly.map((v) => Math.round(v * slice));
    const income = incomeMonthly.reduce((a, b) => a + b, 0);
    const billed = billedMonthly.reduce((a, b) => a + b, 0);
    const payRevSum = pay.reduce((a, p) => a + ((D.payerMix[p] || {}).revenue || 0), 0) || 1;
    const denialRate = pay.reduce((a, p) => { const m = D.payerMix[p]; return a + (m ? m.denialRate * m.revenue / payRevSum : 0); }, 0);
    const writeOffRows = fac.map((f) => { const r = { label: f }; svc.forEach((s) => { r[s] = (D.writeOffByFacSvc[f] || {})[s] || 0; }); return r; }).filter((r) => svc.some((s) => r[s] > 0));
    const payerMix = {}; pay.forEach((p) => { const m = D.payerMix[p]; if (m) payerMix[p] = Object.assign({}, m, { revenue: Math.round(m.revenue * facShare * svcShare) }); });
    const arAging = D.arAging.map((a) => ({ bucket: a.bucket, amount: Math.round(a.amount * slice) }));
    const perLine = D.svcLineAvgPerLine;
    const serviceLineRows = svc.map((s) => {
      let lineVisits = 0, lineClaims = 0;
      fac.forEach((f) => { const mix = (D.facSvcMix[f] || {})[s] || 0; lineVisits += Math.round((D.facVisits[f] || 0) * mix); lineClaims += Math.round((D.claimsPerFac[f] || 0) * mix); });
      const claimsScaled = Math.round(lineClaims * payShare);
      const revenue = Math.round(claimsScaled * perLine[s].payment);
      const billedAmt = Math.round(claimsScaled * perLine[s].billed);
      return { line: s, visits: lineVisits, revenue: revenue, billed: billedAmt, ncr: billedAmt > 0 ? revenue / billedAmt : 0 };
    });
    return { visits: totalVisits, income, billed, openARpct: D.kpis.openARpct, denialRate, incomeMonthly, billedMonthly, visitsDonut, denialsByPayer, denByPayTotal, writeOffRows, payerMix, payersFiltered: pay, arAging, serviceLineRows, denials: D.denials, slice };
  }

  /* ---------- chart builders (return HTML strings) ---------- */
  function card(eyebrow, title, meta, body) {
    return '<div style="border:1px solid var(--border);border-radius:16px;background:var(--panel-grad);padding:clamp(18px,2vw,26px);box-shadow:0 22px 60px rgba(0,0,0,.22);">' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px 16px;align-items:flex-end;justify-content:space-between;margin-bottom:18px;">' +
      '<div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--flare);margin-bottom:6px;">' + eyebrow + '</div>' +
      '<h3 style="font-size:clamp(18px,2vw,22px);font-weight:600;letter-spacing:-.01em;">' + title + '</h3></div>' +
      (meta ? '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:11.5px;color:var(--muted2);display:flex;gap:14px;flex-wrap:wrap;align-items:center;">' + meta + '</div>' : '') +
      '</div>' + body + '</div>';
  }
  function dot(c, round) { return '<i style="display:inline-block;width:10px;height:10px;margin-right:6px;background:' + c + ';border-radius:' + (round ? '50%' : '2px') + ';vertical-align:-1px;"></i>'; }

  function kpiTile(label, value, accent, trend, inverse) {
    const up = trend >= 0; const good = inverse ? !up : up;
    return '<div style="border:1px solid var(--border);border-radius:14px;background:var(--surface2);padding:15px 17px;">' +
      '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted2);margin-bottom:7px;">' + label + '</div>' +
      '<div style="font-size:24px;font-weight:600;letter-spacing:-.01em;color:' + (accent === 'accent' ? 'var(--flare)' : 'var(--text)') + ';">' + value + '</div>' +
      '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;margin-top:5px;color:' + (good ? 'var(--steady)' : 'var(--adverse)') + ';">' + (up ? '▲' : '▼') + ' ' + Math.abs(trend).toFixed(1) + '%</div></div>';
  }

  function chartIB(income, billed, benchmark) {
    const W = 720, H = 240, pl = 8, pr = 8, pt = 16, pb = 26, cH = H - pt - pb, cW = W - pl - pr;
    const gw = cW / 12, bw = Math.min(30, gw * 0.5);
    const maxS = Math.max(Math.max.apply(null, billed), benchmark || 0) * 1.12 || 1;
    const benchY = benchmark ? pt + cH - (benchmark / maxS) * cH : -999;
    let bars = '', line = '', dots = '', labels = '', hits = '';
    billed.forEach((v, i) => {
      const cx = pl + i * gw + gw / 2, h = (v / maxS) * cH, y = pt + cH - h;
      bars += '<rect data-ib-bar="' + i + '" x="' + (cx - bw / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" rx="3" style="fill:var(--billed);transition:opacity .2s ease;"></rect>';
      const iy = pt + cH - (income[i] / maxS) * cH;
      line += (i === 0 ? 'M' : 'L') + cx.toFixed(1) + ' ' + iy.toFixed(1) + ' ';
      dots += '<circle data-ib-dot="' + i + '" cx="' + cx.toFixed(1) + '" cy="' + iy.toFixed(1) + '" r="3" style="fill:var(--income);transition:r .15s ease;"></circle>';
      labels += '<text x="' + cx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" style="fill:var(--muted2);font-family:\'IBM Plex Mono\',monospace;font-size:10px;">' + MON[i] + '</text>';
      /* One full-height target per column, so the whole month is hoverable rather
         than just the bar. Painted transparent because pointer-events need a fill.
         The income value sits above its dot unless that lands it on the prior-year
         line, where it flips below rather than overprinting the benchmark. */
      const ivAbove = iy - 11;
      const ivY = Math.abs(ivAbove - benchY) < 15 ? iy + 17 : ivAbove;
      hits += '<rect data-ib-hit="' + i + '" x="' + (pl + i * gw).toFixed(1) + '" y="' + pt + '" width="' + gw.toFixed(1) + '" height="' + cH + '" fill="transparent" style="cursor:pointer;"' +
        ' data-m="' + MON[i] + '" data-b="' + fmtM(v) + '" data-i="' + fmtM(income[i]) +
        '" data-cx="' + cx.toFixed(1) + '" data-by="' + y.toFixed(1) + '" data-iy="' + ivY.toFixed(1) + '"></rect>';
    });
    let bench = '';
    if (benchmark) {
      const by = pt + cH - (benchmark / maxS) * cH;
      bench = '<line x1="' + pl + '" y1="' + by.toFixed(1) + '" x2="' + (W - pr) + '" y2="' + by.toFixed(1) + '" style="stroke:var(--muted);stroke-width:1.5;stroke-dasharray:5 4;opacity:.8;"></line>' +
        '<text x="' + (W - pr) + '" y="' + (by - 6).toFixed(1) + '" text-anchor="end" style="fill:var(--muted2);font-family:\'IBM Plex Mono\',monospace;font-size:10px;">Prior-yr avg $' + (benchmark / 1e6).toFixed(2) + 'M</text>';
    }
    /* Values park on the marks they describe: billed above its bar, income
       above its dot. A corner readout makes the eye leave the column it is
       reading. Both start empty and are positioned by the hover handler. */
    const readout =
      '<text data-ib="bval" text-anchor="middle" style="pointer-events:none;fill:var(--muted);font-size:11.5px;font-weight:600;"></text>' +
      '<text data-ib="ival" text-anchor="middle" style="pointer-events:none;fill:var(--income);font-size:11.5px;font-weight:600;"></text>';
    return '<div class="ib-wrap"><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;overflow:visible;">' +
      bars + bench + '<path d="' + line + '" fill="none" style="stroke:var(--income);stroke-width:2.5;"></path>' + dots + labels + readout + hits + '</svg></div>';
  }

  function donut(segs, centerMain, centerSub) {
    /* Path arcs, not a conic-gradient, because a gradient is one element and has
       no per-slice hit target. Each slice carries its key and value so the center
       can read them back on hover and fall to the total at rest. */
    const W = 204, c = 102, R = 92, r = 62;
    function arc(a0, a1) {
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const p = (rad, ang) => (c + Math.cos(ang) * rad).toFixed(2) + ',' + (c + Math.sin(ang) * rad).toFixed(2);
      return 'M' + p(R, a0) + ' A' + R + ',' + R + ' 0 ' + large + ' 1 ' + p(R, a1) +
             ' L' + p(r, a1) + ' A' + r + ',' + r + ' 0 ' + large + ' 0 ' + p(r, a0) + ' Z';
    }
    let acc = 0, paths = '';
    segs.forEach((sg) => {
      const a0 = acc * Math.PI * 2 - Math.PI / 2;
      acc += sg.pct;
      const a1 = acc * Math.PI * 2 - Math.PI / 2;
      if (a1 - a0 < 0.0006) return;
      paths += '<path d="' + arc(a0, a1) + '" data-dn-slice="1" data-k="' + esc(sg.k || '') +
        '" data-v="' + esc(sg.val || '') + '" data-pct="' + (sg.pct * 100).toFixed(1) +
        '" style="fill:' + sg.color + ';cursor:pointer;transition:opacity .2s ease;"></path>';
    });
    return '<div class="dn-wrap" data-dn-main="' + esc(centerMain) + '" data-dn-sub="' + esc(centerSub) + '" style="width:' + W + 'px;margin:0 auto;">' +
      '<svg viewBox="0 0 ' + W + ' ' + W + '" style="width:100%;height:auto;display:block;">' + paths +
      '<text data-dn="num" x="' + c + '" y="' + (c - 2) + '" text-anchor="middle" style="pointer-events:none;fill:var(--text);font-size:26px;font-weight:600;letter-spacing:-.01em;">' + centerMain + '</text>' +
      '<text data-dn="label" x="' + c + '" y="' + (c + 18) + '" text-anchor="middle" style="pointer-events:none;fill:var(--muted2);font-family:\'IBM Plex Mono\',monospace;font-size:11px;">' + centerSub + '</text>' +
      '</svg></div>';
  }
  function legendRows(items) {
    return '<div style="display:flex;flex-direction:column;gap:6px;margin-top:14px;">' + items.map((it) =>
      '<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);">' + dot(it.color) + it.k + '<span style="margin-left:auto;color:var(--text);font-family:\'IBM Plex Mono\',monospace;">' + it.val + '</span></div>').join('') + '</div>';
  }

  function nestedRing(overall, byCPT, byEnc) {
    /* Three concentric data rings drawn as real <path> wedges, not dashed circle
       strokes, because each segment needs its own hover target to drive the
       center readout. Geometry and radii restored from the original React
       DenialNestedRing; palette is the current ink theme. */
    const W = 460, cx = 230, cy = 230;
    const encPal = ['var(--ser1)', 'var(--ser2)', 'var(--ser4)', 'var(--ser5)', 'var(--ser-rest)'];
    const cptPal = ['var(--ser1)', 'var(--ser2)', 'var(--ser4)', 'var(--ser5)', 'var(--ser-rest)'];
    const ovrPal = ['var(--ser1)', 'var(--ser-rest)'];
    const rings = [
      { key: 'enc', data: byEnc, R: 200, r: 158, pal: null, ring: 'By encounter', sub: 'encounter type' },
      { key: 'cpt', data: byCPT, R: 152, r: 110, pal: null, ring: 'By CPT', sub: 'CPT code share' },
      { key: 'ovr', data: [{ k: 'Denial rate', v: overall }, { k: 'Clean', v: Math.max(0, 1 - overall) }], R: 100, r: 64, pal: ovrPal, ring: '', sub: 'overall rate' }
    ];
    function arcPath(R, r, a0, a1) {
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const x1 = cx + Math.cos(a0) * R, y1 = cy + Math.sin(a0) * R;
      const x2 = cx + Math.cos(a1) * R, y2 = cy + Math.sin(a1) * R;
      const x3 = cx + Math.cos(a1) * r, y3 = cy + Math.sin(a1) * r;
      const x4 = cx + Math.cos(a0) * r, y4 = cy + Math.sin(a0) * r;
      return 'M' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' A' + R + ',' + R + ' 0 ' + large + ' 1 ' + x2.toFixed(2) + ',' + y2.toFixed(2) +
             ' L' + x3.toFixed(2) + ',' + y3.toFixed(2) + ' A' + r + ',' + r + ' 0 ' + large + ' 0 ' + x4.toFixed(2) + ',' + y4.toFixed(2) + ' Z';
    }
    let paths = '', ringLabels = '';
    rings.forEach((ring) => {
      const sum = (ring.data || []).reduce((a, d) => a + d.v, 0) || 1;
      let acc = 0;
      (ring.data || []).forEach((d, i) => {
        const a0 = (acc / sum) * Math.PI * 2 - Math.PI / 2;
        acc += d.v;
        const a1 = (acc / sum) * Math.PI * 2 - Math.PI / 2;
        if (a1 - a0 < 0.0006) return;
        paths += '<path d="' + arcPath(ring.R, ring.r, a0, a1) + '" data-ring="' + ring.key + '"' + (i === 0 ? ' data-first="1"' : '') + ' data-k="' + esc(d.k) + '" data-pct="' + (d.v / sum).toFixed(5) +
          '" data-val="' + d.v.toFixed(5) + '" data-sub="' + ring.sub + '" style="fill:' + (ring.pal ? ring.pal[i % ring.pal.length] : rampAt(i, ring.data.length)) + ';cursor:pointer;transition:opacity .2s ease;"></path>';
      });
      if (ring.ring) {
        /* One centered element in --muted2, the same value the center caption
           uses. A mid ink is the only fill that survives the 12 o'clock seam:
           it never drops below 2.25:1 on any of the four grounds the label can
           cross, where full ink hits 1.00:1 on the black wedge and washi hits
           1.08:1 on the pale tail. Soft everywhere beats crisp then invisible. */
        const ly = cy - (ring.R + ring.r) / 2 + 4;
        ringLabels += '<text x="' + cx + '" y="' + ly + '" text-anchor="middle" style="pointer-events:none;fill:var(--on-series);font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">' + ring.ring + '</text>';
      }
    });
    const center =
      '<text data-nr="num" x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" style="pointer-events:none;fill:var(--text);font-size:44px;font-weight:700;letter-spacing:-.02em;">' + fmtPct(overall, 1) + '</text>' +
      '<text data-nr="label" x="' + cx + '" y="' + (cy + 22) + '" text-anchor="middle" style="pointer-events:none;fill:var(--muted2);font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;">claims with denial codes</text>' +
      '<text data-nr="sub" x="' + cx + '" y="' + (cy + 40) + '" text-anchor="middle" style="pointer-events:none;fill:var(--muted2);font-family:\'IBM Plex Mono\',monospace;font-size:10px;"></text>';
    return '<div class="nr-wrap" data-nr-default="' + fmtPct(overall, 1) + '" style="flex:1 1 340px;display:flex;justify-content:center;min-width:280px;">' +
      '<svg viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="Denial breakdown by encounter, CPT, and overall rate" style="width:100%;max-width:540px;height:auto;display:block;">' +
      paths + ringLabels + center + '</svg></div>';
  }

  function stackedWriteoff(rows, svc) {
    const totals = rows.map((r) => svc.reduce((a, s) => a + (r[s] || 0), 0));
    const max = Math.max.apply(null, totals) || 1;
    return '<div style="display:flex;flex-direction:column;gap:12px;">' + rows.map((r, ri) => {
      const total = totals[ri];
      const segs = svc.map((s) => { const v = r[s] || 0; return v > 0 ? '<div title="' + s + ': $' + fmtN(v) + '" style="width:' + (v / max * 100) + '%;background:' + PAL_SVC[s] + ';display:flex;align-items:center;justify-content:center;font-size:10.5px;color:var(--on-series);font-weight:600;overflow:hidden;white-space:nowrap;">' + (v >= max * 0.09 ? '$' + fmtN(v) : '') + '</div>' : ''; }).join('');
      return '<div style="display:grid;grid-template-columns:92px 1fr 84px;gap:12px;align-items:center;">' +
        '<div style="font-size:13px;color:var(--text);">' + r.label + '</div>' +
        '<div style="display:flex;height:26px;border-radius:6px;overflow:hidden;background:var(--track);">' + segs + '</div>' +
        '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:12px;color:var(--muted);text-align:right;">$' + fmtN(total) + '</div></div>';
    }).join('') + '</div>';
  }

  function payerBars(payers, mix) {
    /* Descending by revenue. The series palette is a ramp now, so an unordered
       list makes the ramp meaningless: dark and light alternate at random. Sorted,
       color and length agree and the ramp reads as magnitude. */
    payers = payers.slice().sort((a, b) => ((mix[b] || {}).revenue || 0) - ((mix[a] || {}).revenue || 0));
    const vals = payers.map((p) => (mix[p] || {}).revenue || 0);
    const max = Math.max.apply(null, vals) || 1;
    return '<div style="display:flex;flex-direction:column;gap:10px;">' + payers.map((p, i) => {
      const m = mix[p] || {}; const v = m.revenue || 0;
      return '<div title="' + p + ': ' + fmtM(v) + ', denial ' + fmtPct(m.denialRate || 0, 1) + '">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px;"><span>' + p + '</span><span style="color:var(--text);font-family:\'IBM Plex Mono\',monospace;">' + fmtM(v) + '</span></div>' +
        '<div style="height:9px;border-radius:5px;background:var(--track);overflow:hidden;"><div style="height:100%;width:' + (v / max * 100).toFixed(1) + '%;background:' + rampAt(i, payers.length) + ';border-radius:5px;"></div></div></div>';
    }).join('') + '</div>';
  }

  function arBars(aging) {
    const max = Math.max.apply(null, aging.map((a) => a.amount)) || 1;
    return '<div style="display:flex;align-items:flex-end;gap:12px;height:170px;padding-top:10px;">' + aging.map((a) => {
      const h = (a.amount / max) * 130;
      /* Three tiers, so age reads as increasing weight rather than a binary flag:
         current takes the pale wash, the middle buckets take mid ink, and
         anything past 90 days takes full ink. --billed is already semi-opaque,
         so it renders at opacity 1 or it would disappear. */
      const over = a.bucket === '120+' || a.bucket === '91-120';
      const current = a.bucket === '0-30';
      const fill = over ? 'var(--adverse)' : current ? 'var(--billed)' : 'var(--steady)';
      const op = over || current ? 1 : 0.55;
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;justify-content:flex-end;height:100%;">' +
        '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;color:var(--muted);">$' + (a.amount / 1e6).toFixed(1) + 'M</div>' +
        '<div title="' + a.bucket + ' days: $' + fmtN(a.amount) + '" style="width:100%;max-width:54px;height:' + h.toFixed(1) + 'px;border-radius:6px 6px 0 0;background:' + fill + ';opacity:' + op + ';"></div>' +
        '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;color:var(--muted2);">' + a.bucket + '</div></div>';
    }).join('') + '</div>';
  }

  function serviceLineChart(rows) {
    const max = Math.max.apply(null, rows.map((r) => r.revenue)) || 1;
    return '<div style="display:flex;flex-direction:column;gap:14px;">' + rows.map((r) => {
      return '<div><div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:5px;"><span style="color:var(--text);">' + r.line + '</span>' +
        '<span style="display:inline-flex;gap:8px;align-items:center;font-family:\'IBM Plex Mono\',monospace;font-size:11.5px;color:var(--muted);">' + fmtN(r.visits) + ' visits<span style="padding:2px 9px;border-radius:999px;border:1px solid var(--border2);color:var(--flare);">' + fmtPct(r.ncr, 1) + ' NCR</span></span></div>' +
        '<div style="height:12px;border-radius:6px;background:var(--track);overflow:hidden;"><div title="' + r.line + ': ' + fmtM(r.revenue) + '" style="height:100%;width:' + (r.revenue / max * 100).toFixed(1) + '%;background:' + PAL_SVC[r.line] + ';border-radius:6px;"></div></div></div>';
    }).join('') + '</div>';
  }

  /* ---------- filter UI ---------- */

  // A segmented pill. Each item is {act, key, text, active}; the active half is filled,
  // which is also the half that is disabled, so "currently true" and "nothing to click"
  // are the same signal rather than two competing ones.
  function seg(items) {
    return '<span style="display:inline-flex;flex:0 0 auto;border:1px solid var(--border2);border-radius:999px;overflow:hidden;background:var(--surface);">' +
      items.map(function (it, i) {
        return '<button data-act="' + it.act + '" data-key="' + it.key + '"' + (it.active ? ' disabled' : '') +
          ' style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;' +
          'padding:4px 11px;border:none;' + (i ? 'border-left:1px solid var(--border2);' : '') +
          'background:' + (it.active ? 'var(--accent)' : 'transparent') + ';' +
          'color:' + (it.active ? 'var(--accent-ink)' : 'var(--flare)') + ';' +
          'cursor:' + (it.active ? 'default' : 'pointer') + ';transition:background .15s ease,color .15s ease;">' +
          it.text + '</button>';
      }).join('') + '</span>';
  }

  function chipGroup(label, options, selected, key, divider) {
    const allOn = selected.length === options.length;
    // A left rule and its own padding give each group a visible boundary, so a
    // reader can tell where one filter ends and the next begins.
    return '<div style="min-width:190px;flex:1 1 230px;' + (divider ? 'border-left:1px solid var(--border2);padding-left:22px;' : '') + '">' +
      // The control sits at its group's right edge. Beside the label it read as a
      // continuation of the label's words; the left rule above is what now marks
      // which group it belongs to, so the far edge is no longer ambiguous.
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px;">' +
      '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);">' + label + '</span>' +
      // All and None are controls, so they carry a control's affordances: a segmented
      // pill whose filled half states which one is currently true. The shared 1px rule
      // between them replaces the separator glyph the plain-text version needed.
      seg([
        { act: 'all', key: key, text: 'All', active: allOn },
        { act: 'none', key: key, text: 'None', active: selected.length === 0 },
      ]) + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:7px;">' + options.map((o) => {
        const on = selected.indexOf(o) >= 0;
        return '<button data-chip="' + key + '" data-val="' + esc(o) + '" style="font-family:\'IBM Plex Mono\',monospace;font-size:12px;padding:6px 12px;border-radius:999px;cursor:pointer;transition:all .15s ease;border:1px solid ' + (on ? 'var(--accent)' : 'var(--border2)') + ';background:' + (on ? 'var(--accent)' : 'transparent') + ';color:' + (on ? 'var(--accent-ink)' : 'var(--muted)') + ';">' + o + '</button>';
      }).join('') + '</div></div>';
  }

  window.renderRcmDash = function (root) {
    if (!root) return;
    const S = { fac: D.facilities.slice(), pay: D.payers.slice(), svc: D.serviceLines.slice(), scenario: 'baseline' };

    root.innerHTML =
      (document.querySelector('#rcm-scenario') ? '' : '<div id="rcm-scenario-fallback" style="max-width:1280px;margin:0 auto clamp(14px,2vw,20px);"></div>') +
      '<div style="max-width:1280px;margin:0 auto;border:1px solid var(--border);border-radius:16px;background:var(--surface2);padding:clamp(16px,2vw,22px);margin-bottom:16px;">' +
      '<div id="rcm-filters" style="display:flex;flex-wrap:wrap;gap:22px;"></div></div>' +
      '<div id="rcm-charts" style="max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:16px;"></div>';

    // The page may host the scenario card in its hero, outside this root. Prefer that element
    // when it exists, and fall back to the in-root row so a page without the card still works.
    const scenEl = document.querySelector('#rcm-scenario') || root.querySelector('#rcm-scenario-fallback');
    const filtersEl = root.querySelector('#rcm-filters');
    const chartsEl = root.querySelector('#rcm-charts');

    function renderScenario() {
      /* Downside, base, upside: the order financial scenario controls conventionally
         use, so the axis reads worst to best rather than best to worst. */
      const opts = [['stressed', 'Stressed'], ['baseline', 'Baseline'], ['healthy', 'Healthy']];
      // Baseline carries no hint: the two adjusted scenarios describe how they differ from it,
      // so labelling the unadjusted case restates the word already on its own button.
      const hint = { healthy: '+12% income, fewer denials, faster A/R', baseline: 'Figures unadjusted.', stressed: '−14% income, denials spike, A/R extends' }[S.scenario];
      const mono = 'font-family:\'IBM Plex Mono\',monospace;';
      const eyebrow = mono + 'font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);';
      // Same mark the home page's IMPACT card carries: a filled tile of three bars. Reused
      // rather than redrawn so the two cards read as the same family of card.
      const bar = (h) => '<span style="width:2.5px;height:' + h + 'px;background:var(--bg);border-radius:1px;"></span>';
      const chartIcon = '<span style="display:inline-flex;align-items:flex-end;justify-content:center;gap:1.5px;width:18px;height:18px;border-radius:5px;background:var(--flare);padding:3px 3.5px;flex:0 0 auto;">' +
        bar(5) + bar(9) + bar(7) + '</span>';
      scenEl.innerHTML =
        '<div style="' + eyebrow + 'display:flex;align-items:center;gap:8px;margin-bottom:10px;">' + chartIcon + '<span>Scenario</span></div>' +
        // Full-width segmented switch: three peers, so they divide the card evenly rather than
        // sizing to their own labels.
        '<div style="display:flex;border:1px solid var(--border2);border-radius:999px;overflow:hidden;">' +
        opts.map((o) => '<button data-scen="' + o[0] + '" style="flex:1 1 0;padding:8px 4px;border:none;cursor:pointer;' + mono + 'font-size:13px;background:' + (S.scenario === o[0] ? 'var(--accent)' : 'transparent') + ';color:' + (S.scenario === o[0] ? 'var(--accent-ink)' : 'var(--muted)') + ';">' + o[1] + '</button>').join('') + '</div>' +
        '<div style="' + mono + 'font-size:12px;line-height:1.5;color:var(--muted2);margin-top:10px;min-height:36px;">' + hint + '</div>';
    }
    function renderFilters() {
      filtersEl.innerHTML = chipGroup('Facility', D.facilities, S.fac, 'fac', false) + chipGroup('Payer mix', D.payers, S.pay, 'pay', true) + chipGroup('Service line', D.serviceLines, S.svc, 'svc', true);
    }
    function renderCharts() {
      if (!S.fac.length || !S.pay.length || !S.svc.length) {
        chartsEl.innerHTML = '<div style="border:1px dashed var(--border2);border-radius:16px;padding:48px 24px;text-align:center;"><div style="font-family:\'IBM Plex Mono\',monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--flare);margin-bottom:10px;">No data</div><div style="font-size:20px;font-weight:600;margin-bottom:6px;">Pick at least one option in each filter</div><div style="color:var(--muted);">Use the chips above to bring data back into view.</div></div>';
        return;
      }
      const f = compute(S.fac, S.pay, S.svc);
      const m = SCEN[S.scenario];
      const kIncome = Math.round(f.income * m.income);
      const kAR = Math.min(0.85, f.openARpct * m.ar);
      const kDen = Math.min(0.95, f.denials.overallRate * m.denialRate);
      const incAdj = f.incomeMonthly.map((v) => Math.round(v * m.income));
      const arAdj = f.arAging.map((a) => ({ bucket: a.bucket, amount: Math.round(a.amount * m.ar) }));
      const st = S.scenario === 'stressed';

      const kpiRow = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">' +
        kpiTile('Visits', fmtN(f.visits), '', 3.2) +
        kpiTile('Income', fmtM(kIncome), 'accent', st ? -8.4 : 5.1) +
        kpiTile('Billed', fmtM(f.billed), '', 2.4) +
        kpiTile('Open A/R', fmtPct(kAR, 1), '', st ? 6.2 : -1.4, true) +
        kpiTile('Denial rate', fmtPct(kDen, 1), '', st ? 4.5 : -0.8, true) + '</div>';

      const ibMeta = dot('var(--billed)') + 'Billed' + '<span style="margin:0 6px;">' + dot('var(--income)', true) + 'Income</span>' + '<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:15px;border-top:1.5px dashed var(--muted);display:inline-block;"></span>Prior-yr avg</span>';
      const cIB = card('Revenue trend', 'Income vs Billed, monthly', ibMeta, chartIB(incAdj, f.billedMonthly, 1320000));

      const cSvc = card('Service line performance', 'Utilization &amp; yield by service line', 'Bar = revenue, pill = NCR', f.serviceLineRows.length ? serviceLineChart(f.serviceLineRows) : '<div style="color:var(--muted);font-size:14px;">No service lines selected.</div>');

      const visTotal = f.visitsDonut.reduce((a, b) => a + b.v, 0) || 1;
      const visLegend = legendRows(f.visitsDonut.map((d, i) => ({ k: d.k, color: rampAt(i, f.visitsDonut.length), val: fmtN(d.v) })));
      const visSegs = f.visitsDonut.map((d, i) => ({ pct: d.v / visTotal, color: rampAt(i, f.visitsDonut.length), k: d.k, val: fmtN(d.v) }));
      const denPay = f.denialsByPayer;
      const denSegs = denPay.map((d, i) => ({ pct: d.v / (f.denByPayTotal || 1), color: rampAt(i, denPay.length), k: d.k, val: fmtN(d.v) }));
      const denLegend = legendRows(denPay.map((d, i) => ({ k: d.k, color: rampAt(i, denPay.length), val: fmtN(d.v) })));
      const dist = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">' +
        '<div><div style="font-size:13px;color:var(--muted);margin-bottom:12px;text-align:center;">Visits by facility</div>' + donut(visSegs, fmtN(f.visits), 'Visits') + visLegend + '</div>' +
        '<div><div style="font-size:13px;color:var(--muted);margin-bottom:12px;text-align:center;">Denials issued by payer</div>' + (denPay.length ? donut(denSegs, fmtN(Math.round(f.denByPayTotal * (f.slice || 1))), 'Denials') + denLegend : '<div style="color:var(--muted);font-size:14px;text-align:center;padding-top:40px;">No payers selected.</div>') + '</div></div>';
      const cDist = card('Distribution', 'Volume &amp; denials by counterparty', 'Excludes contractual CARCs (45, 59, 253)', dist);

      const woMeta = S.svc.map((s) => dot(PAL_SVC[s]) + s).join(' ');
      const cWO = card('Operational losses', 'Average write-off by facility &amp; service line', woMeta, f.writeOffRows.length ? stackedWriteoff(f.writeOffRows, S.svc) : '<div style="color:var(--muted);font-size:14px;">No facilities match.</div>');

      const denRingBody = '<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:center;">' + nestedRing(kDen, f.denials.distByCPT, f.denials.distByEncounter) +
        '<div style="display:flex;gap:28px;">' +
        '<div><div style="font-size:26px;font-weight:600;color:var(--flare);letter-spacing:-.01em;">' + fmtN(f.denials.issued) + '</div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;color:var(--muted2);">DENIALS ISSUED</div></div>' +
        '<div><div style="font-size:26px;font-weight:600;letter-spacing:-.01em;">' + fmtN(f.denials.affected) + '</div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;color:var(--muted2);">CLAIMS AFFECTED</div></div>' +
        '</div></div>';
      const cDen = card('Quality', 'Denial summary', 'Outer: encounter, middle: CPT, center: overall', denRingBody);

      const cPay = card('Payer performance', 'Revenue by payer', 'Hover a bar for detail', f.payersFiltered.length ? payerBars(f.payersFiltered, f.payerMix) : '<div style="color:var(--muted);font-size:14px;">No payers selected.</div>');

      const arFoot = '<p style="margin-top:12px;font-size:13px;color:var(--muted);">' + fmtPct(arAdj[arAdj.length - 1].amount / (arAdj.reduce((a, b) => a + b.amount, 0) || 1), 0) + ' of A/R is over 90 days; escalation candidate.</p>';
      const cAR = card('Cash flow risk', 'A/R aging buckets', '', arBars(arAdj) + arFoot);

      chartsEl.innerHTML = kpiRow + cIB + cSvc + cDist + cWO + cDen + cPay + cAR;
    }

    function renderAll() { renderScenario(); renderFilters(); renderCharts(); }
    renderAll();

    function onClick(ev) {
      const chip = ev.target.closest('[data-chip]');
      const act = ev.target.closest('[data-act]');
      const scen = ev.target.closest('[data-scen]');
      if (scen) { S.scenario = scen.getAttribute('data-scen'); renderScenario(); renderCharts(); return; }
      // renderScenario redraws the share-shown figure in the hero card, so every filter change
      // has to re-run it or the percentage goes stale against the chips that produced it.
      if (chip) { const k = chip.getAttribute('data-chip'), v = chip.getAttribute('data-val'); const arr = S[k]; const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); renderScenario(); renderFilters(); renderCharts(); return; }
      if (act) { const k = act.getAttribute('data-key'), a = act.getAttribute('data-act'); S[k] = a === 'all' ? (k === 'fac' ? D.facilities.slice() : k === 'pay' ? D.payers.slice() : D.serviceLines.slice()) : []; renderScenario(); renderFilters(); renderCharts(); return; }
    }
    root.addEventListener('click', onClick);

    /* Ring hover is delegated on root so it survives the wholesale innerHTML
       re-render that every filter change triggers. */
    function nrText(svg, key) { return svg.querySelector('[data-nr="' + key + '"]'); }
    function nrReset(svg) {
      const all = svg.querySelectorAll('path[data-ring]');
      for (let i = 0; i < all.length; i++) all[i].style.opacity = '1';
      const wrap = svg.parentNode;
      const n = nrText(svg, 'num'), l = nrText(svg, 'label'), b = nrText(svg, 'sub');
      if (n && wrap) n.textContent = wrap.getAttribute('data-nr-default') || '';
      if (l) l.textContent = 'claims with denial codes';
      if (b) b.textContent = '';
    }
    root.addEventListener('mouseover', function (ev) {
      const t = ev.target;
      const p = t && t.closest ? t.closest('path[data-ring]') : null;
      if (!p) return;
      const svg = p.ownerSVGElement; if (!svg) return;
      const all = svg.querySelectorAll('path[data-ring]');
      for (let i = 0; i < all.length; i++) all[i].style.opacity = (all[i] === p) ? '1' : '.32';
      const n = nrText(svg, 'num'), l = nrText(svg, 'label'), b = nrText(svg, 'sub');
      if (n) n.textContent = p.getAttribute('data-ring') === 'ovr'
        ? fmtPct(parseFloat(p.getAttribute('data-val')), 1)
        : fmtPct(parseFloat(p.getAttribute('data-pct')), 0);
      if (l) { const k = p.getAttribute('data-k') || ''; l.textContent = k.length > 22 ? k.slice(0, 22) + '\u2026' : k; }
      if (b) b.textContent = p.getAttribute('data-sub') || '';
    });
    root.addEventListener('mouseout', function (ev) {
      const t = ev.target;
      const p = t && t.closest ? t.closest('path[data-ring]') : null;
      if (!p) return;
      const rel = ev.relatedTarget;
      if (rel && rel.closest && rel.closest('path[data-ring]')) return;
      const svg = p.ownerSVGElement; if (svg) nrReset(svg);
    });

    /* Same contract for the two distribution donuts: a slice names itself and its
       value in the center, and the center falls back to the total on exit. */
    function dnReset(svg) {
      const all = svg.querySelectorAll('path[data-dn-slice]');
      for (let i = 0; i < all.length; i++) all[i].style.opacity = '1';
      const wrap = svg.parentNode;
      const n = svg.querySelector('[data-dn="num"]'), l = svg.querySelector('[data-dn="label"]');
      if (n && wrap) n.textContent = wrap.getAttribute('data-dn-main') || '';
      if (l && wrap) l.textContent = wrap.getAttribute('data-dn-sub') || '';
    }
    root.addEventListener('mouseover', function (ev) {
      const t = ev.target;
      const p = t && t.closest ? t.closest('path[data-dn-slice]') : null;
      if (!p) return;
      const svg = p.ownerSVGElement; if (!svg) return;
      const all = svg.querySelectorAll('path[data-dn-slice]');
      for (let i = 0; i < all.length; i++) all[i].style.opacity = (all[i] === p) ? '1' : '.32';
      const n = svg.querySelector('[data-dn="num"]'), l = svg.querySelector('[data-dn="label"]');
      if (n) n.textContent = p.getAttribute('data-v') || '';
      if (l) { const k = p.getAttribute('data-k') || ''; l.textContent = (k.length > 18 ? k.slice(0, 18) + '…' : k) + '  ' + p.getAttribute('data-pct') + '%'; }
    });
    root.addEventListener('mouseout', function (ev) {
      const t = ev.target;
      const p = t && t.closest ? t.closest('path[data-dn-slice]') : null;
      if (!p) return;
      const rel = ev.relatedTarget;
      if (rel && rel.closest && rel.closest('path[data-dn-slice]')) return;
      const svg = p.ownerSVGElement; if (svg) dnReset(svg);
    });

    /* Income vs Billed: the whole month column is the target, and the readout
       carries both series at once, which a per-mark tooltip could not do. */
    function ibReset(svg) {
      svg.querySelectorAll('[data-ib-bar]').forEach(function (b) { b.style.opacity = '1'; });
      svg.querySelectorAll('[data-ib-dot]').forEach(function (d) { d.setAttribute('r', '3'); });
      svg.querySelectorAll('[data-ib="bval"],[data-ib="ival"]').forEach(function (t) { t.textContent = ''; });
    }
    root.addEventListener('mouseover', function (ev) {
      const t = ev.target;
      const hit = t && t.closest ? t.closest('rect[data-ib-hit]') : null;
      if (!hit) return;
      const svg = hit.ownerSVGElement; if (!svg) return;
      const i = hit.getAttribute('data-ib-hit');
      svg.querySelectorAll('[data-ib-bar]').forEach(function (b) {
        b.style.opacity = b.getAttribute('data-ib-bar') === i ? '1' : '.4';
      });
      svg.querySelectorAll('[data-ib-dot]').forEach(function (d) {
        d.setAttribute('r', d.getAttribute('data-ib-dot') === i ? '5' : '3');
      });
      const bv = svg.querySelector('[data-ib="bval"]'), iv = svg.querySelector('[data-ib="ival"]');
      const cx = hit.getAttribute('data-cx');
      if (bv) { bv.setAttribute('x', cx); bv.setAttribute('y', (parseFloat(hit.getAttribute('data-by')) - 6).toFixed(1)); bv.textContent = hit.getAttribute('data-b'); }
      if (iv) { iv.setAttribute('x', cx); iv.setAttribute('y', hit.getAttribute('data-iy')); iv.textContent = hit.getAttribute('data-i'); }
    });
    root.addEventListener('mouseout', function (ev) {
      const t = ev.target;
      const hit = t && t.closest ? t.closest('rect[data-ib-hit]') : null;
      if (!hit) return;
      const rel = ev.relatedTarget;
      if (rel && rel.closest && rel.closest('rect[data-ib-hit]')) return;
      const svg = hit.ownerSVGElement; if (svg) ibReset(svg);
    });

    // The scenario card can live in the page hero, outside root, so its buttons need their own
    // listener; without it the switch renders but nothing responds to a click.
    if (scenEl && !root.contains(scenEl)) scenEl.addEventListener('click', onClick);
  };
})();

/* rcm-dash.js — faithful 1A-styled port of the huy.gg RCM dashboard.
   Reads window.RCM_DATA (copied from the repo). Vanilla JS; colors via CSS vars
   inherited from #home-root so it recolors with the site's dark/light theme. */
(function () {
  const D = window.RCM_DATA;
  if (!D) return;

  const MON = D.months;
  const PAL_FAC = ['#C04000', '#FF6A2B', '#E8935C', '#8b6f47', '#6b7c50'];
  const PAL_PAY = ['#C04000', '#E8935C', '#a3532a', '#FF6A2B', '#7a8754', '#a36a3c', '#6b7c50', '#b07650'];
  const PAL_SVC = { 'Behavioral': '#8b6f47', 'Integrated': '#C04000', 'Medical': '#6b7c50' };

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
      '<div style="font-size:24px;font-weight:600;letter-spacing:-.01em;color:' + (accent === 'green' ? 'var(--flare)' : 'var(--text)') + ';">' + value + '</div>' +
      '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;margin-top:5px;color:' + (good ? '#6b9e5e' : '#d1704a') + ';">' + (up ? '▲' : '▼') + ' ' + Math.abs(trend).toFixed(1) + '%</div></div>';
  }

  function chartIB(income, billed, benchmark) {
    const W = 720, H = 240, pl = 8, pr = 8, pt = 16, pb = 26, cH = H - pt - pb, cW = W - pl - pr;
    const gw = cW / 12, bw = Math.min(30, gw * 0.5);
    const maxS = Math.max(Math.max.apply(null, billed), benchmark || 0) * 1.12 || 1;
    let bars = '', line = '', dots = '', labels = '';
    billed.forEach((v, i) => {
      const cx = pl + i * gw + gw / 2, h = (v / maxS) * cH, y = pt + cH - h;
      bars += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" rx="3" style="fill:var(--text);opacity:.24;"><title>' + MON[i] + ' billed ' + fmtM(v) + '</title></rect>';
      const iy = pt + cH - (income[i] / maxS) * cH;
      line += (i === 0 ? 'M' : 'L') + cx.toFixed(1) + ' ' + iy.toFixed(1) + ' ';
      dots += '<circle cx="' + cx.toFixed(1) + '" cy="' + iy.toFixed(1) + '" r="3" style="fill:var(--flare);"><title>' + MON[i] + ' income ' + fmtM(income[i]) + '</title></circle>';
      labels += '<text x="' + cx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" style="fill:var(--muted2);font-family:\'IBM Plex Mono\',monospace;font-size:10px;">' + MON[i] + '</text>';
    });
    let bench = '';
    if (benchmark) {
      const by = pt + cH - (benchmark / maxS) * cH;
      bench = '<line x1="' + pl + '" y1="' + by.toFixed(1) + '" x2="' + (W - pr) + '" y2="' + by.toFixed(1) + '" style="stroke:var(--muted);stroke-width:1.5;stroke-dasharray:5 4;opacity:.8;"></line>' +
        '<text x="' + (W - pr) + '" y="' + (by - 6).toFixed(1) + '" text-anchor="end" style="fill:var(--muted2);font-family:\'IBM Plex Mono\',monospace;font-size:10px;">Prior-yr avg $' + (benchmark / 1e6).toFixed(2) + 'M</text>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;overflow:visible;">' + bars + bench +
      '<path d="' + line + '" fill="none" style="stroke:var(--flare);stroke-width:2.5;"></path>' + dots + labels + '</svg>';
  }

  function donut(segs, centerMain, centerSub) {
    let acc = 0; const stops = segs.map((s) => { const a = acc; acc += s.pct; return s.color + ' ' + (a * 100).toFixed(2) + '% ' + (acc * 100).toFixed(2) + '%'; }).join(', ');
    return '<div style="position:relative;width:204px;height:204px;border-radius:50%;background:conic-gradient(' + stops + ');margin:0 auto;">' +
      '<div style="position:absolute;inset:40px;border-radius:50%;background:var(--panel);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">' +
      '<div style="font-size:28px;font-weight:600;letter-spacing:-.01em;">' + centerMain + '</div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:var(--muted2);">' + centerSub + '</div></div></div>';
  }
  function legendRows(items) {
    return '<div style="display:flex;flex-direction:column;gap:6px;margin-top:14px;">' + items.map((it) =>
      '<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);">' + dot(it.color) + it.k + '<span style="margin-left:auto;color:var(--text);font-family:\'IBM Plex Mono\',monospace;">' + it.val + '</span></div>').join('') + '</div>';
  }

  function nestedRing(overall, byCPT, byEnc) {
    const cx = 80, cy = 80;
    function ring(r, sw, segs, pal) {
      const C = 2 * Math.PI * r; let acc = 0, out = '';
      segs.forEach((s, i) => {
        const len = s.v * C, off = -acc * C;
        out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + pal[i % pal.length] + '" stroke-width="' + sw + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"><title>' + s.k + ' ' + fmtPct(s.v, 0) + '</title></circle>';
        acc += s.v;
      });
      return out;
    }
    const encPal = ['#C04000', '#E8935C', '#8b6f47', '#6b7c50', 'var(--track)'];
    const cptPal = ['#FF6A2B', '#E8935C', '#a3532a', '#b07650', 'var(--track)'];
    const overallC = 2 * Math.PI * 22;
    const svg = '<svg viewBox="0 0 160 160" style="width:160px;height:160px;">' +
      ring(64, 15, byEnc, encPal) + ring(44, 15, byCPT, cptPal) +
      '<circle cx="80" cy="80" r="22" fill="none" stroke="var(--track)" stroke-width="13"></circle>' +
      '<circle cx="80" cy="80" r="22" fill="none" stroke="#C04000" stroke-width="13" stroke-dasharray="' + (overall * overallC).toFixed(2) + ' ' + overallC.toFixed(2) + '" transform="rotate(-90 80 80)"></circle>' +
      '<text x="80" y="77" text-anchor="middle" style="fill:var(--text);font-size:17px;font-weight:600;">' + fmtPct(overall, 0) + '</text>' +
      '<text x="80" y="91" text-anchor="middle" style="fill:var(--muted2);font-family:\'IBM Plex Mono\',monospace;font-size:8px;">DENIAL</text></svg>';
    return svg;
  }

  function stackedWriteoff(rows, svc) {
    const totals = rows.map((r) => svc.reduce((a, s) => a + (r[s] || 0), 0));
    const max = Math.max.apply(null, totals) || 1;
    return '<div style="display:flex;flex-direction:column;gap:12px;">' + rows.map((r, ri) => {
      const total = totals[ri];
      const segs = svc.map((s) => { const v = r[s] || 0; return v > 0 ? '<div title="' + s + ': $' + fmtN(v) + '" style="width:' + (v / max * 100) + '%;background:' + PAL_SVC[s] + ';display:flex;align-items:center;justify-content:center;font-size:10.5px;color:#0b0d12;font-weight:600;overflow:hidden;white-space:nowrap;">' + (v >= max * 0.09 ? '$' + fmtN(v) : '') + '</div>' : ''; }).join('');
      return '<div style="display:grid;grid-template-columns:92px 1fr 84px;gap:12px;align-items:center;">' +
        '<div style="font-size:13px;color:var(--text);">' + r.label + '</div>' +
        '<div style="display:flex;height:26px;border-radius:6px;overflow:hidden;background:var(--track);">' + segs + '</div>' +
        '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:12px;color:var(--muted);text-align:right;">$' + fmtN(total) + '</div></div>';
    }).join('') + '</div>';
  }

  function payerBars(payers, mix) {
    const vals = payers.map((p) => (mix[p] || {}).revenue || 0);
    const max = Math.max.apply(null, vals) || 1;
    return '<div style="display:flex;flex-direction:column;gap:10px;">' + payers.map((p, i) => {
      const m = mix[p] || {}; const v = m.revenue || 0;
      return '<div title="' + p + ': ' + fmtM(v) + ', denial ' + fmtPct(m.denialRate || 0, 1) + '">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:4px;"><span>' + p + '</span><span style="color:var(--text);font-family:\'IBM Plex Mono\',monospace;">' + fmtM(v) + '</span></div>' +
        '<div style="height:9px;border-radius:5px;background:var(--track);overflow:hidden;"><div style="height:100%;width:' + (v / max * 100).toFixed(1) + '%;background:' + PAL_PAY[i % PAL_PAY.length] + ';border-radius:5px;"></div></div></div>';
    }).join('') + '</div>';
  }

  function arBars(aging) {
    const max = Math.max.apply(null, aging.map((a) => a.amount)) || 1;
    return '<div style="display:flex;align-items:flex-end;gap:12px;height:170px;padding-top:10px;">' + aging.map((a) => {
      const h = (a.amount / max) * 130;
      const over = a.bucket === '120+' || a.bucket === '91-120';
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;justify-content:flex-end;height:100%;">' +
        '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;color:var(--muted);">$' + (a.amount / 1e6).toFixed(1) + 'M</div>' +
        '<div title="' + a.bucket + ' days: $' + fmtN(a.amount) + '" style="width:100%;max-width:54px;height:' + h.toFixed(1) + 'px;border-radius:6px 6px 0 0;background:' + (over ? '#C04000' : 'var(--flare)') + ';opacity:' + (over ? 1 : 0.55) + ';"></div>' +
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
      const opts = [['healthy', 'Healthy'], ['baseline', 'Baseline'], ['stressed', 'Stressed']];
      // Baseline carries no hint: the two adjusted scenarios describe how they differ from it,
      // so labelling the unadjusted case restates the word already on its own button.
      const hint = { healthy: '+12% income, fewer denials, faster A/R', baseline: 'Every figure below is the ledger unadjusted.', stressed: '−14% income, denials spike, A/R extends' }[S.scenario];
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
        '<div style="' + mono + 'font-size:12px;line-height:1.5;color:var(--muted2);margin-top:10px;min-height:36px;">' + hint + '</div>' +
        // The share-shown figure answers the filters rather than setting them, so it closes the
        // card under a rule instead of sitting among the chips it reports on.
        // Figure and label share a baseline so they read as one phrase, while keeping the size
        // and case difference that marks which half is the measurement.
        '<div style="border-top:1px solid var(--border);margin-top:14px;padding-top:14px;display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;">' +
        '<span style="' + mono + 'font-size:34px;font-weight:600;line-height:1;color:var(--flare);">' + Math.round(compute(S.fac, S.pay, S.svc).slice * 100) + '%</span>' +
        '<span style="' + eyebrow + '">of dataset shown</span></div>';
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
        kpiTile('Income', fmtM(kIncome), 'green', st ? -8.4 : 5.1) +
        kpiTile('Billed', fmtM(f.billed), '', 2.4) +
        kpiTile('Open A/R', fmtPct(kAR, 1), '', st ? 6.2 : -1.4, true) +
        kpiTile('Denial rate', fmtPct(kDen, 1), '', st ? 4.5 : -0.8, true) + '</div>';

      const ibMeta = dot('var(--text)') + 'Billed' + '<span style="margin:0 6px;">' + dot('var(--flare)', true) + 'Income</span>' + '<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:15px;border-top:1.5px dashed var(--muted);display:inline-block;"></span>Prior-yr avg</span>';
      const cIB = card('Revenue trend', 'Income vs Billed, monthly', ibMeta, chartIB(incAdj, f.billedMonthly, 1320000));

      const cSvc = card('Service line performance', 'Utilization &amp; yield by service line', 'Bar = revenue, pill = NCR', f.serviceLineRows.length ? serviceLineChart(f.serviceLineRows) : '<div style="color:var(--muted);font-size:14px;">No service lines selected.</div>');

      const visLegend = legendRows(f.visitsDonut.map((d, i) => ({ k: d.k, color: PAL_FAC[i % PAL_FAC.length], val: fmtN(d.v) })));
      const visSegs = f.visitsDonut.map((d, i) => ({ pct: d.v / (f.visitsDonut.reduce((a, b) => a + b.v, 0) || 1), color: PAL_FAC[i % PAL_FAC.length] }));
      const denPay = f.denialsByPayer;
      const denSegs = denPay.map((d, i) => ({ pct: d.v / (f.denByPayTotal || 1), color: PAL_PAY[i % PAL_PAY.length] }));
      const denLegend = legendRows(denPay.map((d, i) => ({ k: d.k, color: PAL_PAY[i % PAL_PAY.length], val: fmtN(d.v) })));
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
    // The scenario card can live in the page hero, outside root, so its buttons need their own
    // listener; without it the switch renders but nothing responds to a click.
    if (scenEl && !root.contains(scenEl)) scenEl.addEventListener('click', onClick);
  };
})();

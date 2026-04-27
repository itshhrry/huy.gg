/* eslint-disable no-undef */
/* resume-render.js — renders the four resume panels from RESUME_DATA.
   Each panel = experience entries filtered by tab + that tab's skills.
   Education + Volunteer are shared across every panel. */

(function () {
  const data = window.RESUME_DATA;
  if (!data) return;

  /* helpers ─────────────────────────────────────────── */

  function el(tag, opts = {}, children = []) {
    const node = document.createElement(tag);
    if (opts.cls) node.className = opts.cls;
    if (opts.html != null) node.innerHTML = opts.html;
    else if (opts.text != null) node.textContent = opts.text;
    if (opts.attrs) {
      for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
    }
    if (opts.style) {
      for (const [k, v] of Object.entries(opts.style)) node.style[k] = v;
    }
    children.forEach(c => c && node.appendChild(c));
    return node;
  }

  /* experience entry ─────────────────────────────────── */
  function renderEntry(job, tabId) {
    const visibleBullets = job.bullets.filter(b => b.tabs.includes(tabId));
    if (visibleBullets.length === 0) return null;

    const dateBlock = el("div", {
      cls: "r-entry-date",
      html: `${job.dates}<span>${job.location}</span>`,
    });

    const title = el("h3", { cls: "r-entry-title", text: job.title });
    const org = el("div", { cls: "r-entry-org", text: job.org });

    const ul = el("ul", { cls: "r-bullets" });
    visibleBullets.forEach(b => {
      ul.appendChild(el("li", { html: b.text }));
    });

    const right = el("div", {}, [title, org, ul]);
    return el("div", { cls: "r-entry" }, [dateBlock, right]);
  }

  /* skills section ───────────────────────────────────── */
  function renderSkillSection(section) {
    const head = el("span", { cls: "r-side-head", text: section.title });
    const chipsWrap = el("div", { cls: "r-chips" });
    section.chips.forEach(c => {
      chipsWrap.appendChild(
        el("span", {
          cls: section.muted ? "r-chip r-chip-muted" : "r-chip",
          text: c,
        })
      );
    });
    return el("div", { cls: "r-side-section" }, [head, chipsWrap]);
  }

  /* education section ────────────────────────────────── */
  function renderEducation() {
    const head = el("span", { cls: "r-side-head", text: "Education & Certifications" });
    const items = data.education.map(edu => {
      const strong = el("strong", { text: edu.suffix ? `${edu.degree} ${edu.suffix}` : edu.degree });
      const span = el("span", { text: edu.school });
      return el("div", { cls: "r-edu-item" }, [strong, span]);
    });
    return el("div", { cls: "r-side-section" }, [head, ...items]);
  }

  /* volunteer section ────────────────────────────────── */
  function renderVolunteer() {
    const head = el("span", { cls: "r-side-head", text: "Volunteer" });
    const items = data.volunteer.map(v => {
      const strong = el("strong", { text: v.title });
      const orgLine = el("span", { text: `${v.org} · ${v.dates}` });
      const blurb = el("p", { cls: "r-vol-blurb", text: v.blurb });
      return el("div", { cls: "r-edu-item r-vol-item" }, [strong, orgLine, blurb]);
    });
    return el("div", { cls: "r-side-section" }, [head, ...items]);
  }

  /* one full panel ───────────────────────────────────── */
  function renderPanel(tab) {
    const isFirst = data.tabs[0].id === tab.id;
    const panel = el("div", {
      cls: "r-panel" + (isFirst ? " active" : ""),
      attrs: { id: `panel-${tab.id}`, role: "tabpanel", "aria-labelledby": `tab-${tab.id}` },
    });

    /* main column */
    const sectionHead = el("div", { cls: "r-section-head" }, [
      el("h2", { text: "Experience" }),
      el("span", { cls: "r-section-rule" }),
    ]);

    const focusNote = el("span", { cls: "r-focus-note", text: tab.note });

    const entries = el("div", { cls: "r-entries" });
    // Order: priority list first (in given order), then any remaining jobs in chronological (data) order.
    const priority = tab.priority || [];
    const byId = Object.fromEntries(data.experience.map(j => [j.id, j]));
    const ordered = [];
    priority.forEach(id => { if (byId[id]) ordered.push(byId[id]); });
    data.experience.forEach(j => { if (!priority.includes(j.id)) ordered.push(j); });

    ordered.forEach(job => {
      const entry = renderEntry(job, tab.id);
      if (entry) entries.appendChild(entry);
    });

    const section = el("div", { cls: "r-section" }, [sectionHead, focusNote, entries]);
    const main = el("div", { cls: "r-main" }, [section]);

    /* side column */
    const side = el("aside", { cls: "r-side" });
    side.appendChild(renderEducation());
    (data.skills[tab.id] || []).forEach(s => side.appendChild(renderSkillSection(s)));
    side.appendChild(renderVolunteer());

    /* assemble */
    const page = el("div", { cls: "r-page" }, [main, side]);
    panel.appendChild(page);
    return panel;
  }

  /* tab strip ────────────────────────────────────────── */
  function renderTabs() {
    const wrap = el("div", { cls: "resume-tabs", attrs: { role: "tablist", "aria-label": "Resume views" } });
    data.tabs.forEach((tab, i) => {
      const btn = el("button", {
        cls: "resume-tab" + (i === 0 ? " active" : ""),
        attrs: {
          role: "tab",
          "aria-selected": i === 0 ? "true" : "false",
          "aria-controls": `panel-${tab.id}`,
          id: `tab-${tab.id}`,
        },
      });
      btn.appendChild(el("span", { cls: "resume-tab-label", text: tab.label }));
      btn.appendChild(el("span", { cls: "resume-tab-sub", text: tab.sub }));
      btn.addEventListener("click", () => switchTab(tab.id));
      wrap.appendChild(btn);
    });
    return wrap;
  }

  /* tab switcher (global so existing onclick won't break) */
  window.switchTab = function (id) {
    document.querySelectorAll(".resume-tab").forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".r-panel").forEach(p => p.classList.remove("active"));
    const t = document.getElementById(`tab-${id}`);
    const p = document.getElementById(`panel-${id}`);
    if (t) { t.classList.add("active"); t.setAttribute("aria-selected", "true"); }
    if (p) p.classList.add("active");
  };

  /* mount ────────────────────────────────────────────── */
  function mount() {
    const tabsHost = document.getElementById("resume-tabs-host");
    const panelsHost = document.getElementById("resume-panels-host");
    if (!tabsHost || !panelsHost) return;

    tabsHost.innerHTML = "";
    panelsHost.innerHTML = "";

    tabsHost.appendChild(renderTabs());
    data.tabs.forEach(tab => panelsHost.appendChild(renderPanel(tab)));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();

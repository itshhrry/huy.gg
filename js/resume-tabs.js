/* Resume audience tabs. The dataset and the per-bullet tab tagging come from the
   previous build unchanged; only the rendering is rewritten for ink, so nothing
   is a pill, nothing is an accent hue, and the two faces stay serif and mono. */
(function () {
  const DATA = {
        tabs: [
          { id: 'operations', note: 'For operations management and program leadership roles.' },
          { id: 'revenue', note: 'For revenue cycle, denial management, and billing roles.' },
          { id: 'analyst', note: 'For data analyst, BI analyst, and business analyst roles.' }
        ],
        experience: [
          { id: 'creekside', title: 'Revenue Cycle Manager', org: 'Creekside Physical Medicine', location: 'Boulder, CO', dates: 'May to Dec 2025', bullets: [
            { t: 'Built an RCM dashboard tracking net and gross collection rate trends, denial root causes, payer reimbursement variance, and A/R aging, then worked the backlog it exposed down <strong>35%</strong>.', tabs: ['analyst', 'revenue'] },
            { t: 'Audited <strong>2,989 denied claims</strong> against payer-specific denial patterns (CO-97, CO-4), surfacing <strong>charge capture gaps</strong> in nerve block and injection administration (64405, 96372 plus J-code combinations) and coding variances corrected through modifier adjustments, reducing repeat denials on the same code families.', tabs: ['analyst', 'operations', 'revenue'] },
            { t: 'Standardized NDC documentation through the CMS portal for reconsideration submissions, <strong>recovering reimbursement</strong> on claims previously written off as denied.', tabs: ['operations', 'revenue'] },
            { t: '<strong>Stopped recurring denials</strong> by implementing billing-to-servicing provider validation rules (BCBS), standardizing Box 19 CMS-1500 NDC documentation (UHC), and resolving X12/837P EHR-to-clearinghouse transmission errors.', tabs: ['revenue'] },
            { t: 'Owned end-to-end RCM operations: registration, eligibility verification, charge capture, payment posting, denial management, appeals, and A/R reporting.', tabs: ['revenue', 'operations'] },
            { t: 'Led full EHR migration from InSync to Athena, coordinating workflow continuity across billing, clinical, and administrative teams through cutover and go-live.', tabs: ['operations', 'revenue'] },
            { t: 'Designed analytical reporting workflows to surface payer behavior patterns and denial concentration by provider, CPT, and payer.', tabs: ['analyst'] }
          ] },
          { id: 'trumpet', title: 'Operations Supervisor', org: 'Trumpet Behavioral Health', location: 'Aurora, CO', dates: 'Jul 2024 to Apr 2025', bullets: [
            { t: 'Managed front-office operations and staff scheduling for a <strong>13-person team</strong> serving 7 severe behavioral health clients.', tabs: ['operations'] },
            { t: 'Oversaw intake documentation, prior authorization tracking, and compliance record management to ensure billing accuracy and <strong>maintained financial performance goals</strong>.', tabs: ['operations', 'revenue'] },
            { t: 'Maintained facility safety compliance, vendor relationships, and supply inventory readiness; supported payroll accuracy through documentation audits and coding corrections.', tabs: ['operations', 'revenue'] }
          ] },
          { id: 'oracle', title: 'Integrated Device Consultant', org: 'Oracle Health', location: 'Remote / Travel', dates: 'Aug 2022 to Jun 2023', bullets: [
            { t: 'Deployed medical device integrations into the Oracle Health CareAware MDI platform across multiple client sites, cutting manual data entry at the point of care.', tabs: ['operations'] },
            { t: 'Resolved HL7 interface and transmission errors, cutting roughly <strong>4 days</strong> from each go-live timeline.', tabs: ['operations'] },
            { t: 'Aligned integration workflows with clinical, IT, and regulatory requirements, delivering every site on schedule with <strong>zero critical post-go-live failures</strong>.', tabs: ['operations'] }
          ] },
          { id: 'auc', title: 'Regional Operations Manager', org: 'Advanced Urgent Care & Occupational Medicine', location: 'Brighton, CO', dates: 'Oct 2021 to Aug 2022', bullets: [
            { t: 'Drove <strong>$8M in revenue growth</strong> through predictive analytics on patient flow, service demand patterns, and revenue cycle performance, directly informing staffing strategy and operational planning.', tabs: ['analyst', 'operations', 'revenue'] },
            { t: 'Maintained <strong>100% employee retention</strong> across all managed locations and achieved <strong>net promoter scores of 89 to 93</strong> through investments in referral quality, patient experience, and staff development.', tabs: ['operations'] },
            { t: 'Served as IT project lead for EHR consolidation across <strong>14 clinics</strong>, overseeing Athena/Experity implementation, data migration, manual testing, and user acceptance validation with zero critical system failures.', tabs: ['analyst', 'operations'] },
            { t: 'Strengthened front-end eligibility verification and documentation workflows, reducing downstream claim denials and improving reimbursement turnaround time.', tabs: ['revenue'] }
          ] },
          { id: 'centura', unpaid: true, title: 'Data Analytics Intern', org: 'Centura Health', location: 'Denver, CO', dates: 'Nov 2019 to Mar 2021', bullets: [
            { t: 'Designed ETL pipelines in <strong>SQL</strong> integrating Epic, patient monitoring devices, and administrative systems into a single analysis layer.', tabs: ['analyst'] },
            { t: 'Built predictive models in <strong>Python</strong> forecasting patient admissions, resource utilization, and potential complications for COVID-19 surge planning.', tabs: ['analyst'] },
            { t: 'Delivered reporting and data visualizations using Power BI, Tableau, and SQL Server.', tabs: ['analyst'] }
          ] },
          { id: 'card', title: 'Operations Manager', org: 'Center for Autism and Related Disorders', location: 'Boulder, CO', dates: 'Nov 2019 to Oct 2020', bullets: [
            { t: 'Improved payer contract fulfillment rate from <strong>37% to 95%</strong> by restructuring documentation practices, CPT code validation workflows, and A/R follow-up processes.', tabs: ['analyst', 'operations', 'revenue'] },
            { t: 'Built KPI dashboards tracking therapy and supervision utilization, encounter profitability, and satisfaction scores.', tabs: ['analyst', 'operations'] },
            { t: 'Lifted patient and family satisfaction from <strong>56% to 89%</strong> while holding <strong>35% year-over-year growth</strong>.', tabs: ['operations', 'revenue'] }
          ] },
          { id: 'springwood', title: 'Business Intelligence Analyst', org: 'Springwood Retirement: Assisted Living & Memory Care', location: 'Arvada, CO', dates: 'Nov 2018 to Nov 2019', bullets: [
            { t: 'Built and maintained the recurring reports, dashboards, and queries operations and executive leadership used to track KPIs.', tabs: ['analyst', 'operations'] },
            { t: 'Ran cost-benefit analysis on <strong>labor cost per resident day</strong>, feeding staffing levels and resource allocation decisions.', tabs: ['analyst', 'operations'] },
            { t: 'Connected separate data systems and visualization tools into shared reporting, then tracked outcomes against the recommendations that came out of it.', tabs: ['analyst'] }
          ] }
        ],
        volunteer: [
          { title: 'Regional Communication & Engagement Lead', org: 'American Red Cross', location: 'Denver, CO', dates: 'Dec 2021 to Sep 2022', lines: ['Coordinated regional communications and stakeholder engagement for disaster relief operations across the Denver region.'] },
          { title: 'PACU Volunteer', org: 'St. Anthony Hospital', location: 'Lakewood, CO', dates: 'Feb to Aug 2017', lines: ['Supported patient care in post-anesthesia recovery, shadowing surgeons, LPNs, APRNs, and RNs across perioperative workflows.'] }
        ],
        skills: {
          analyst: [
            { title: 'Analytics Stack', chips: ['Python', 'pandas', 'NumPy', 'SQL', 'Power BI', 'Tableau', 'Excel', 'Power Query'] },
            { title: 'Analytical Skills', chips: ['KPI Design & Tracking', 'Deep Learning', 'Machine Learning', 'Cost-Benefit Analysis', 'Predictive Analytics', 'Financial Analysis', 'Dashboard Development', 'ETL Pipelines'] }
          ],
          operations: [
            { title: 'Operations & Process', chips: ['Workflow Optimization', 'SOP Development', 'Root Cause Analysis', 'Change Management', 'Capacity Planning', 'Onboarding', 'Cross-functional Collaboration'] },
            { title: 'System Admin', chips: ['EHR Implementations', 'System Migrations', 'Enterprise Integration', 'UAT', 'Vendor Management'] },
            { title: 'Software & Platforms', chips: ['Athena', 'Epic', 'Experity', 'InSync (Qualifacts)', 'Monday', 'Asana', 'Azara', 'Excel'] }
          ],
          revenue: [
            { title: 'Revenue Cycle', chips: ['Denial Management', 'ERA/EOB Reconciliation', 'Payment Posting', 'LCD/NCCI Compliance', 'Charge Capture', 'Prior Authorization', 'CMS-1500 / X12 837P', 'A/R Management'] },
            { title: 'Software & Platforms', chips: ['Athena', 'Epic', 'Experity', 'InSync (Qualifacts)', 'Azara', 'Excel', 'MySQL', 'MariaDB'] }
          ]
        }
      };

  const exp = document.getElementById('r-exp');
  const alt = document.getElementById('r-alt');
  const note = document.getElementById('r-note');
  const skills = document.getElementById('r-skills');
  const skillsLabel = document.getElementById('r-skills-label');
  const btns = [].slice.call(document.querySelectorAll('[data-tab]'));
  if (!exp || !btns.length) return;

  function entry(job, texts, last) {
    const li = texts.map(function (t) {
      return '<li>' + t.replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>') + '</li>';
    }).join('');
    const e = document.createElement('div');
    e.className = 'jobrow' + (last ? ' last' : '');
    e.innerHTML =
      '<div class="when">' + job.dates + '<span>' + job.location + '</span></div>' +
      '<div><h3>' + job.title + '</h3><div class="org">' + job.org + '</div>' +
      '<ul class="notes">' + li + '</ul></div>';
    return e;
  }

  function render(id) {
    const tab = DATA.tabs.filter(function (t) { return t.id === id; })[0] || {};
    const inTab = function (job) {
      return job.bullets.some(function (b) { return b.tabs.indexOf(id) >= 0; });
    };
    const paid = DATA.experience.filter(function (j) { return inTab(j) && !j.unpaid; });

    exp.innerHTML = '';
    paid.forEach(function (j, i) {
      const texts = j.bullets.filter(function (b) { return b.tabs.indexOf(id) >= 0; })
                             .map(function (b) { return b.t; });
      exp.appendChild(entry(j, texts, i === paid.length - 1));
    });

    if (alt) {
      alt.innerHTML = '';
      const rest = DATA.experience.filter(function (j) { return j.unpaid; })
        .map(function (j) { return { j: j, bs: j.bullets.map(function (b) { return b.t; }) }; })
        .concat(DATA.volunteer.map(function (v) { return { j: v, bs: v.lines }; }));
      rest.forEach(function (it, i) { alt.appendChild(entry(it.j, it.bs, i === rest.length - 1)); });
    }

    if (note) note.textContent = tab.note || '';

    // The skills margin label names the current tab rather than saying "the
    // selected role". That block sits roughly 2,860px below the tabs, so a
    // reader scrolling to it has no antecedent for "selected", and the label
    // read as dangling for the same reason a bare "this" would.
    if (skillsLabel) {
      const btn = btns.filter(function (b) { return b.dataset.tab === id; })[0];
      skillsLabel.textContent = 'skills for ' + (btn ? btn.textContent.trim() : id);
    }

    if (skills) {
      skills.innerHTML = '';
      (DATA.skills[id] || []).forEach(function (grp) {
        const g = document.createElement('div');
        g.className = 'skillgrp';
        g.innerHTML = '<div class="k tech">' + grp.title.toLowerCase() + '</div>' +
          '<ul class="notes">' + grp.chips.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>';
        skills.appendChild(g);
      });
    }

    btns.forEach(function (b) {
      const on = b.dataset.tab === id;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  }

  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { render(b.dataset.tab); });
    b.addEventListener('keydown', function (e) {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      let next = null;
      if (step) next = btns[(i + step + btns.length) % btns.length];
      else if (e.key === 'Home') next = btns[0];
      else if (e.key === 'End') next = btns[btns.length - 1];
      if (!next) return;
      e.preventDefault();
      render(next.dataset.tab);
      next.focus();
    });
  });

  render('operations');
})();

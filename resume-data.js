/* eslint-disable no-undef */
/* resume-data.js — single source of truth for the resume page.
   Each job has:
     - meta (title, org, location, dates)
     - bullets: { text, tabs[] } — tabs the bullet belongs to
   Each panel renders only the bullets tagged for it.

   Tab keys: "analyst" | "operations" | "revenue" | "sales"
*/

window.RESUME_DATA = {

  // ─────────────────────────────────────────────────────────
  //  CONTACT
  // ─────────────────────────────────────────────────────────
  contact: {
    name: "Harry Nguyen",
    location: "Denver, CO",
    phone: "(720) 272-2224",
    email: "h@huy.gg",
    site: "huy.gg",
  },

  // ─────────────────────────────────────────────────────────
  //  TABS
  //   priority: job IDs in relevance order for THIS tab.
  //   Renderer uses this order; jobs not listed fall through
  //   in their original (chronological) order at the bottom.
  // ─────────────────────────────────────────────────────────
  tabs: [
    {
      id: "analyst", label: "Analyst", sub: "Data & Business",
      note: "For data analyst, BI analyst, and business analyst roles.",
      priority: ["centura", "springwood", "creekside", "card", "auc"],
    },
    {
      id: "operations", label: "Operations", sub: "Management & Leadership",
      note: "For operations management and program leadership roles.",
      priority: ["auc", "trumpet", "khoi", "card", "oracle", "creekside", "springwood"],
    },
    {
      id: "revenue", label: "Revenue Cycle", sub: "RCM & Billing",
      note: "For revenue cycle, denial management, and billing roles.",
      priority: ["creekside", "card", "khoi", "auc", "trumpet"],
    },
    {
      id: "sales", label: "Sales & Consulting", sub: "Revenue & Partnership",
      note: "For consultative sales, account, and client-partnership roles.",
      priority: ["oracle", "guess", "auc", "trumpet", "cdle"],
    },
  ],

  // ─────────────────────────────────────────────────────────
  //  EXPERIENCE
  //  Newest first; tabs[] picks which panels each bullet shows in
  // ─────────────────────────────────────────────────────────
  experience: [
    {
      id: "creekside",
      title: "Revenue Cycle Manager",
      org: "Creekside Physical Medicine",
      location: "Boulder, CO",
      dates: "May – Dec 2025",
      bullets: [
        {
          text: "Built an enterprise RCM dashboard tracking NCR/GCR trends, denial root causes, payer reimbursement variance, and A/R aging; directly contributed to a <strong>35% reduction in A/R backlog</strong>.",
          tabs: ["analyst", "revenue"],
        },
        {
          text: "Stopped recurring denials by implementing billing-to-servicing provider validation rules (BCBS), standardizing Box 19 CMS-1500 NDC documentation (UHC), and resolving X12/837P EHR-to-clearinghouse transmission errors.",
          tabs: ["revenue"],
        },
        {
          text: "Owned end-to-end RCM operations: registration, eligibility verification, charge capture, payment posting, denial management, appeals, and A/R reporting.",
          tabs: ["revenue", "operations"],
        },
        {
          text: "Led full EHR migration from InSync to Athena, coordinating workflow continuity across billing, clinical, and administrative teams through cutover and go-live.",
          tabs: ["operations", "revenue"],
        },
        {
          text: "Designed analytical reporting workflows to surface payer behavior patterns and denial concentration by provider, CPT, and payer.",
          tabs: ["analyst"],
        },
      ],
    },

    {
      id: "trumpet",
      title: "Operations Supervisor",
      org: "Trumpet Behavioral Health",
      location: "Aurora, CO",
      dates: "Jul 2024 – Apr 2025",
      bullets: [
        {
          text: "Managed front-office operations, staff scheduling, and workflow coordination across clinical and administrative teams serving behavioral health clients.",
          tabs: ["operations", "sales"],
        },
        {
          text: "Oversaw intake documentation, prior authorization tracking, and compliance record management to ensure billing accuracy and uninterrupted service delivery.",
          tabs: ["operations", "revenue", "sales"],
        },
        {
          text: "Maintained facility safety compliance, vendor relationships, and supply inventory readiness; supported payroll accuracy through documentation audits and coding corrections.",
          tabs: ["operations", "revenue"],
        },
      ],
    },

    {
      id: "oracle",
      title: "Integrated Device Consultant",
      org: "Oracle Health",
      location: "Remote / Travel",
      dates: "Aug 2022 – Jun 2023",
      bullets: [
        {
          text: "Managed device integration deployments into the Oracle Health CareAware MDI platform across multiple client sites, reducing manual data entry touchpoints and improving real-time data accuracy at point of care.",
          tabs: ["operations", "sales"],
        },
        {
          text: "Resolved HL7 interface and transmission errors that reduced go-live delays by an estimated <strong>4 days per engagement</strong>.",
          tabs: ["operations", "sales"],
        },
        {
          text: "Partnered with clinical and IT stakeholders to align integration workflows with operational and regulatory requirements, supporting on-time delivery with <strong>zero critical post-go-live failures</strong>.",
          tabs: ["operations", "sales"],
        },
      ],
    },

    {
      id: "auc",
      title: "Regional Operations Manager",
      org: "Advanced Urgent Care & Occupational Medicine",
      location: "Brighton, CO",
      dates: "Oct 2021 – Aug 2022",
      bullets: [
        {
          text: "Drove <strong>$8M in revenue growth</strong> through predictive analytics on patient flow, service demand patterns, and revenue cycle performance, directly informing staffing strategy and operational planning.",
          tabs: ["analyst", "operations", "revenue", "sales"],
        },
        {
          text: "Maintained <strong>100% employee retention</strong> across all managed locations and achieved <strong>89–93% net promoter scores</strong> through investments in referral quality, patient experience, and staff development.",
          tabs: ["operations", "sales"],
        },
        {
          text: "Served as IT project lead for EHR consolidation across <strong>14 clinics</strong>, overseeing Athena/Experity implementation, data migration, manual testing, and user acceptance validation with zero critical system failures.",
          tabs: ["analyst", "operations", "sales"],
        },
        {
          text: "Strengthened front-end eligibility verification and documentation workflows, reducing downstream claim denials and improving reimbursement turnaround time.",
          tabs: ["revenue"],
        },
      ],
    },

    {
      id: "cdle",
      title: "Labor & Employment Specialist",
      org: "Colorado Department of Labor & Employment",
      location: "Denver, CO",
      dates: "Oct 2020 – Oct 2021",
      bullets: [
        {
          text: "Exceeded performance metrics while responding to high-volume claimant inquiries across phone, chat, and email, delivering accurate and empathetic support in time-sensitive situations.",
          tabs: ["sales"],
        },
        {
          text: "Used Salesforce and related support tools to document interactions, submit tickets, and track issues through follow-up and resolution.",
          tabs: ["sales"],
        },
        {
          text: "Guided claimants through complex topics including claim processing, labor law, and monetary issues, simplifying detailed information for diverse audiences.",
          tabs: ["sales"],
        },
      ],
    },

    {
      id: "card",
      title: "Operations Manager",
      org: "Center for Autism and Related Disorders",
      location: "Boulder, CO",
      dates: "Nov 2019 – Oct 2020",
      bullets: [
        {
          text: "Improved payer contract fulfillment rate from <strong>37% to 95%</strong> by restructuring documentation practices, CPT code validation workflows, and A/R follow-up processes.",
          tabs: ["analyst", "operations", "revenue"],
        },
        {
          text: "Built KPI dashboards to track service utilization, encounter profitability, and patient satisfaction, enabling data-driven operational decisions.",
          tabs: ["analyst", "operations"],
        },
        {
          text: "Ensured scheduling efficiency and resource alignment to meet billing requirements and optimize clinical capacity.",
          tabs: ["operations", "revenue"],
        },
      ],
    },

    {
      id: "centura",
      title: "Data & Analytics Intern",
      org: "Centura Health",
      location: "Denver, CO",
      dates: "Nov 2019 – Mar 2021",
      bullets: [
        {
          text: "Designed ETL pipelines to integrate and transform data from EPIC, patient monitoring devices, and administrative systems, achieving consistent data quality across sources.",
          tabs: ["analyst"],
        },
        {
          text: "Applied predictive analytics and machine learning to forecast patient admissions, resource utilization, and potential complications, supporting COVID-19 resource optimization and cost reduction.",
          tabs: ["analyst"],
        },
        {
          text: "Delivered reporting and data visualizations using Power BI, Tableau, and SQL Server.",
          tabs: ["analyst"],
        },
      ],
    },

    {
      id: "springwood",
      title: "Business Intelligence Analyst",
      org: "Springwood Retirement: Assisted Living & Memory Care",
      location: "Arvada, CO",
      dates: "Nov 2018 – Nov 2019",
      bullets: [
        {
          text: "Designed and maintained global reports, dashboards, and queries to calculate, monitor, and communicate KPIs to operational and executive stakeholders.",
          tabs: ["analyst", "operations"],
        },
        {
          text: "Conducted program cost analyses, cost-benefit evaluations, and economic assessments to support strategic planning and resource allocation decisions.",
          tabs: ["analyst", "operations"],
        },
        {
          text: "Connected disparate data systems and visualization tools to enable cross-functional data sharing and applied recommendations based on measured outcomes.",
          tabs: ["analyst"],
        },
      ],
    },

    {
      id: "khoi",
      title: "Practice Administrator",
      org: "Khoi D. Nguyen, DO",
      location: "Denver, CO",
      dates: "Jan 2015 – Mar 2018",
      bullets: [
        {
          text: "Directed clinic operations for a <strong>5,000-patient panel</strong>, improving end-to-end care pathway efficiency by approximately 20% through structured process redesign.",
          tabs: ["operations", "revenue"],
        },
        {
          text: "Enhanced transitional care coordination outcomes: hospital utilization O/E 0.80, ED utilization O/E 1.15, 30-day readmission O/E 0.92, ACSC discharges reduced to 8 per 1,000 beneficiaries.",
          tabs: ["operations", "revenue"],
        },
        {
          text: "Administered federal and state population health program requirements, ensuring care delivery compliance and staff education across the full patient panel.",
          tabs: ["operations", "revenue"],
        },
      ],
    },

    {
      id: "guess",
      title: "Assistant Manager",
      org: "GUESS",
      location: "Denver, CO",
      dates: "Jan 2015 – Jul 2017",
      bullets: [
        {
          text: "Ranked in <strong>top 50 sales performers nationally</strong> while building strong product knowledge and delivering consultative recommendations to resolve customer needs and increase satisfaction.",
          tabs: ["sales"],
        },
        {
          text: "Managed customer accounts and service issues with urgency and professionalism, balancing support objectives with high-touch customer experience.",
          tabs: ["sales"],
        },
        {
          text: "Conducted proactive customer outreach and cold calls to re-engage customers, resolve concerns, and maintain ongoing relationships with existing accounts.",
          tabs: ["sales"],
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────
  //  EDUCATION & CERTIFICATIONS
  //  shared across every tab
  // ─────────────────────────────────────────────────────────
  education: [
    { degree: "M.S. Healthcare Administration",                          school: "University of Denver" },
    { degree: "B.S. Computer Science, Magna Cum Laude",                  school: "Colorado State University" },
    { degree: "B.S. Biology & Chemistry",                                school: "University of Colorado" },
    { degree: "Applied AI, Machine Learning, and Data Science",          school: "MIT", suffix: "Certificate" },
    { degree: "Lean Six Sigma Black Belt",                               school: "Certification" },
    { degree: "Google Data Analytics",                                   school: "Professional Certificate" },
    { degree: "AWS Cloud Practitioner",                                  school: "Certification" },
  ],

  // ─────────────────────────────────────────────────────────
  //  VOLUNTEER
  // ─────────────────────────────────────────────────────────
  volunteer: [
    {
      title: "Regional Communication & Engagement Lead",
      org: "American Red Cross",
      dates: "Dec 2021 – Sep 2022",
      blurb: "Drove disaster relief and humanitarian support initiatives; coordinated regional communications and stakeholder engagement.",
    },
    {
      title: "Post-Anesthesia Care Unit (PACU) Volunteer",
      org: "St. Anthony Hospital (Centura Health)",
      dates: "Feb 2017 – Aug 2017",
      blurb: "Shadowed specialized surgeons, LPNs, APRNs, and RNs; provided patient care support; deepened understanding of clinical workflows and healthcare operations.",
    },
  ],

  // ─────────────────────────────────────────────────────────
  //  SKILLS — per-tab. Each panel shows its own selection.
  // ─────────────────────────────────────────────────────────
  skills: {
    analyst: [
      {
        title: "Analytics Stack",
        chips: ["Python", "pandas", "NumPy", "SQL", "Power BI", "Tableau", "Excel", "Power Query"],
      },
      {
        title: "Analytical Skills",
        chips: ["KPI Design & Tracking", "Deep Learning", "Machine Learning", "Cost-Benefit Analysis", "Predictive Analytics", "Financial Analysis", "Dashboard Development", "ETL Pipelines"],
        muted: true,
      },
    ],
    operations: [
      {
        title: "Operations & Process",
        chips: ["Workflow Optimization", "SOP Development", "Root Cause Analysis", "Change Management", "Capacity Planning", "Onboarding", "Cross-functional Collaboration"],
        muted: true,
      },
      {
        title: "System Admin",
        chips: ["EHR Implementations", "System Migrations", "Enterprise Integration", "UAT", "Vendor Management"],
        muted: true,
      },
      {
        title: "Software & Platforms",
        chips: ["Athena", "Epic", "Experity", "InSync (Qualifacts)", "Monday", "Asana"],
        muted: true,
      },
    ],
    revenue: [
      {
        title: "Revenue Cycle",
        chips: ["Denial Management", "ERA/EOB Reconciliation", "Payment Posting", "LCD/NCCI Compliance", "Charge Capture", "Prior Authorization", "CMS-1500 / X12 837P", "A/R Management"],
        muted: true,
      },
      {
        title: "Software & Platforms",
        chips: ["Athena", "Epic", "Experity", "InSync (Qualifacts)", "Azara", "MySQL", "MariaDB"],
        muted: true,
      },
    ],
    sales: [
      {
        title: "Sales & Consulting",
        chips: ["Consultative Selling", "Cold Calling", "Account Management", "Solution Architecture", "Client Partnership", "Revenue Growth", "Salesforce / CRM", "Stakeholder Alignment"],
        muted: true,
      },
      {
        title: "Technical Expertise",
        chips: ["HL7 Integration", "EHR Implementation", "Healthcare Systems", "Data Integration", "Oracle Health", "Athena", "Epic"],
        muted: true,
      },
    ],
  },
};

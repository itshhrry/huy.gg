/* eslint-disable no-undef */
/* rcm-data.js — REAL aggregates from FinSum raw ledger, scaled 5x to career volume.
   Source: FinSum (Raw Ledger 50)-49ec3723.xlsx — DOS Mar 2025 to Mar 2026.
   50,000 raw rows, 34,244 raw charge lines, 14,281 raw unique claims.
   All $ amounts and counts multiplied by 5 to project ~250,000-claim career volume.
   Per-line ratios, denial rates, and shares preserved at real values.
   Denial-by-payer view excludes contractual CARCs 45/59/253 (above-fee, MPRR, sequestration).
*/

window.RCM_DATA = {
  "facilities": [
    "Clinic A",
    "Clinic B",
    "Hospital OP",
    "ASC 1",
    "Telehealth"
  ],
  "payers": [
    "Aetna",
    "Anthem/BCBS",
    "Cigna",
    "Medicaid",
    "Medicare",
    "Sedgwick",
    "UHC",
    "Self-Pay"
  ],
  "serviceLines": [
    "Behavioral",
    "Integrated",
    "Medical"
  ],
  "encounterTypes": [
    "Follow-up Medical",
    "New Medical",
    "Injection",
    "Labs",
    "Follow-up Behavioral",
    "Integrated Visit",
    "New Behavioral",
    "Diagnostic",
    "Ancillary"
  ],
  "months": [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar"
  ],
  "monthLabels": [
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03"
  ],
  "facMonthly": {
    "Clinic A": [
      985,
      985,
      1230,
      995,
      1160,
      1075,
      1205,
      1095,
      1185,
      1170,
      1020,
      1120
    ],
    "Clinic B": [
      1170,
      1075,
      995,
      1070,
      1150,
      1075,
      1005,
      1005,
      1020,
      1045,
      1005,
      1085
    ],
    "Hospital OP": [
      955,
      1165,
      1055,
      1200,
      1050,
      1185,
      1200,
      1100,
      1110,
      1090,
      1000,
      1000
    ],
    "ASC 1": [
      1270,
      1290,
      1215,
      1075,
      1100,
      1155,
      1135,
      1175,
      1210,
      1185,
      1005,
      950
    ],
    "Telehealth": [
      1055,
      1005,
      1095,
      1050,
      1045,
      1145,
      1110,
      955,
      1130,
      1190,
      1070,
      1165
    ]
  },
  "facVisits": {
    "Clinic A": 14375,
    "Clinic B": 13775,
    "Hospital OP": 14295,
    "ASC 1": 14785,
    "Telehealth": 14175
  },
  "claimsPerFac": {
    "Clinic A": 14375,
    "Clinic B": 13775,
    "Hospital OP": 14295,
    "ASC 1": 14785,
    "Telehealth": 14175
  },
  "totalClaims": 71405,
  "facSvcMix": {
    "Clinic A": {
      "Behavioral": 0.11400980109541654,
      "Integrated": 0.0403574517151917,
      "Medical": 0.8456327471893917
    },
    "Clinic B": {
      "Behavioral": 0.1138701146047605,
      "Integrated": 0.05362915074933882,
      "Medical": 0.8325007346459007
    },
    "Hospital OP": {
      "Behavioral": 0.10962294365992138,
      "Integrated": 0.04920658028825157,
      "Medical": 0.841170476051827
    },
    "ASC 1": {
      "Behavioral": 0.10875922573457736,
      "Integrated": 0.04497980782620805,
      "Medical": 0.8462609664392146
    },
    "Telehealth": {
      "Behavioral": 0.12542635658914728,
      "Integrated": 0.052093023255813956,
      "Medical": 0.8224806201550388
    }
  },
  "writeOffByFacSvc": {
    "Clinic A": {
      "Behavioral": 11107,
      "Integrated": 2936,
      "Medical": 67843
    },
    "Clinic B": {
      "Behavioral": 10688,
      "Integrated": 3368,
      "Medical": 62735
    },
    "Hospital OP": {
      "Behavioral": 7424,
      "Integrated": 3302,
      "Medical": 63490
    },
    "ASC 1": {
      "Behavioral": 8730,
      "Integrated": 3970,
      "Medical": 68991
    },
    "Telehealth": {
      "Behavioral": 8758,
      "Integrated": 2371,
      "Medical": 59520
    }
  },
  "payerMix": {
    "Aetna": {
      "revenue": 2590939,
      "billed": 4082788,
      "claims": 23540,
      "denialRate": 0.2855
    },
    "Anthem/BCBS": {
      "revenue": 2443769,
      "billed": 3932021,
      "claims": 22415,
      "denialRate": 0.2902
    },
    "Cigna": {
      "revenue": 2368999,
      "billed": 3988572,
      "claims": 23140,
      "denialRate": 0.2835
    },
    "Medicaid": {
      "revenue": 1714464,
      "billed": 3981637,
      "claims": 23245,
      "denialRate": 0.293
    },
    "Medicare": {
      "revenue": 1918560,
      "billed": 3802845,
      "claims": 22020,
      "denialRate": 0.2841
    },
    "Sedgwick": {
      "revenue": 2527764,
      "billed": 4004515,
      "claims": 22580,
      "denialRate": 0.2961
    },
    "UHC": {
      "revenue": 2396218,
      "billed": 3921591,
      "claims": 22460,
      "denialRate": 0.2858
    },
    "Self-Pay": {
      "revenue": 980408,
      "billed": 2077206,
      "claims": 11820,
      "denialRate": 1
    }
  },
  "payerDenialsFiltered": [
    {
      "payer": "Medicaid",
      "denials": 6140,
      "lines": 23245,
      "rate": 0.2641,
      "deniedBilled": 1032759,
      "deniedWriteoff": 980
    },
    {
      "payer": "Aetna",
      "denials": 6055,
      "lines": 23540,
      "rate": 0.2572,
      "deniedBilled": 1036117,
      "deniedWriteoff": 332
    },
    {
      "payer": "Sedgwick",
      "denials": 5990,
      "lines": 22580,
      "rate": 0.2653,
      "deniedBilled": 1053185,
      "deniedWriteoff": 1611
    },
    {
      "payer": "Cigna",
      "denials": 5925,
      "lines": 23140,
      "rate": 0.2561,
      "deniedBilled": 1057938,
      "deniedWriteoff": 480
    },
    {
      "payer": "UHC",
      "denials": 5785,
      "lines": 22460,
      "rate": 0.2576,
      "deniedBilled": 1019043,
      "deniedWriteoff": 216
    },
    {
      "payer": "Anthem/BCBS",
      "denials": 5775,
      "lines": 22415,
      "rate": 0.2576,
      "deniedBilled": 970864,
      "deniedWriteoff": 300
    },
    {
      "payer": "Medicare",
      "denials": 5660,
      "lines": 22020,
      "rate": 0.257,
      "deniedBilled": 992163,
      "deniedWriteoff": 1458
    },
    {
      "payer": "Self-Pay",
      "denials": 0,
      "lines": 11820,
      "rate": 0,
      "deniedBilled": 0,
      "deniedWriteoff": 0
    }
  ],
  "denials": {
    "overallRate": 0.5121,
    "issued": 57775,
    "affected": 36570,
    "distByCPT": [
      {
        "k": "99213",
        "v": 0.268,
        "cpt": "99213",
        "desc": "Office/outpatient visit, established patient, low/moderate MDM"
      },
      {
        "k": "99214",
        "v": 0.215,
        "cpt": "99214",
        "desc": "Office/outpatient visit, established patient, moderate/high MDM"
      },
      {
        "k": "99203",
        "v": 0.128,
        "cpt": "99203",
        "desc": "Office/outpatient visit, new patient, low/moderate MDM"
      },
      {
        "k": "99204",
        "v": 0.089,
        "cpt": "99204",
        "desc": "Office/outpatient visit, new patient, moderate/high MDM"
      },
      {
        "k": "Other",
        "v": 0.3
      }
    ],
    "distByEncounter": [
      {
        "k": "Follow-up Medical",
        "v": 0.421
      },
      {
        "k": "New Medical",
        "v": 0.188
      },
      {
        "k": "Injection",
        "v": 0.094
      },
      {
        "k": "Labs",
        "v": 0.077
      },
      {
        "k": "Other",
        "v": 0.22
      }
    ]
  },
  "scenarioDist": [
    {
      "k": "clean",
      "lines": 113445,
      "share": 0.6625686251606121,
      "billed": 19746623
    },
    {
      "k": "self_pay",
      "lines": 11820,
      "share": 0.06903399135614999,
      "billed": 2077206
    },
    {
      "k": "missing_info",
      "lines": 7135,
      "share": 0.04167153369933419,
      "billed": 1174454
    },
    {
      "k": "medical_necessity",
      "lines": 5295,
      "share": 0.03092512556944282,
      "billed": 934023
    },
    {
      "k": "bundled",
      "lines": 5115,
      "share": 0.029873846513257796,
      "billed": 874549
    },
    {
      "k": "noncovered",
      "lines": 5000,
      "share": 0.029202196005139586,
      "billed": 853217
    },
    {
      "k": "benefit_maxed",
      "lines": 4480,
      "share": 0.02616516762060507,
      "billed": 759248
    },
    {
      "k": "no_auth",
      "lines": 3425,
      "share": 0.020003504263520617,
      "billed": 618163
    },
    {
      "k": "duplicate",
      "lines": 2985,
      "share": 0.017433711015068333,
      "billed": 513368
    },
    {
      "k": "not_billed_out",
      "lines": 2965,
      "share": 0.017316902231047773,
      "billed": 497539
    },
    {
      "k": "timely_filing",
      "lines": 2950,
      "share": 0.017229295643032355,
      "billed": 530247
    },
    {
      "k": "modifier_error",
      "lines": 1660,
      "share": 0.009695129073706343,
      "billed": 307741
    },
    {
      "k": "experimental",
      "lines": 1660,
      "share": 0.009695129073706343,
      "billed": 305267
    },
    {
      "k": "level_of_service",
      "lines": 1655,
      "share": 0.009665926877701203,
      "billed": 297517
    },
    {
      "k": "units_excess",
      "lines": 1630,
      "share": 0.009519915897675505,
      "billed": 302013
    }
  ],
  "carcTop": [
    {
      "code": "16",
      "desc": "Claim/service lacks information needed for adjudication. Remark Code required when appropriate.",
      "lines": 7135,
      "billed": 1174454
    },
    {
      "code": "50",
      "desc": "Non-covered: not deemed a medical necessity by payer.",
      "lines": 5295,
      "billed": 934023
    },
    {
      "code": "97",
      "desc": "Benefit included in payment/allowance for another service/procedure already adjudicated.",
      "lines": 5115,
      "billed": 874549
    },
    {
      "code": "96",
      "desc": "Non-covered charge(s).",
      "lines": 5000,
      "billed": 853217
    },
    {
      "code": "119",
      "desc": "Benefit maximum for this time period or occurrence has been reached.",
      "lines": 4480,
      "billed": 759248
    },
    {
      "code": "18",
      "desc": "Duplicate claim/service.",
      "lines": 2985,
      "billed": 513368
    },
    {
      "code": "29",
      "desc": "Time limit for filing has expired.",
      "lines": 2950,
      "billed": 530247
    },
    {
      "code": "197",
      "desc": "Payment denied/reduced for absence of precertification/authorization.",
      "lines": 2420,
      "billed": 441364
    },
    {
      "code": "55",
      "desc": "Denied: experimental/investigational by payer.",
      "lines": 1660,
      "billed": 305267
    },
    {
      "code": "150",
      "desc": "Info submitted does not support this level of service.",
      "lines": 1655,
      "billed": 297517
    }
  ],
  "cptTop": [
    {
      "cpt": "99213",
      "desc": "Office/outpatient visit, established patient, low/moderate MDM",
      "lines": 41120,
      "billed": 8170544,
      "payment": 4698980
    },
    {
      "cpt": "99214",
      "desc": "Office/outpatient visit, established patient, moderate/high MDM",
      "lines": 32985,
      "billed": 3108836,
      "payment": 1770473
    },
    {
      "cpt": "99203",
      "desc": "Office/outpatient visit, new patient, low/moderate MDM",
      "lines": 19550,
      "billed": 2673463,
      "payment": 1525949
    },
    {
      "cpt": "99204",
      "desc": "Office/outpatient visit, new patient, moderate/high MDM",
      "lines": 13615,
      "billed": 1742039,
      "payment": 987605
    },
    {
      "cpt": "90834",
      "desc": "Psychotherapy, 45 minutes with patient",
      "lines": 12845,
      "billed": 3030264,
      "payment": 1741741
    },
    {
      "cpt": "96372",
      "desc": "Therapeutic/prophylactic/diagnostic injection; SC/IM",
      "lines": 8550,
      "billed": 714609,
      "payment": 329266
    },
    {
      "cpt": "G2211",
      "desc": "Visit complexity add-on (primary care / longitudinal care)",
      "lines": 8210,
      "billed": 775927,
      "payment": 431572
    },
    {
      "cpt": "90791",
      "desc": "Psychiatric diagnostic evaluation",
      "lines": 6700,
      "billed": 1254039,
      "payment": 723988
    },
    {
      "cpt": "83036",
      "desc": "Hemoglobin A1c",
      "lines": 5040,
      "billed": 253058,
      "payment": 145671
    },
    {
      "cpt": "80053",
      "desc": "Comprehensive metabolic panel",
      "lines": 4925,
      "billed": 804844,
      "payment": 470166
    },
    {
      "cpt": "85025",
      "desc": "Complete blood count (CBC) with automated differential",
      "lines": 3540,
      "billed": 712000,
      "payment": 407949
    },
    {
      "cpt": "93000",
      "desc": "Electrocardiogram, routine ECG with interpretation and report",
      "lines": 3075,
      "billed": 534681,
      "payment": 300761
    }
  ],
  "encounterMix": [
    {
      "k": "Follow-up Medical",
      "lines": 74105,
      "billed": 11279380,
      "share": 0.43280574699217383
    },
    {
      "k": "New Medical",
      "lines": 33165,
      "billed": 4415502,
      "share": 0.19369816610209087
    },
    {
      "k": "Injection",
      "lines": 16515,
      "billed": 6460695,
      "share": 0.09645485340497606
    },
    {
      "k": "Labs",
      "lines": 13505,
      "billed": 1769902,
      "share": 0.07887513140988202
    },
    {
      "k": "Follow-up Behavioral",
      "lines": 12845,
      "billed": 3030264,
      "share": 0.0750204415372036
    },
    {
      "k": "Integrated Visit",
      "lines": 8210,
      "billed": 775927,
      "share": 0.0479500058404392
    },
    {
      "k": "New Behavioral",
      "lines": 6700,
      "billed": 1254039,
      "share": 0.039130942646887046
    },
    {
      "k": "Diagnostic",
      "lines": 4510,
      "billed": 705216,
      "share": 0.026340380796635907
    },
    {
      "k": "Ancillary",
      "lines": 1665,
      "billed": 100250,
      "share": 0.009724331269711482
    }
  ],
  "providerTier": [
    {
      "credential": "DO",
      "lines": 34915,
      "denials": 11855,
      "denialRate": 0.33953888013747674,
      "billed": 6002306,
      "payment": 3400057
    },
    {
      "credential": "DPT",
      "lines": 34035,
      "denials": 11335,
      "denialRate": 0.333039518143088,
      "billed": 6031023,
      "payment": 3433367
    },
    {
      "credential": "MD",
      "lines": 34290,
      "denials": 11580,
      "denialRate": 0.33770778652668415,
      "billed": 5997475,
      "payment": 3413546
    },
    {
      "credential": "PA",
      "lines": 34305,
      "denials": 11690,
      "denialRate": 0.34076665209153184,
      "billed": 5995197,
      "payment": 3417777
    },
    {
      "credential": "NP",
      "lines": 33675,
      "denials": 11315,
      "denialRate": 0.3360059391239792,
      "billed": 5765174,
      "payment": 3276372
    }
  ],
  "arAging": [
    {
      "bucket": "0-30",
      "amount": 8251405
    },
    {
      "bucket": "31-60",
      "amount": 336530
    },
    {
      "bucket": "61-90",
      "amount": 310949
    },
    {
      "bucket": "91-120",
      "amount": 338296
    },
    {
      "bucket": "120+",
      "amount": 3227644
    }
  ],
  "incomeMonthly": [
    1293921,
    1278907,
    1253940,
    1378662,
    1303957,
    1321626,
    1331426,
    1324554,
    1397692,
    1284737,
    1189084,
    1253916
  ],
  "billedMonthly": [
    2264622,
    2204009,
    2215875,
    2398658,
    2298763,
    2309369,
    2337196,
    2353334,
    2472099,
    2289271,
    2060322,
    2232792
  ],
  "writeOffMonthly": [
    30411,
    27307,
    26620,
    19807,
    29413,
    31301,
    32393,
    34279,
    29260,
    32266,
    30346,
    32946
  ],
  "kpis": {
    "visits": 71405,
    "income": 16941120,
    "billed": 29791176,
    "writeOff": 385231,
    "openAR": 12464824,
    "openARpct": 0.4184,
    "denialRate": 0.5121,
    "ncr": 0.5687,
    "collectionRate": 0.7617,
    "charges": 171220,
    "rows": 250000,
    "scaleFactor": 5,
    "scaledLabel": "250,000+",
    "avgArDays": 95,
    "filteredDenialRate": 0.2414,
    "filteredDenials": 41330
  },
  "svcLineAvgPerLine": {
    "Medical": {
      "billed": 172.38,
      "payment": 97.89
    },
    "Integrated": {
      "billed": 94.51,
      "payment": 52.57
    },
    "Behavioral": {
      "billed": 219.2,
      "payment": 126.16
    }
  },
  "meta": {
    "source": "FinSum (Raw Ledger 50)-49ec3723.xlsx",
    "rawRows": 50000,
    "rawChargeLines": 34244,
    "rawUniqueClaims": 14281,
    "dosRange": "2025-03-01 to 2026-03-31",
    "scaleFactor": 5,
    "scaledClaims": 71405,
    "scaledChargeLines": 171220,
    "facilities": 5,
    "payers": 8,
    "monthsCovered": 12,
    "excludedCarcCodes": [
      "45",
      "59",
      "253"
    ],
    "excludedCarcReason": "Contractual write-offs (45 = above contracted fee, 59 = MPRR adjustment, 253 = sequestration) — not actionable denials.",
    "note": "Aggregates parsed from raw ledger; all $ amounts and counts scaled 5x to project ~250K-claim career volume."
  }
};
window.RCM_CONST = {
  FACILITIES: ["Clinic A","Clinic B","Hospital OP","ASC 1","Telehealth"],
  PAYERS: ["Aetna","Anthem/BCBS","Cigna","Medicaid","Medicare","Sedgwick","UHC","Self-Pay"],
  SERVICE_LINES: ["Behavioral","Integrated","Medical"],
  MONTHS: ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"]
};

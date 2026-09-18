/**
 * Synthetic fixture data for stub mode. NO REAL PATIENT DATA — every value here
 * is fabricated. Subjects are pseudonymous (subject_code only), by contract.
 *
 * Only `lib/api.ts` may import this module. Components must never read it directly.
 */

import type {
  AdverseEvent,
  Alert,
  AlertRule,
  AlertSeverity,
  AuditAction,
  AuditEvent,
  AECausality,
  AEOutcome,
  AESeverity,
  CodingSource,
  DataQuery,
  Deviation,
  EnrolmentCurve,
  Milestone,
  MilestoneType,
  PortfolioKPI,
  Site,
  Study,
  StudyKPI,
  TermSignal,
  User,
} from "@/types/vitalwatch";

/* ------------------------------------------------------------------ utils */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260822);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function intBetween(min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

const DAY = 86_400_000;

/** Fixtures are anchored to load time so countdowns/deadlines stay live in demos. */
const NOW = new Date();

function iso(d: Date): string {
  return d.toISOString();
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysFromNow(days: number): Date {
  return new Date(NOW.getTime() + days * DAY);
}

function hoursFromNow(hours: number): Date {
  return new Date(NOW.getTime() + hours * 3_600_000);
}

/**
 * Deterministic FNV-1a based digest. Stands in for the backend's SHA-256
 * hash chain so the "Verify chain" demo re-links row to row honestly.
 */
export function digest(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i += 1) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (Math.imul(h2 ^ input.charCodeAt(i), 0x85ebca6b) + i) >>> 0;
  }
  const part = (n: number) => n.toString(16).padStart(8, "0");
  return (
    part(h1) +
    part(h2) +
    part(Math.imul(h1 ^ h2, 0xc2b2ae35) >>> 0) +
    part(Math.imul(h1 + h2, 0x27d4eb2f) >>> 0) +
    part((h1 ^ (h2 >>> 3)) >>> 0) +
    part((h2 ^ (h1 >>> 5)) >>> 0) +
    part(Math.imul(h1, 3266489917) >>> 0) +
    part(Math.imul(h2, 668265263) >>> 0)
  );
}

/* ------------------------------------------------------------------ users */

export const users: User[] = [
  {
    id: "U-000",
    email: "lead@aiia.demo",
    full_name: "Ishan Ray Chaudhuri",
    role: "admin",
    study_ids: [],
    site_ids: [],
    active: true,
  },
  {
    id: "U-001",
    email: "r.menon@aiia.demo",
    full_name: "Dr. Radhika Menon",
    role: "principal_investigator",
    study_ids: ["S-001", "S-003", "S-006"],
    site_ids: ["SI-01", "SI-02"],
    active: true,
  },
  {
    id: "U-002",
    email: "a.bhatt@aiia.demo",
    full_name: "Anand Bhatt",
    role: "study_coordinator",
    study_ids: ["S-001", "S-002"],
    site_ids: ["SI-01", "SI-04"],
    active: true,
  },
  {
    id: "U-003",
    email: "s.iyer@aiia.demo",
    full_name: "Sneha Iyer",
    role: "monitor",
    study_ids: ["S-002", "S-004", "S-005"],
    site_ids: ["SI-03", "SI-05", "SI-07"],
    active: true,
  },
  {
    id: "U-004",
    email: "ec.chair@aiia.demo",
    full_name: "Prof. K. Venkataraman",
    role: "ethics_committee",
    study_ids: [],
    site_ids: [],
    active: true,
  },
  {
    id: "U-005",
    email: "pv.officer@npvcc.demo",
    full_name: "Dr. Meera Sundaram",
    role: "pharmacovigilance",
    study_ids: [],
    site_ids: [],
    active: true,
  },
  {
    id: "U-007",
    email: "inspector@cdsco.demo",
    full_name: "CDSCO Inspector (read-only)",
    role: "regulator",
    study_ids: [],
    site_ids: [],
    active: true,
  },
];

/* ------------------------------------------------------------------ sites */

export const sites: Site[] = [
  {
    id: "SI-01",
    name: "AIIA New Delhi — Main Campus",
    city: "New Delhi",
    state: "Delhi",
    status: "activated",
    activated_date: isoDate(daysFromNow(-420)),
    pi_name: "Dr. Radhika Menon",
    capacity: 120,
    study_ids: ["S-001", "S-003", "S-006", "S-008"],
  },
  {
    id: "SI-02",
    name: "AIIA Goa Satellite Centre",
    city: "Panaji",
    state: "Goa",
    status: "activated",
    activated_date: isoDate(daysFromNow(-310)),
    pi_name: "Dr. Sunita Kamat",
    capacity: 60,
    study_ids: ["S-001", "S-006"],
  },
  {
    id: "SI-03",
    name: "Government Ayurveda College, Thiruvananthapuram",
    city: "Thiruvananthapuram",
    state: "Kerala",
    status: "activated",
    activated_date: isoDate(daysFromNow(-268)),
    pi_name: "Dr. Anil Nair",
    capacity: 80,
    study_ids: ["S-002", "S-004"],
  },
  {
    id: "SI-04",
    name: "Banaras Hindu University — IMS Ayurveda",
    city: "Varanasi",
    state: "Uttar Pradesh",
    status: "activated",
    activated_date: isoDate(daysFromNow(-240)),
    pi_name: "Dr. Prashant Tiwari",
    capacity: 90,
    study_ids: ["S-002", "S-005", "S-007"],
  },
  {
    id: "SI-05",
    name: "Gujarat Ayurved University, Jamnagar",
    city: "Jamnagar",
    state: "Gujarat",
    status: "activated",
    activated_date: isoDate(daysFromNow(-198)),
    pi_name: "Dr. Hetal Trivedi",
    capacity: 75,
    study_ids: ["S-003", "S-005"],
  },
  {
    id: "SI-06",
    name: "National Institute of Ayurveda, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    status: "activated",
    activated_date: isoDate(daysFromNow(-160)),
    pi_name: "Dr. Vikram Rathore",
    capacity: 70,
    study_ids: ["S-004", "S-006"],
  },
  {
    id: "SI-07",
    name: "SDM College of Ayurveda, Hassan",
    city: "Hassan",
    state: "Karnataka",
    status: "activated",
    activated_date: isoDate(daysFromNow(-132)),
    pi_name: "Dr. Latha Shetty",
    capacity: 55,
    study_ids: ["S-005", "S-007"],
  },
  {
    id: "SI-08",
    name: "Podar Ayurved Medical College, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    status: "suspended",
    activated_date: isoDate(daysFromNow(-118)),
    pi_name: "Dr. Rohan Deshmukh",
    capacity: 65,
    study_ids: ["S-002"],
  },
  {
    id: "SI-09",
    name: "Ayurveda Regional Research Institute, Guwahati",
    city: "Guwahati",
    state: "Assam",
    status: "planned",
    activated_date: null,
    pi_name: "Dr. Bhaskar Saikia",
    capacity: 40,
    study_ids: ["S-007"],
  },
  {
    id: "SI-10",
    name: "Ayurveda Institute, Bhubaneswar",
    city: "Bhubaneswar",
    state: "Odisha",
    status: "planned",
    activated_date: null,
    pi_name: "Dr. Sujata Panda",
    capacity: 45,
    study_ids: ["S-008"],
  },
  {
    id: "SI-11",
    name: "Regional Ayurveda Research Centre, Patna",
    city: "Patna",
    state: "Bihar",
    status: "closed",
    activated_date: isoDate(daysFromNow(-520)),
    pi_name: "Dr. Nitin Kumar",
    capacity: 35,
    study_ids: ["S-004"],
  },
  {
    id: "SI-12",
    name: "AIIA Pharmacovigilance Field Unit, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    status: "activated",
    activated_date: isoDate(daysFromNow(-96)),
    pi_name: "Dr. Meera Sundaram",
    capacity: 50,
    study_ids: ["S-003", "S-008"],
  },
];

/* ---------------------------------------------------------------- studies */

export const studies: Study[] = [
  {
    id: "S-001",
    title: "Ashwagandha standardised extract in generalised anxiety disorder",
    protocol_no: "AIIA/CT/2024/011",
    ctri_number: "CTRI/2024/03/064512",
    phase: "III",
    status: "enrolling",
    therapeutic_area: "Psychiatry",
    ec_approval_date: isoDate(daysFromNow(-455)),
    ec_expiry_date: isoDate(daysFromNow(24)),
    ctri_registration_date: isoDate(daysFromNow(-441)),
    target_enrolment: 240,
    actual_enrolment: 168,
    pi_id: "U-001",
    site_ids: ["SI-01", "SI-02"],
    start_date: isoDate(daysFromNow(-430)),
    end_date: null,
  },
  {
    id: "S-002",
    title: "Triphala churna adjunct therapy in metabolic syndrome",
    protocol_no: "AIIA/CT/2024/019",
    ctri_number: "CTRI/2024/06/069930",
    phase: "II",
    status: "enrolling",
    therapeutic_area: "Endocrinology",
    ec_approval_date: isoDate(daysFromNow(-330)),
    ec_expiry_date: isoDate(daysFromNow(120)),
    ctri_registration_date: isoDate(daysFromNow(-318)),
    target_enrolment: 160,
    actual_enrolment: 61,
    pi_id: "U-001",
    site_ids: ["SI-03", "SI-04", "SI-08"],
    start_date: isoDate(daysFromNow(-300)),
    end_date: null,
  },
  {
    id: "S-003",
    title: "Guduchi (Tinospora cordifolia) in post-viral fatigue syndrome",
    protocol_no: "AIIA/CT/2025/004",
    ctri_number: null,
    phase: "II",
    status: "ec_approval",
    therapeutic_area: "Immunology",
    ec_approval_date: isoDate(daysFromNow(-38)),
    ec_expiry_date: isoDate(daysFromNow(327)),
    ctri_registration_date: null,
    target_enrolment: 120,
    actual_enrolment: 0,
    pi_id: "U-001",
    site_ids: ["SI-01", "SI-05", "SI-12"],
    start_date: isoDate(daysFromNow(-20)),
    end_date: null,
  },
  {
    id: "S-004",
    title: "Panchakarma protocol in knee osteoarthritis: a pragmatic trial",
    protocol_no: "AIIA/CT/2023/007",
    ctri_number: "CTRI/2023/09/057214",
    phase: "IV",
    status: "follow_up",
    therapeutic_area: "Rheumatology",
    ec_approval_date: isoDate(daysFromNow(-690)),
    ec_expiry_date: isoDate(daysFromNow(-8)),
    ctri_registration_date: isoDate(daysFromNow(-676)),
    target_enrolment: 200,
    actual_enrolment: 200,
    pi_id: "U-003",
    site_ids: ["SI-03", "SI-06", "SI-11"],
    start_date: isoDate(daysFromNow(-660)),
    end_date: null,
  },
  {
    id: "S-005",
    title: "Brahmi ghrita in mild cognitive impairment of the elderly",
    protocol_no: "AIIA/CT/2024/026",
    ctri_number: "CTRI/2024/11/075108",
    phase: "II",
    status: "screening",
    therapeutic_area: "Neurology",
    ec_approval_date: isoDate(daysFromNow(-210)),
    ec_expiry_date: isoDate(daysFromNow(155)),
    ctri_registration_date: isoDate(daysFromNow(-186)),
    target_enrolment: 90,
    actual_enrolment: 24,
    pi_id: "U-003",
    site_ids: ["SI-04", "SI-05", "SI-07"],
    start_date: isoDate(daysFromNow(-170)),
    end_date: null,
  },
  {
    id: "S-006",
    title: "Yashtimadhu-based formulation in functional dyspepsia",
    protocol_no: "AIIA/CT/2025/012",
    ctri_number: "CTRI/2025/02/081447",
    phase: "I",
    status: "site_activation",
    therapeutic_area: "Gastroenterology",
    ec_approval_date: isoDate(daysFromNow(-95)),
    ec_expiry_date: isoDate(daysFromNow(270)),
    ctri_registration_date: isoDate(daysFromNow(-77)),
    target_enrolment: 48,
    actual_enrolment: 6,
    pi_id: "U-001",
    site_ids: ["SI-01", "SI-02", "SI-06"],
    start_date: isoDate(daysFromNow(-60)),
    end_date: null,
  },
  {
    id: "S-007",
    title: "Community cohort on Ayurvedic self-medication safety (observational)",
    protocol_no: "AIIA/OBS/2025/002",
    ctri_number: "CTRI/2025/05/084901",
    phase: "observational",
    status: "protocol",
    therapeutic_area: "Public Health",
    ec_approval_date: null,
    ec_expiry_date: null,
    ctri_registration_date: isoDate(daysFromNow(-31)),
    target_enrolment: 500,
    actual_enrolment: 0,
    pi_id: "U-003",
    site_ids: ["SI-04", "SI-07", "SI-09"],
    start_date: isoDate(daysFromNow(-10)),
    end_date: null,
  },
  {
    id: "S-008",
    title: "Kutaja formulation in irritable bowel syndrome (diarrhoea-predominant)",
    protocol_no: "AIIA/CT/2022/015",
    ctri_number: "CTRI/2022/08/044120",
    phase: "III",
    status: "close_out",
    therapeutic_area: "Gastroenterology",
    ec_approval_date: isoDate(daysFromNow(-980)),
    ec_expiry_date: isoDate(daysFromNow(60)),
    ctri_registration_date: isoDate(daysFromNow(-960)),
    target_enrolment: 180,
    actual_enrolment: 176,
    pi_id: "U-001",
    site_ids: ["SI-01", "SI-10", "SI-12"],
    start_date: isoDate(daysFromNow(-940)),
    end_date: isoDate(daysFromNow(30)),
  },
];

/* ------------------------------------------------------- enrolment curves */

function monthLabels(count: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(NOW.getFullYear(), NOW.getMonth() - i, 1);
    out.push(
      d.toLocaleString("en-GB", { month: "short", year: "2-digit" }).replace(" ", " "),
    );
  }
  return out;
}

/** Lagging studies get an actual curve that visibly falls behind expected. */
const LAGGING = new Set(["S-002", "S-005"]);

export const enrolmentCurves: Record<string, EnrolmentCurve> = Object.fromEntries(
  studies.map((s) => {
    const months = Math.max(4, Math.min(14, Math.round(s.actual_enrolment / 16) + 6));
    const labels = monthLabels(months);
    const expected: number[] = [];
    const actual: number[] = [];
    for (let i = 0; i < months; i += 1) {
      const frac = (i + 1) / months;
      expected.push(Math.round(s.target_enrolment * 0.85 * frac));
      const drag = LAGGING.has(s.id) ? 0.55 : 1;
      actual.push(
        Math.min(
          s.actual_enrolment,
          Math.round(s.actual_enrolment * frac * (0.82 + 0.2 * frac) * drag) +
            (i === months - 1 && !LAGGING.has(s.id) ? 0 : 0),
        ),
      );
    }
    if (!LAGGING.has(s.id)) actual[months - 1] = s.actual_enrolment;
    return [s.id, { study_id: s.id, target: s.target_enrolment, labels, actual, expected }];
  }),
);

/* -------------------------------------------------------------- milestones */

const MILESTONE_ORDER: MilestoneType[] = [
  "ec_approval",
  "ctri_registration",
  "first_site_activated",
  "first_subject_in",
  "fifty_pct_enrolled",
  "last_subject_in",
  "database_lock",
  "close_out",
];

const MILESTONE_OWNER: Record<MilestoneType, string> = {
  ec_approval: "ethics_committee",
  ctri_registration: "study_coordinator",
  first_site_activated: "study_coordinator",
  first_subject_in: "principal_investigator",
  fifty_pct_enrolled: "principal_investigator",
  last_subject_in: "principal_investigator",
  database_lock: "admin",
  close_out: "admin",
};

export const milestones: Milestone[] = studies.flatMap((s) => {
  const progressIndex = [
    "protocol",
    "ec_approval",
    "ctri_registered",
    "site_activation",
    "screening",
    "enrolling",
    "follow_up",
    "close_out",
  ].indexOf(s.status);
  return MILESTONE_ORDER.map((type, i) => {
    const plannedOffset = -420 + i * 90 + progressIndex * 12;
    const planned = daysFromNow(plannedOffset + (s.id === "S-007" ? 300 : 0));
    const achieved = i <= progressIndex;
    const atRisk = !achieved && i === progressIndex + 1 && plannedOffset < 60;
    const missed = !achieved && planned.getTime() < NOW.getTime();
    return {
      id: `${s.id}-M${i + 1}`,
      study_id: s.id,
      type,
      planned_date: isoDate(planned),
      actual_date: achieved ? isoDate(daysFromNow(plannedOffset + intBetween(-6, 9))) : null,
      status: achieved ? "achieved" : missed ? "missed" : atRisk ? "at_risk" : "planned",
      owner_role: MILESTONE_OWNER[type],
    } satisfies Milestone;
  });
});

/* -------------------------------------------------------------- deviations */

const DEVIATION_CATEGORIES = [
  "Informed consent",
  "Eligibility criteria",
  "Visit window",
  "Study drug accountability",
  "Source documentation",
  "Safety reporting",
];

export const deviations: Deviation[] = studies.flatMap((s, si) =>
  Array.from({ length: s.status === "protocol" ? 0 : intBetween(2, 5) }, (_, i) => {
    const severity =
      i === 0 && si === 0 ? "critical" : i === 1 ? "major" : pick(["minor", "minor", "major"] as const);
    const detected = daysFromNow(-intBetween(3, 180));
    const reported = severity !== "minor";
    return {
      id: `DV-${s.id.slice(2)}${i + 1}`,
      study_id: s.id,
      site_id: s.site_ids[i % s.site_ids.length]!,
      subject_code: i % 3 === 0 ? null : `${s.id.replace("S-", "SUBJ-")}-${100 + i}`,
      category: pick(DEVIATION_CATEGORIES),
      description:
        severity === "critical"
          ? "Study drug dispensed before EC-approved consent version was signed."
          : severity === "major"
            ? "Protocol-mandated safety labs not drawn within the permitted visit window."
            : "Visit conducted two days outside the permitted window; no safety impact.",
      detected_date: isoDate(detected),
      severity,
      reported_to_ec: reported,
      reported_date: reported ? isoDate(new Date(detected.getTime() + 3 * DAY)) : null,
      resolution: severity === "minor" ? "Site retrained; CAPA closed." : null,
    } satisfies Deviation;
  }),
);

/* ------------------------------------------------------------------ queries */

export const queries: DataQuery[] = studies.flatMap((s) =>
  Array.from({ length: s.status === "protocol" ? 0 : intBetween(3, 9) }, (_, i) => {
    const age = intBetween(1, 96);
    const raised = daysFromNow(-age);
    const status = age > 60 ? "open" : pick(["open", "answered", "closed"] as const);
    return {
      id: `Q-${s.id.slice(2)}${i + 1}`,
      study_id: s.id,
      site_id: s.site_ids[i % s.site_ids.length]!,
      subject_code: `${s.id.replace("S-", "SUBJ-")}-${200 + i}`,
      field: pick(["vitals.bp_systolic", "labs.alt", "ae.onset_date", "consent.version", "visit.actual_date"]),
      question: pick([
        "Value out of expected physiological range — please verify against source.",
        "Date precedes the informed consent date. Please clarify.",
        "Missing unit for the recorded laboratory value.",
        "Discrepancy between eCRF entry and source document.",
      ]),
      raised_date: isoDate(raised),
      raised_by: pick(["U-003", "U-002", "U-005"]),
      answered_date: status === "open" ? null : isoDate(daysFromNow(-Math.max(0, age - 5))),
      closed_date: status === "closed" ? isoDate(daysFromNow(-Math.max(0, age - 8))) : null,
      status,
      age_days: age,
    } satisfies DataQuery;
  }),
);

/* ------------------------------------------------------------ adverse events */

const TERMS: Array<{ term: string; code: string }> = [
  { term: "Headache", code: "VW-T0001" },
  { term: "Nausea", code: "VW-T0010" },
  { term: "Vomiting", code: "VW-T0011" },
  { term: "Diarrhoea", code: "VW-T0012" },
  { term: "Abdominal pain", code: "VW-T0014" },
  { term: "Dyspepsia", code: "VW-T0015" },
  { term: "Rash", code: "VW-T0020" },
  { term: "Pruritus", code: "VW-T0021" },
  { term: "Urticaria", code: "VW-T0022" },
  { term: "Hepatic enzyme increased", code: "VW-T0029" },
  { term: "Jaundice", code: "VW-T0030" },
  { term: "Drug-induced liver injury", code: "VW-T0031" },
  { term: "Dizziness", code: "VW-T0003" },
  { term: "Insomnia", code: "VW-T0006" },
  { term: "Palpitations", code: "VW-T0037" },
  { term: "Acute kidney injury", code: "VW-T0034" },
];

const NARRATIVES: Record<string, string> = {
  Headache: "Subject reported dull bifrontal headache starting the evening after dosing; no visual aura.",
  Nausea: "Nausea without vomiting reported 2 hours post dose, settled with rest.",
  Vomiting: "Two episodes of non-bilious vomiting within 6 hours of the morning dose.",
  Diarrhoea: "Loose motions, four episodes over 24 hours, no blood or mucus.",
  "Abdominal pain": "Cramping epigastric pain after the evening dose, relieved spontaneously.",
  Dyspepsia: "Burning epigastric discomfort and acidity reported through the second week of dosing.",
  Rash: "Maculopapular rash over the forearms noted at day 9 visit.",
  Pruritus: "Generalised itching without visible eruption reported by the subject.",
  Urticaria: "Raised itchy wheals over the trunk, resolving within 24 hours of antihistamine.",
  "Hepatic enzyme increased": "Routine labs showed ALT 3x upper limit of normal; subject asymptomatic.",
  Jaundice: "Yellowing of sclera noted at unscheduled visit; bilirubin raised on repeat testing.",
  "Drug-induced liver injury": "Hospitalised with deranged LFTs and hepatocellular pattern; study drug withheld.",
  Dizziness: "Light-headedness on standing reported intermittently over three days.",
  Insomnia: "Difficulty initiating sleep reported for five consecutive nights.",
  Palpitations: "Awareness of rapid heartbeat lasting a few minutes, ECG unremarkable.",
  "Acute kidney injury": "Creatinine rose sharply at week 4; subject admitted for observation and hydration.",
};

const DRUGS = [
  "Ashwagandha standardised extract 300 mg",
  "Triphala churna 5 g",
  "Guduchi ghana vati 500 mg",
  "Brahmi ghrita 10 g",
  "Yashtimadhu granules 3 g",
  "Kutajarishta 20 mL",
];

function buildAdverseEvents(): AdverseEvent[] {
  const activeStudies = studies.filter((s) => s.actual_enrolment > 0);
  const out: AdverseEvent[] = [];

  for (let i = 0; i < 46; i += 1) {
    const study = activeStudies[i % activeStudies.length]!;
    // Deliberate over-representation: "Hepatic enzyme increased" clusters in S-002.
    const forceSignal = study.id === "S-002" && i % 2 === 0;
    const t = forceSignal ? TERMS[9]! : pick(TERMS);
    const serious = i % 9 === 0 || t.term === "Drug-induced liver injury";
    const reportedAt = hoursFromNow(-intBetween(2, 900));
    const codingSource: CodingSource =
      i % 11 === 0 ? "uncoded" : i % 3 === 0 ? "semantic" : "mock";
    const coded = codingSource !== "uncoded";

    out.push({
      id: `AE-${String(i + 1).padStart(4, "0")}`,
      study_id: study.id,
      site_id: study.site_ids[i % study.site_ids.length]!,
      subject_code: `${study.id.replace("S-", "SUBJ-")}-${300 + i}`,
      narrative: NARRATIVES[t.term] ?? "Adverse event reported by site staff during scheduled visit.",
      onset_date: isoDate(new Date(reportedAt.getTime() - intBetween(0, 4) * DAY)),
      serious,
      severity: (serious ? "severe" : pick(["mild", "mild", "moderate"])) as AESeverity,
      causality: pick([
        "unrelated",
        "unlikely",
        "possible",
        "possible",
        "probable",
        "certain",
      ]) as AECausality,
      outcome: (serious
        ? pick(["recovering", "not_recovered", "recovered_with_sequelae"])
        : pick(["recovered", "recovered", "recovering", "unknown"])) as AEOutcome,
      coded_term: coded ? t.term : null,
      coded_code: coded ? t.code : null,
      coding_confidence: coded ? Number((0.62 + rand() * 0.36).toFixed(2)) : null,
      coding_source: codingSource,
      suspect_drug: DRUGS[i % DRUGS.length]!,
      drug_code: coded ? `VW-D${String((i % DRUGS.length) + 1).padStart(4, "0")}` : null,
      drug_coding_source: coded ? "mock" : "uncoded",
      reported_at: iso(reportedAt),
      deadline_24h: serious ? iso(new Date(reportedAt.getTime() + 24 * 3_600_000)) : null,
      deadline_14d: serious ? iso(new Date(reportedAt.getTime() + 14 * DAY)) : null,
      timeline_status: "not_applicable",
    });
  }

  // Guarantee one clearly breached and one clearly due-soon serious case.
  const seriousOnes = out.filter((a) => a.serious);
  const breached = seriousOnes[0];
  if (breached) {
    const reported = hoursFromNow(-31);
    breached.reported_at = iso(reported);
    breached.deadline_24h = iso(new Date(reported.getTime() + 24 * 3_600_000));
    breached.deadline_14d = iso(new Date(reported.getTime() + 14 * DAY));
    breached.coded_term = "Drug-induced liver injury";
    breached.coded_code = "VW-T0031";
    breached.coding_source = "semantic";
    breached.coding_confidence = 0.91;
  }
  const dueSoon = seriousOnes[1];
  if (dueSoon) {
    const reported = hoursFromNow(-21);
    dueSoon.reported_at = iso(reported);
    dueSoon.deadline_24h = iso(new Date(reported.getTime() + 24 * 3_600_000));
    dueSoon.deadline_14d = iso(new Date(reported.getTime() + 14 * DAY));
  }

  return out.map((ae) => ({ ...ae, timeline_status: computeTimelineStatus(ae) }));
}

/** Deadline state; the backend computes this server-side, mirrored here for stub mode. */
export function computeTimelineStatus(
  ae: Pick<AdverseEvent, "serious" | "deadline_24h">,
): AdverseEvent["timeline_status"] {
  if (!ae.serious || !ae.deadline_24h) return "not_applicable";
  const remainingMs = new Date(ae.deadline_24h).getTime() - Date.now();
  if (remainingMs <= 0) return "breached";
  if (remainingMs <= 6 * 3_600_000) return "due_soon";
  return "on_track";
}

export const adverseEvents: AdverseEvent[] = buildAdverseEvents();

/* ------------------------------------------------------------------ signals */

export function buildSignals(source: AdverseEvent[]): TermSignal[] {
  const map = new Map<string, TermSignal>();
  for (const ae of source) {
    const term = ae.coded_term ?? "Uncoded";
    const entry = map.get(term) ?? { term, count: 0, serious_count: 0, studies: [] };
    entry.count += 1;
    if (ae.serious) entry.serious_count += 1;
    if (!entry.studies.includes(ae.study_id)) entry.studies.push(ae.study_id);
    map.set(term, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.serious_count - a.serious_count);
}

/* ------------------------------------------------------------------- alerts */

const ALERT_SEEDS: Array<{
  rule: AlertRule;
  severity: AlertSeverity;
  study_id: string;
  message: string;
  hoursAgo: number;
  acknowledged?: boolean;
}> = [
  { rule: "enrolment_lag", severity: "critical", study_id: "S-002", message: "Enrolment is 42% behind the planned curve for this point in the study.", hoursAgo: 3 },
  { rule: "sae_timeline_breach", severity: "critical", study_id: "S-002", message: "24-hour EC notification deadline breached for a serious adverse event.", hoursAgo: 1 },
  { rule: "ethics_renewal_due", severity: "critical", study_id: "S-004", message: "EC approval expired 8 days ago; enrolment and follow-up visits must pause.", hoursAgo: 14 },
  { rule: "monitoring_visit_overdue", severity: "warning", study_id: "S-001", message: "Monitoring visit at AIIA Goa Satellite Centre is 19 days overdue.", hoursAgo: 26 },
  { rule: "ethics_renewal_due", severity: "warning", study_id: "S-001", message: "EC approval expires in 24 days — renewal dossier not yet submitted.", hoursAgo: 30 },
  { rule: "ctri_update_due", severity: "warning", study_id: "S-003", message: "Study is EC-approved but not yet registered with CTRI.", hoursAgo: 40 },
  { rule: "enrolment_lag", severity: "warning", study_id: "S-005", message: "Screening throughput is below plan at two of three sites.", hoursAgo: 52 },
  { rule: "monitoring_visit_overdue", severity: "warning", study_id: "S-005", message: "Interim monitoring visit at BHU IMS Ayurveda is 6 days overdue.", hoursAgo: 58 },
  { rule: "sae_timeline_breach", severity: "warning", study_id: "S-004", message: "14-day narrative submission due in under 48 hours for one serious event.", hoursAgo: 62 },
  { rule: "ctri_update_due", severity: "warning", study_id: "S-006", message: "CTRI record requires an update: two sites activated since last submission.", hoursAgo: 70 },
  { rule: "monitoring_visit_overdue", severity: "info", study_id: "S-008", message: "Close-out monitoring visit scheduled but report not yet filed.", hoursAgo: 80 },
  { rule: "enrolment_lag", severity: "info", study_id: "S-006", message: "Enrolment tracking marginally below plan in the first activation month.", hoursAgo: 92 },
  { rule: "ctri_update_due", severity: "info", study_id: "S-007", message: "Observational cohort registered; protocol amendment pending CTRI sync.", hoursAgo: 104 },
  { rule: "ethics_renewal_due", severity: "info", study_id: "S-008", message: "EC approval expires in 60 days for the close-out phase.", hoursAgo: 120, acknowledged: true },
  { rule: "monitoring_visit_overdue", severity: "info", study_id: "S-003", message: "Site initiation visit pending for Chennai PV field unit.", hoursAgo: 132, acknowledged: true },
  { rule: "enrolment_lag", severity: "warning", study_id: "S-008", message: "Final four subjects outstanding against target before database lock.", hoursAgo: 150, acknowledged: true },
  { rule: "sae_timeline_breach", severity: "info", study_id: "S-001", message: "Serious event narrative filed within deadline — closed for information.", hoursAgo: 168, acknowledged: true },
  { rule: "ethics_renewal_due", severity: "info", study_id: "S-005", message: "Annual EC progress report due in 45 days.", hoursAgo: 190 },
];

export const alerts: Alert[] = ALERT_SEEDS.map((seed, i) => {
  const study = studies.find((s) => s.id === seed.study_id)!;
  return {
    id: `AL-${String(i + 1).padStart(3, "0")}`,
    rule: seed.rule,
    severity: seed.severity,
    study_id: seed.study_id,
    study_title: study.title,
    message: seed.message,
    raised_at: iso(hoursFromNow(-seed.hoursAgo)),
    deep_link: `/study/${seed.study_id}`,
    acknowledged_by: seed.acknowledged ? "U-005" : null,
    acknowledged_at: seed.acknowledged ? iso(hoursFromNow(-seed.hoursAgo + 4)) : null,
  } satisfies Alert;
});

/* --------------------------------------------------------------------- KPIs */

export function buildPortfolioKpi(
  studyList: Study[],
  aeList: AdverseEvent[],
): PortfolioKPI {
  const activeStatuses = new Set(["screening", "enrolling", "follow_up", "site_activation"]);
  return {
    generated_at: iso(new Date()),
    active_studies: studyList.filter((s) => activeStatuses.has(s.status)).length,
    enrolled_total: studyList.reduce((a, s) => a + s.actual_enrolment, 0),
    target_total: studyList.reduce((a, s) => a + s.target_enrolment, 0),
    sites_activated: sites.filter((s) => s.status === "activated").length,
    sites_total: sites.length,
    open_queries: queries.filter((q) => q.status === "open").length,
    overdue_monitoring_visits: 7,
    open_saes: aeList.filter(
      (a) => a.serious && a.outcome !== "recovered" && a.outcome !== "fatal",
    ).length,
  };
}

export function buildStudyKpi(studyId: string): StudyKPI {
  const study = studies.find((s) => s.id === studyId);
  if (!study) throw new Error(`Unknown study ${studyId}`);
  const curve = enrolmentCurves[studyId]!;
  const openQ = queries.filter((q) => q.study_id === studyId && q.status === "open");
  const studyMilestones = milestones.filter(
    (m) => m.study_id === studyId && m.status !== "achieved",
  );
  const next = studyMilestones[0] ?? null;
  const studyDeviations = deviations.filter((d) => d.study_id === studyId);
  return {
    generated_at: iso(new Date()),
    study_id: studyId,
    enrolment_pct: study.target_enrolment
      ? Number(((study.actual_enrolment / study.target_enrolment) * 100).toFixed(1))
      : 0,
    enrolled: study.actual_enrolment,
    target: study.target_enrolment,
    expected_by_today: curve.expected[curve.expected.length - 1] ?? 0,
    screen_failure_rate: Number((0.08 + (studyId.charCodeAt(3) % 5) / 40).toFixed(2)),
    visit_compliance_pct: 78 + (studyId.charCodeAt(4) % 20),
    open_queries: openQ.length,
    open_query_ageing_days: openQ.length
      ? Math.round(openQ.reduce((a, q) => a + q.age_days, 0) / openQ.length)
      : 0,
    deviation_rate_per_site: Number(
      (studyDeviations.length / Math.max(1, study.site_ids.length)).toFixed(2),
    ),
    open_saes: adverseEvents.filter((a) => a.study_id === studyId && a.serious).length,
    days_to_next_milestone: next
      ? Math.round((new Date(next.planned_date).getTime() - Date.now()) / DAY)
      : null,
    next_milestone: next ? next.type : null,
  };
}

/* -------------------------------------------------------------- audit trail */

const AUDIT_SEEDS: Array<{
  actor: string;
  role: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
}> = [
  { actor: "U-002", role: "study_coordinator", action: "create", resource_type: "subject", resource_id: "SUBJ-001-341", before: null, after: { subject_code: "SUBJ-001-341", status: "screened" }, reason: null },
  { actor: "U-002", role: "study_coordinator", action: "update", resource_type: "subject", resource_id: "SUBJ-001-341", before: { status: "screened", arm: null }, after: { status: "enrolled", arm: "A" }, reason: "Eligibility confirmed at visit 1" },
  { actor: "U-005", role: "pharmacovigilance", action: "create", resource_type: "adverse_event", resource_id: "AE-0001", before: null, after: { serious: true, severity: "severe", coded_term: "Drug-induced liver injury" }, reason: null },
  { actor: "U-005", role: "pharmacovigilance", action: "acknowledge", resource_type: "alert", resource_id: "AL-014", before: { acknowledged_by: null }, after: { acknowledged_by: "U-005" }, reason: "Reviewed at daily PV huddle" },
  { actor: "U-003", role: "monitor", action: "view", resource_type: "study", resource_id: "S-002", before: null, after: null, reason: null },
  { actor: "U-003", role: "monitor", action: "create", resource_type: "deviation", resource_id: "DV-0021", before: null, after: { severity: "major", reported_to_ec: true }, reason: null },
  { actor: "U-007", role: "regulator", action: "access_denied", resource_type: "alert", resource_id: "AL-002", before: null, after: { attempted: "acknowledge" }, reason: "Read-only role" },
  { actor: "U-007", role: "regulator", action: "export", resource_type: "sdtm_dm", resource_id: null, before: null, after: { domain: "DM", rows: 0, format: "csv" }, reason: "Inspection readiness check" },
  { actor: "U-004", role: "ethics_committee", action: "sign", resource_type: "ec_approval", resource_id: "S-003", before: { signed: false }, after: { signed: true, version: "2.1" }, reason: "EC meeting 2026/04" },
  { actor: "U-001", role: "principal_investigator", action: "update", resource_type: "study", resource_id: "S-001", before: { status: "screening", actual_enrolment: 160 }, after: { status: "enrolling", actual_enrolment: 168 }, reason: null },
  { actor: "U-002", role: "study_coordinator", action: "delete", resource_type: "query", resource_id: "Q-0018", before: { status: "open", field: "labs.alt" }, after: null, reason: "Duplicate query raised in error" },
  { actor: "U-009", role: "unknown", action: "login_failed", resource_type: "session", resource_id: null, before: null, after: { reason: "invalid_credentials", attempts: 2 }, reason: null },
];

function buildAuditTrail(): AuditEvent[] {
  const events: AuditEvent[] = [];
  let prevHash = "0".repeat(64);
  const total = 46;
  for (let i = 0; i < total; i += 1) {
    const seed = AUDIT_SEEDS[i % AUDIT_SEEDS.length]!;
    const seq = i + 1;
    const ts = iso(new Date(NOW.getTime() - (total - i) * intBetween(20, 90) * 60_000));
    const payload = JSON.stringify({
      seq,
      actor: seed.actor,
      action: seed.action,
      resource: `${seed.resource_type}:${seed.resource_id ?? "-"}`,
      ts,
      before: seed.before,
      after: seed.after,
      prev: prevHash,
    });
    const hash = digest(payload);
    events.push({
      id: `AUD-${String(seq).padStart(4, "0")}`,
      seq,
      actor_id: seed.actor,
      actor_role: seed.role,
      action: seed.action,
      resource_type: seed.resource_type,
      resource_id: seed.resource_id,
      before: seed.before,
      after: seed.after,
      timestamp_utc: ts,
      reason: seed.reason,
      prev_hash: prevHash,
      hash,
    });
    prevHash = hash;
  }
  // Newest first.
  return events.reverse();
}

export const auditEvents: AuditEvent[] = buildAuditTrail();

/* ------------------------------------------------- coding suggestion engine */

const CODING_INDEX: Array<{ term: string; code: string; synonyms: string[] }> = [
  { term: "Headache", code: "VW-T0001", synonyms: ["headache", "head ache", "cephalalgia", "head pain", "sirashoola"] },
  { term: "Migraine", code: "VW-T0002", synonyms: ["migraine", "ardhavabhedaka"] },
  { term: "Dizziness", code: "VW-T0003", synonyms: ["dizziness", "dizzy", "light headed", "giddiness", "bhrama"] },
  { term: "Insomnia", code: "VW-T0006", synonyms: ["insomnia", "sleeplessness", "poor sleep", "anidra"] },
  { term: "Nausea", code: "VW-T0010", synonyms: ["nausea", "nauseous", "queasy", "feeling sick", "hrillasa"] },
  { term: "Vomiting", code: "VW-T0011", synonyms: ["vomiting", "vomit", "emesis", "throwing up", "chhardi"] },
  { term: "Diarrhoea", code: "VW-T0012", synonyms: ["diarrhoea", "diarrhea", "loose stools", "loose motion", "atisara"] },
  { term: "Constipation", code: "VW-T0013", synonyms: ["constipation", "hard stools", "vibandha"] },
  { term: "Abdominal pain", code: "VW-T0014", synonyms: ["abdominal pain", "stomach pain", "belly pain", "epigastric pain", "udarshoola"] },
  { term: "Dyspepsia", code: "VW-T0015", synonyms: ["dyspepsia", "indigestion", "acidity", "heartburn", "amlapitta"] },
  { term: "Rash", code: "VW-T0020", synonyms: ["rash", "skin rash", "eruption", "maculopapular"] },
  { term: "Pruritus", code: "VW-T0021", synonyms: ["pruritus", "itching", "itch", "kandu"] },
  { term: "Urticaria", code: "VW-T0022", synonyms: ["urticaria", "hives", "wheals", "sheetapitta"] },
  { term: "Angioedema", code: "VW-T0023", synonyms: ["angioedema", "facial swelling", "lip swelling"] },
  { term: "Hepatic enzyme increased", code: "VW-T0029", synonyms: ["elevated liver enzymes", "raised alt", "transaminitis", "deranged lft", "raised sgpt"] },
  { term: "Jaundice", code: "VW-T0030", synonyms: ["jaundice", "icterus", "yellow eyes", "kamala"] },
  { term: "Drug-induced liver injury", code: "VW-T0031", synonyms: ["drug induced liver injury", "dili", "hepatotoxicity", "liver injury"] },
  { term: "Acute kidney injury", code: "VW-T0034", synonyms: ["acute kidney injury", "aki", "renal failure"] },
  { term: "Palpitations", code: "VW-T0037", synonyms: ["palpitations", "racing heart", "hritdrava"] },
  { term: "Tachycardia", code: "VW-T0038", synonyms: ["tachycardia", "fast heart rate", "rapid pulse"] },
];

/**
 * Mock coding: exact synonym hits are reported as the curated term set ("mock"),
 * looser token overlap as a "semantic" match. This is NOT MedDRA — the product
 * must never imply a licensed dictionary. Real MedDRA/WHODrug: deferred.
 */
export function suggestCodingLocal(narrative: string) {
  const text = narrative.toLowerCase();
  const tokens = text.split(/[^a-z]+/).filter((t) => t.length > 3);
  const scored = CODING_INDEX.map((entry) => {
    let score = 0;
    let source = "semantic";
    for (const syn of entry.synonyms) {
      if (text.includes(syn)) {
        score = Math.max(score, 0.82 + Math.min(0.16, syn.length / 100));
        source = "mock";
      }
    }
    if (score === 0) {
      const synTokens = new Set(entry.synonyms.join(" ").split(/[^a-z]+/));
      const overlap = tokens.filter((t) => synTokens.has(t)).length;
      if (overlap > 0) score = Math.min(0.74, 0.4 + overlap * 0.12);
    }
    return { term: entry.term, code: entry.code, score: Number(score.toFixed(2)), source };
  })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return { candidates: scored };
}

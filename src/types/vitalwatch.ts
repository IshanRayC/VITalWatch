/**
 * VITalWatch data contracts.
 * Mirrors the backend Pydantic models in contracts/models/ field-for-field.
 * Do not rename, drop, or loosen any field.
 */

export type StudyPhase = "I" | "II" | "III" | "IV" | "observational";

export type StudyStatus =
  | "protocol"
  | "ec_approval"
  | "ctri_registered"
  | "site_activation"
  | "screening"
  | "enrolling"
  | "follow_up"
  | "close_out";

export type SiteStatus = "planned" | "activated" | "suspended" | "closed";

export type SubjectStatus =
  | "screened"
  | "screen_failed"
  | "enrolled"
  | "completed"
  | "withdrawn";

export type VisitStatus = "upcoming" | "completed" | "missed" | "overdue";

export type DeviationSeverity = "minor" | "major" | "critical";

export type QueryStatus = "open" | "answered" | "closed";

export type AESeverity = "mild" | "moderate" | "severe";

export type AECausality =
  | "unrelated"
  | "unlikely"
  | "possible"
  | "probable"
  | "certain";

export type AEOutcome =
  | "recovered"
  | "recovering"
  | "not_recovered"
  | "recovered_with_sequelae"
  | "fatal"
  | "unknown";

export type CodingSource = "mock" | "semantic" | "meddra" | "uncoded";

export type TimelineStatus =
  | "on_track"
  | "due_soon"
  | "breached"
  | "not_applicable";

export type AlertRule =
  | "enrolment_lag"
  | "ethics_renewal_due"
  | "ctri_update_due"
  | "monitoring_visit_overdue"
  | "sae_timeline_breach";

export type AlertSeverity = "info" | "warning" | "critical";

export type MilestoneType =
  | "ec_approval"
  | "ctri_registration"
  | "first_site_activated"
  | "first_subject_in"
  | "fifty_pct_enrolled"
  | "last_subject_in"
  | "database_lock"
  | "close_out";

export type MilestoneStatus = "planned" | "achieved" | "at_risk" | "missed";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "login_failed"
  | "view"
  | "export"
  | "acknowledge"
  | "sign"
  | "access_denied";

export type Role =
  | "principal_investigator"
  | "study_coordinator"
  | "monitor"
  | "ethics_committee"
  | "pharmacovigilance"
  | "admin"
  | "regulator";

export interface Study {
  id: string;
  title: string;
  protocol_no: string;
  ctri_number: string | null;
  phase: StudyPhase;
  status: StudyStatus;
  therapeutic_area: string;
  ec_approval_date: string | null;
  ec_expiry_date: string | null;
  ctri_registration_date: string | null;
  target_enrolment: number;
  actual_enrolment: number;
  pi_id: string;
  site_ids: string[];
  start_date: string;
  end_date: string | null;
}

export interface Site {
  id: string;
  name: string;
  city: string;
  state: string;
  status: SiteStatus;
  activated_date: string | null;
  pi_name: string;
  capacity: number;
  study_ids: string[];
}

/**
 * Subject: pseudonymous ONLY. `subject_code` is the only handle.
 * Never add a name field or any identifying detail — including in demo data.
 */
export interface Subject {
  id: string;
  subject_code: string;
  study_id: string;
  site_id: string;
  screened_date: string;
  enrolled_date: string | null;
  status: SubjectStatus;
  arm: string | null;
  age_band: string | null;
  sex: string | null;
  consent_version: string;
  consent_date: string;
}

export interface Visit {
  id: string;
  study_id: string;
  site_id: string;
  subject_code: string | null;
  visit_name: string;
  scheduled_date: string;
  actual_date: string | null;
  window_days: number;
  status: VisitStatus;
  monitoring_visit: boolean;
  report_filed: boolean;
}

export interface Deviation {
  id: string;
  study_id: string;
  site_id: string;
  subject_code: string | null;
  category: string;
  description: string;
  detected_date: string;
  severity: DeviationSeverity;
  reported_to_ec: boolean;
  reported_date: string | null;
  resolution: string | null;
}

export interface DataQuery {
  id: string;
  study_id: string;
  site_id: string;
  subject_code: string | null;
  field: string;
  question: string;
  raised_date: string;
  raised_by: string;
  answered_date: string | null;
  closed_date: string | null;
  status: QueryStatus;
  age_days: number;
}

export interface AdverseEvent {
  id: string;
  study_id: string;
  site_id: string;
  subject_code: string;
  narrative: string;
  onset_date: string;
  serious: boolean;
  severity: AESeverity;
  causality: AECausality;
  outcome: AEOutcome;
  coded_term: string | null;
  coded_code: string | null;
  coding_confidence: number | null;
  coding_source: CodingSource;
  suspect_drug: string | null;
  drug_code: string | null;
  drug_coding_source: CodingSource;
  reported_at: string;
  deadline_24h: string | null;
  deadline_14d: string | null;
  timeline_status: TimelineStatus;
}

export interface Alert {
  id: string;
  rule: AlertRule;
  severity: AlertSeverity;
  study_id: string;
  study_title: string | null;
  message: string;
  raised_at: string;
  deep_link: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
}

export interface Milestone {
  id: string;
  study_id: string;
  type: MilestoneType;
  planned_date: string;
  actual_date: string | null;
  status: MilestoneStatus;
  owner_role: string | null;
}

export interface AuditEvent {
  id: string;
  seq: number;
  actor_id: string;
  actor_role: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp_utc: string;
  reason: string | null;
  prev_hash: string;
  hash: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  study_ids: string[];
  site_ids: string[];
  active: boolean;
}

export interface PortfolioKPI {
  generated_at: string;
  active_studies: number;
  enrolled_total: number;
  target_total: number;
  sites_activated: number;
  sites_total: number;
  open_queries: number;
  overdue_monitoring_visits: number;
  open_saes: number;
}

export interface StudyKPI {
  generated_at: string;
  study_id: string;
  enrolment_pct: number;
  enrolled: number;
  target: number;
  expected_by_today: number;
  screen_failure_rate: number;
  visit_compliance_pct: number;
  open_queries: number;
  open_query_ageing_days: number;
  deviation_rate_per_site: number;
  open_saes: number;
  days_to_next_milestone: number | null;
  next_milestone: string | null;
}

export interface EnrolmentCurve {
  study_id: string;
  target: number;
  labels: string[];
  actual: number[];
  expected: number[];
}

export interface TermSignal {
  term: string;
  count: number;
  serious_count: number;
  studies: string[];
}

export interface ChainVerification {
  ok: boolean;
  checked: number;
  broken_at: number | null;
}

export interface CodingCandidate {
  term: string;
  code: string;
  score: number;
  source: string;
}

export interface CodingSuggestion {
  candidates: CodingCandidate[];
}

/** Payload accepted by POST /api/ae (server derives coding + deadlines). */
export interface AdverseEventCreate {
  study_id: string;
  site_id: string;
  subject_code: string;
  narrative: string;
  onset_date: string;
  serious: boolean;
  severity: AESeverity;
  causality: AECausality;
  outcome: AEOutcome;
  suspect_drug: string | null;
  coded_term: string | null;
  coded_code: string | null;
}

import type {
  AlertRule,
  AlertSeverity,
  AuditAction,
  DeviationSeverity,
  MilestoneStatus,
  MilestoneType,
  Role,
  StudyStatus,
} from "@/types/vitalwatch";

export const ROLES: Role[] = [
  "principal_investigator",
  "study_coordinator",
  "monitor",
  "ethics_committee",
  "pharmacovigilance",
  "admin",
  "regulator",
];

export const ROLE_LABEL: Record<Role, string> = {
  principal_investigator: "Principal Investigator",
  study_coordinator: "Study Coordinator",
  monitor: "Clinical Monitor",
  ethics_committee: "Ethics Committee",
  pharmacovigilance: "Pharmacovigilance Officer",
  admin: "Administrator",
  regulator: "Regulator",
};

export const ROLE_SCOPE: Record<Role, string> = {
  principal_investigator: "Scope: own studies",
  study_coordinator: "Scope: own sites",
  monitor: "Scope: assigned studies",
  ethics_committee: "Scope: all studies",
  pharmacovigilance: "Scope: all studies",
  admin: "Scope: all",
  regulator: "Scope: all — read-only",
};

/** Presentation-only. Server-side RBAC enforcement is out of scope (deferred). */
export const READ_ONLY_ROLES: Role[] = ["regulator"];

export function isReadOnly(role: Role | null): boolean {
  return role !== null && READ_ONLY_ROLES.includes(role);
}

export type NavKey = "portfolio" | "alerts" | "ae" | "audit";

export const NAV_BY_ROLE: Record<Role, NavKey[]> = {
  principal_investigator: ["portfolio", "alerts", "ae"],
  study_coordinator: ["portfolio", "alerts", "ae"],
  monitor: ["portfolio", "alerts", "audit"],
  ethics_committee: ["portfolio", "alerts", "ae", "audit"],
  pharmacovigilance: ["portfolio", "alerts", "ae", "audit"],
  admin: ["portfolio", "alerts", "ae", "audit"],
  regulator: ["portfolio", "alerts", "ae", "audit"],
};

export const NAV_META: Record<NavKey, { label: string; to: string }> = {
  portfolio: { label: "Portfolio", to: "/portfolio" },
  alerts: { label: "Alerts", to: "/alerts" },
  ae: { label: "Pharmacovigilance", to: "/ae" },
  audit: { label: "Audit", to: "/audit" },
};

export const ROLE_LANDING: Record<Role, string> = {
  principal_investigator: "/portfolio",
  study_coordinator: "/portfolio",
  monitor: "/portfolio",
  ethics_committee: "/portfolio",
  pharmacovigilance: "/ae",
  admin: "/portfolio",
  regulator: "/audit",
};

export const STUDY_STATUS_ORDER: StudyStatus[] = [
  "protocol",
  "ec_approval",
  "ctri_registered",
  "site_activation",
  "screening",
  "enrolling",
  "follow_up",
  "close_out",
];

export const STUDY_STATUS_LABEL: Record<StudyStatus, string> = {
  protocol: "Protocol",
  ec_approval: "EC approval",
  ctri_registered: "CTRI registered",
  site_activation: "Site activation",
  screening: "Screening",
  enrolling: "Enrolling",
  follow_up: "Follow-up",
  close_out: "Close-out",
};

export const ALERT_RULE_LABEL: Record<AlertRule, string> = {
  enrolment_lag: "Enrolment lag",
  ethics_renewal_due: "Ethics renewal due",
  ctri_update_due: "CTRI update due",
  monitoring_visit_overdue: "Monitoring visit overdue",
  sae_timeline_breach: "SAE timeline breach",
};

export const SEVERITY_RANK: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export const DEVIATION_SEVERITY_LABEL: Record<DeviationSeverity, string> = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
};

export const MILESTONE_LABEL: Record<MilestoneType, string> = {
  ec_approval: "EC approval",
  ctri_registration: "CTRI registration",
  first_site_activated: "First site activated",
  first_subject_in: "First subject in",
  fifty_pct_enrolled: "50% enrolled",
  last_subject_in: "Last subject in",
  database_lock: "Database lock",
  close_out: "Close-out",
};

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  planned: "Planned",
  achieved: "Achieved",
  at_risk: "At risk",
  missed: "Missed",
};

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  login: "Login",
  login_failed: "Login failed",
  view: "View",
  export: "Export",
  acknowledge: "Acknowledge",
  sign: "Sign",
  access_denied: "Access denied",
};

export const AUDIT_ACTIONS = Object.keys(AUDIT_ACTION_LABEL) as AuditAction[];

/** SAE deadline thresholds — configurable, not magic numbers buried in a component. */
export const TIMELINE_THRESHOLDS = {
  /** Inside this many hours of the 24-hour deadline, the clock turns amber. */
  dueSoonHours24h: 6,
  /** Inside this many hours of the 14-day deadline, the clock turns amber. */
  dueSoonHours14d: 72,
};

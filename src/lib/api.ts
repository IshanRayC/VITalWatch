/**
 * The single API client for VITalWatch. No component, hook or route may call
 * `fetch` directly — everything goes through the typed functions exported here.
 * Auth is the one exception (the auth provider owns the session).
 *
 * Stub mode: when enabled, every apiGet/apiPost resolves from local synthetic
 * fixtures instead of hitting the backend. Flipping the env var is the ONLY
 * thing that changes behaviour.
 *
 *   Stub:  VITE_STUB_MODE=true            (alias: NEXT_PUBLIC_STUB_MODE)
 *   Live:  VITE_STUB_MODE=false VITE_API_URL=https://api.example.org
 */

import {
  adverseEvents as seedAdverseEvents,
  alerts as seedAlerts,
  auditEvents as seedAuditEvents,
  buildPortfolioKpi,
  buildSignals,
  buildStudyKpi,
  computeTimelineStatus,
  deviations as seedDeviations,
  digest,
  enrolmentCurves,
  milestones as seedMilestones,
  queries as seedQueries,
  sites as seedSites,
  studies as seedStudies,
  suggestCodingLocal,
  users as seedUsers,
} from "@/data/fixtures";
import type {
  AdverseEvent,
  AdverseEventCreate,
  Alert,
  AuditEvent,
  ChainVerification,
  CodingSuggestion,
  DataQuery,
  Deviation,
  EnrolmentCurve,
  Milestone,
  PortfolioKPI,
  Site,
  Study,
  StudyKPI,
  TermSignal,
  User,
} from "@/types/vitalwatch";

type Env = Record<string, string | undefined>;
const env = import.meta.env as unknown as Env;

export const STUB_MODE: boolean =
  (env["VITE_STUB_MODE"] ?? env["NEXT_PUBLIC_STUB_MODE"] ?? "true") !== "false";

export const API_URL: string =
  env["VITE_API_URL"] ?? env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Simulated network latency in stub mode so skeleton states are real. */
const STUB_LATENCY_MS = 260;

function delay<T>(value: T, ms = STUB_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/* ------------------------------------------------- mutable stub-mode store */

const store = {
  studies: [...seedStudies],
  sites: [...seedSites],
  alerts: [...seedAlerts],
  adverseEvents: [...seedAdverseEvents],
  audit: [...seedAuditEvents],
  milestones: [...seedMilestones],
  deviations: [...seedDeviations],
  queries: [...seedQueries],
  users: [...seedUsers],
};

function appendAudit(event: Omit<AuditEvent, "id" | "seq" | "prev_hash" | "hash">): void {
  const head = store.audit[0];
  const seq = (head?.seq ?? 0) + 1;
  const prevHash = head?.hash ?? "0".repeat(64);
  const payload = JSON.stringify({
    seq,
    actor: event.actor_id,
    action: event.action,
    resource: `${event.resource_type}:${event.resource_id ?? "-"}`,
    ts: event.timestamp_utc,
    before: event.before,
    after: event.after,
    prev: prevHash,
  });
  store.audit = [
    {
      ...event,
      id: `AUD-${String(seq).padStart(4, "0")}`,
      seq,
      prev_hash: prevHash,
      hash: digest(payload),
    },
    ...store.audit,
  ];
}

/* ----------------------------------------------------- generic transport */

const SEVERITY_RANK = { critical: 0, warning: 1, info: 2 } as const;

function stubGet(path: string, params: Record<string, string>): unknown {
  const [, ...segments] = path.split("/").filter(Boolean); // drop leading "api"

  const rank = (a: Alert, b: Alert) =>
    SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
    new Date(b.raised_at).getTime() - new Date(a.raised_at).getTime();

  switch (segments[0]) {
    case "kpi": {
      if (segments[1] === "portfolio")
        return buildPortfolioKpi(store.studies, store.adverseEvents);
      if (segments[1] === "study" && segments[2]) return buildStudyKpi(segments[2]);
      break;
    }
    case "studies": {
      if (!segments[1]) return store.studies;
      const study = store.studies.find((s) => s.id === segments[1]);
      if (!study) throw new ApiError(`Study ${segments[1]} not found`, 404);
      return study;
    }
    case "alerts":
      return [...store.alerts].sort(rank);
    case "sites": {
      const studyId = params["study_id"];
      return studyId
        ? store.sites.filter((s) => s.study_ids.includes(studyId))
        : store.sites;
    }
    case "enrolment": {
      const curve = enrolmentCurves[segments[1] ?? ""];
      if (!curve) throw new ApiError(`No enrolment curve for ${segments[1]}`, 404);
      return curve;
    }
    case "milestones":
      return store.milestones.filter((m) => m.study_id === params["study_id"]);
    case "deviations":
      return store.deviations.filter((d) => d.study_id === params["study_id"]);
    case "queries":
      return store.queries.filter((q) => q.study_id === params["study_id"]);
    case "ae": {
      if (segments[1]) {
        const ae = store.adverseEvents.find((a) => a.id === segments[1]);
        if (!ae) throw new ApiError(`Adverse event ${segments[1]} not found`, 404);
        return { ...ae, timeline_status: computeTimelineStatus(ae) };
      }
      let list = store.adverseEvents.map((ae) => ({
        ...ae,
        timeline_status: computeTimelineStatus(ae),
      }));
      if (params["study_id"]) list = list.filter((a) => a.study_id === params["study_id"]);
      if (params["serious"])
        list = list.filter((a) => a.serious === (params["serious"] === "true"));
      return list.sort(
        (a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime(),
      );
    }
    case "signals": {
      const source = params["study_id"]
        ? store.adverseEvents.filter((a) => a.study_id === params["study_id"])
        : store.adverseEvents;
      return buildSignals(source);
    }
    case "audit": {
      if (segments[1] === "verify") {
        // Re-link the chain exactly as the backend would.
        const ordered = [...store.audit].sort((a, b) => a.seq - b.seq);
        let prev = "0".repeat(64);
        for (const e of ordered) {
          if (e.prev_hash !== prev) {
            return { ok: false, checked: ordered.length, broken_at: e.seq } satisfies ChainVerification;
          }
          prev = e.hash;
        }
        return { ok: true, checked: ordered.length, broken_at: null } satisfies ChainVerification;
      }
      let list = [...store.audit];
      if (params["actor"])
        list = list.filter((e) =>
          e.actor_id.toLowerCase().includes(params["actor"]!.toLowerCase()),
        );
      if (params["role"]) list = list.filter((e) => e.actor_role === params["role"]);
      if (params["from"])
        list = list.filter((e) => e.timestamp_utc >= `${params["from"]}T00:00:00.000Z`);
      if (params["to"])
        list = list.filter((e) => e.timestamp_utc <= `${params["to"]}T23:59:59.999Z`);
      return list;
    }
    case "users":
      return store.users;
    default:
      break;
  }
  throw new ApiError(`No stub handler for GET /${path}`, 501);
}

function stubPost(path: string, body: unknown): unknown {
  const segments = path.split("/").filter(Boolean).slice(1);

  if (segments[0] === "alerts" && segments[2] === "ack") {
    const alert = store.alerts.find((a) => a.id === segments[1]);
    if (!alert) throw new ApiError(`Alert ${segments[1]} not found`, 404);
    const actor = (body as { actor_id?: string } | null)?.actor_id ?? "U-005";
    const updated: Alert = {
      ...alert,
      acknowledged_by: actor,
      acknowledged_at: new Date().toISOString(),
    };
    store.alerts = store.alerts.map((a) => (a.id === updated.id ? updated : a));
    appendAudit({
      actor_id: actor,
      actor_role: "pharmacovigilance",
      action: "acknowledge",
      resource_type: "alert",
      resource_id: updated.id,
      before: { acknowledged_by: null },
      after: { acknowledged_by: actor },
      timestamp_utc: new Date().toISOString(),
      reason: null,
    });
    return updated;
  }

  if (segments[0] === "coding" && segments[1] === "suggest") {
    const narrative = (body as { narrative?: string } | null)?.narrative ?? "";
    return suggestCodingLocal(narrative) satisfies CodingSuggestion;
  }

  if (segments[0] === "ae") {
    const payload = body as AdverseEventCreate;
    const reportedAt = new Date();
    const suggestion = suggestCodingLocal(payload.narrative).candidates[0];
    const coded = payload.coded_term
      ? { term: payload.coded_term, code: payload.coded_code ?? "", score: 1, source: "mock" }
      : suggestion;
    const created: AdverseEvent = {
      id: `AE-${String(store.adverseEvents.length + 1).padStart(4, "0")}`,
      study_id: payload.study_id,
      site_id: payload.site_id,
      subject_code: payload.subject_code,
      narrative: payload.narrative,
      onset_date: payload.onset_date,
      serious: payload.serious,
      severity: payload.severity,
      causality: payload.causality,
      outcome: payload.outcome,
      coded_term: coded?.term ?? null,
      coded_code: coded?.code ?? null,
      coding_confidence: coded ? coded.score : null,
      coding_source: coded ? (coded.source === "mock" ? "mock" : "semantic") : "uncoded",
      suspect_drug: payload.suspect_drug,
      drug_code: payload.suspect_drug ? "VW-D0001" : null,
      drug_coding_source: payload.suspect_drug ? "mock" : "uncoded",
      reported_at: reportedAt.toISOString(),
      deadline_24h: payload.serious
        ? new Date(reportedAt.getTime() + 24 * 3_600_000).toISOString()
        : null,
      deadline_14d: payload.serious
        ? new Date(reportedAt.getTime() + 14 * 86_400_000).toISOString()
        : null,
      timeline_status: "not_applicable",
    };
    created.timeline_status = computeTimelineStatus(created);
    store.adverseEvents = [created, ...store.adverseEvents];
    appendAudit({
      actor_id: "U-005",
      actor_role: "pharmacovigilance",
      action: "create",
      resource_type: "adverse_event",
      resource_id: created.id,
      before: null,
      after: {
        serious: created.serious,
        severity: created.severity,
        coded_term: created.coded_term,
      },
      timestamp_utc: reportedAt.toISOString(),
      reason: null,
    });
    return created;
  }

  throw new ApiError(`No stub handler for POST /${path}`, 501);
}

export async function apiGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") clean[k] = String(v);
  }

  if (STUB_MODE) {
    return delay(stubGet(path, clean) as T);
  }

  const qs = new URLSearchParams(clean).toString();
  const res = await fetch(`${API_URL}/${path}${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new ApiError(`GET /${path} failed`, res.status);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  if (STUB_MODE) {
    return delay(stubPost(path, body ?? null) as T, 420);
  }
  const res = await fetch(`${API_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new ApiError(`POST /${path} failed`, res.status);
  return (await res.json()) as T;
}

/* ------------------------------------------------------ typed endpoint map */

export const getPortfolioKpi = () => apiGet<PortfolioKPI>("api/kpi/portfolio");
export const getStudyKpi = (studyId: string) =>
  apiGet<StudyKPI>(`api/kpi/study/${studyId}`);
export const listStudies = () => apiGet<Study[]>("api/studies");
export const getStudy = (studyId: string) => apiGet<Study>(`api/studies/${studyId}`);
export const listAlerts = () => apiGet<Alert[]>("api/alerts");
export const ackAlert = (alertId: string, actorId: string) =>
  apiPost<Alert>(`api/alerts/${alertId}/ack`, { actor_id: actorId });
export const listSites = (studyId?: string) =>
  apiGet<Site[]>("api/sites", { study_id: studyId });
export const getEnrolmentCurve = (studyId: string) =>
  apiGet<EnrolmentCurve>(`api/enrolment/${studyId}`);
export const listMilestones = (studyId: string) =>
  apiGet<Milestone[]>("api/milestones", { study_id: studyId });
export const listDeviations = (studyId: string) =>
  apiGet<Deviation[]>("api/deviations", { study_id: studyId });
export const listQueries = (studyId: string) =>
  apiGet<DataQuery[]>("api/queries", { study_id: studyId });
export const listAdverseEvents = (params: { studyId?: string; serious?: boolean } = {}) =>
  apiGet<AdverseEvent[]>("api/ae", { study_id: params.studyId, serious: params.serious });
export const getAdverseEvent = (aeId: string) => apiGet<AdverseEvent>(`api/ae/${aeId}`);
export const reportAdverseEvent = (payload: AdverseEventCreate) =>
  apiPost<AdverseEvent>("api/ae", payload);
export const suggestCoding = (narrative: string) =>
  apiPost<CodingSuggestion>("api/coding/suggest", { narrative });
export const getSignals = (studyId?: string) =>
  apiGet<TermSignal[]>("api/signals", { study_id: studyId });
export const listAuditEvents = (
  params: { actor?: string; role?: string; from?: string; to?: string } = {},
) => apiGet<AuditEvent[]>("api/audit", { ...params });
export const verifyAuditChain = () => apiGet<ChainVerification>("api/audit/verify");
export const listUsers = () => apiGet<User[]>("api/users");

/** SDTM export: a CSV header download only. Full SDTM/ADaM is out of scope. */
export function sdtmExportUrl(domain: "DM" | "AE"): string {
  return `${API_URL}/api/export/sdtm?domain=${domain}`;
}
export function fhirResearchStudyUrl(studyId: string): string {
  return `${API_URL}/api/fhir/ResearchStudy/${studyId}`;
}
export function fhirAdverseEventUrl(aeId: string): string {
  return `${API_URL}/api/fhir/AdverseEvent/${aeId}`;
}

/** Client-side CSV header download for the DM/AE export button (stub mode). */
export function downloadSdtmHeaderCsv(domain: "DM" | "AE"): void {
  const headers =
    domain === "DM"
      ? "STUDYID,DOMAIN,USUBJID,SUBJID,SITEID,AGEGR1,SEX,ARM,RFSTDTC,RFENDTC"
      : "STUDYID,DOMAIN,USUBJID,AESEQ,AETERM,AEDECOD,AESER,AESEV,AEREL,AEOUT,AESTDTC";
  const blob = new Blob([`${headers}\n`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vitalwatch_${domain.toLowerCase()}_header.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

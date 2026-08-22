import { cn } from "@/lib/utils";
import {
  DEVIATION_SEVERITY_LABEL,
  MILESTONE_STATUS_LABEL,
  STUDY_STATUS_LABEL,
} from "@/lib/roles";
import { humanEnum } from "@/lib/format";
import type {
  AlertSeverity,
  AESeverity,
  CodingSource,
  DeviationSeverity,
  MilestoneStatus,
  SiteStatus,
  StudyStatus,
  TimelineStatus,
} from "@/types/vitalwatch";

const base =
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap";

/** Lifecycle pill: protocol -> ... -> close_out */
export function StatusPill({ status }: { status: StudyStatus }) {
  const style: Record<StudyStatus, string> = {
    protocol: "border-border bg-muted text-muted-foreground",
    ec_approval: "border-border bg-secondary text-secondary-foreground",
    ctri_registered: "border-border bg-secondary text-secondary-foreground",
    site_activation: "border-primary/30 bg-primary-muted/30 text-primary",
    screening: "border-primary/30 bg-primary-muted/30 text-primary",
    enrolling: "border-primary/50 bg-primary-muted/50 text-primary",
    follow_up: "border-success/40 bg-success-soft text-success",
    close_out: "border-border bg-muted text-muted-foreground",
  };
  return <span className={cn(base, style[status])}>{STUDY_STATUS_LABEL[status]}</span>;
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const style: Record<AlertSeverity, string> = {
    info: "border-info/40 bg-info-soft text-info",
    warning: "border-warning/40 bg-warning-soft text-warning",
    critical: "border-critical/50 bg-critical-soft text-critical",
  };
  return <span className={cn(base, style[severity])}>{humanEnum(severity)}</span>;
}

export function DeviationSeverityBadge({ severity }: { severity: DeviationSeverity }) {
  const style: Record<DeviationSeverity, string> = {
    minor: "border-info/40 bg-info-soft text-info",
    major: "border-warning/40 bg-warning-soft text-warning",
    critical: "border-critical/50 bg-critical-soft text-critical",
  };
  return <span className={cn(base, style[severity])}>{DEVIATION_SEVERITY_LABEL[severity]}</span>;
}

export function AeSeverityBadge({ severity }: { severity: AESeverity }) {
  const style: Record<AESeverity, string> = {
    mild: "border-border bg-muted text-muted-foreground",
    moderate: "border-warning/40 bg-warning-soft text-warning",
    severe: "border-critical/50 bg-critical-soft text-critical",
  };
  return <span className={cn(base, style[severity])}>{humanEnum(severity)}</span>;
}

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const style: Record<SiteStatus, string> = {
    planned: "border-border bg-muted text-muted-foreground",
    activated: "border-success/40 bg-success-soft text-success",
    suspended: "border-warning/40 bg-warning-soft text-warning",
    closed: "border-border bg-secondary text-muted-foreground",
  };
  return <span className={cn(base, style[status])}>{humanEnum(status)}</span>;
}

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const style: Record<MilestoneStatus, string> = {
    planned: "border-border bg-muted text-muted-foreground",
    achieved: "border-success/40 bg-success-soft text-success",
    at_risk: "border-warning/40 bg-warning-soft text-warning",
    missed: "border-critical/50 bg-critical-soft text-critical",
  };
  return <span className={cn(base, style[status])}>{MILESTONE_STATUS_LABEL[status]}</span>;
}

export function TimelineStatusBadge({ status }: { status: TimelineStatus }) {
  const style: Record<TimelineStatus, string> = {
    on_track: "border-success/40 bg-success-soft text-success",
    due_soon: "border-warning/40 bg-warning-soft text-warning",
    breached: "border-critical/60 bg-critical-soft text-critical",
    not_applicable: "border-border bg-muted text-muted-foreground",
  };
  const label: Record<TimelineStatus, string> = {
    on_track: "On track",
    due_soon: "Due soon",
    breached: "BREACHED",
    not_applicable: "n/a",
  };
  return <span className={cn(base, style[status])}>{label[status]}</span>;
}

/**
 * Coding provenance is labelled explicitly and never implied to be a licensed
 * dictionary. Real MedDRA / WHODrug integration is out of scope (deferred).
 */
export function CodingSourceBadge({ source }: { source: CodingSource }) {
  const label: Record<CodingSource, string> = {
    mock: "curated term set",
    semantic: "semantic match",
    meddra: "MedDRA (not licensed in this demo)",
    uncoded: "uncoded",
  };
  const style: Record<CodingSource, string> = {
    mock: "border-primary/30 bg-primary-muted/30 text-primary",
    semantic: "border-info/40 bg-info-soft text-info",
    meddra: "border-warning/40 bg-warning-soft text-warning",
    uncoded: "border-border bg-muted text-muted-foreground",
  };
  return <span className={cn(base, style[source])}>{label[source]}</span>;
}

export function ProgressBar({
  value,
  total,
  attention = false,
}: {
  value: number;
  total: number;
  attention?: boolean;
}) {
  const percentage = total ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700",
          attention ? "bg-warning" : "bg-primary",
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

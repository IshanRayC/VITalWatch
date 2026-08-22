import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/roles";
import type { Role } from "@/types/vitalwatch";

const ROLE_STYLE: Record<Role, string> = {
  principal_investigator: "bg-info-soft text-info border-info/40",
  study_coordinator: "bg-primary-muted/40 text-primary border-primary/40",
  monitor: "bg-success-soft text-success border-success/40",
  ethics_committee: "bg-warning-soft text-warning border-warning/40",
  pharmacovigilance: "bg-critical-soft text-critical border-critical/40",
  admin: "bg-secondary text-secondary-foreground border-border",
  regulator: "bg-muted text-muted-foreground border-border",
};

const SHORT: Record<Role, string> = {
  principal_investigator: "PI",
  study_coordinator: "Coordinator",
  monitor: "Monitor",
  ethics_committee: "Ethics",
  pharmacovigilance: "PV Officer",
  admin: "Admin",
  regulator: "Regulator",
};

export function RoleBadge({
  role,
  compact = false,
  className,
}: {
  role: Role;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      title={ROLE_LABEL[role]}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        ROLE_STYLE[role],
        className,
      )}
    >
      {compact ? SHORT[role] : ROLE_LABEL[role]}
    </span>
  );
}

/** Audit rows can carry roles that aren't one of the 7 app roles (e.g. "unknown"). */
export function ActorRoleBadge({ role }: { role: string }) {
  if ((Object.keys(ROLE_LABEL) as Role[]).includes(role as Role)) {
    return <RoleBadge role={role as Role} compact />;
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      {role}
    </span>
  );
}

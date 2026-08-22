import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ackAlert, listAlerts } from "@/lib/api";
import { AppShell, ReadOnlyNotice } from "@/components/vw/AppShell";
import { AlertBanner } from "@/components/vw/AlertBanner";
import { EmptyState, ErrorState, PanelSkeleton } from "@/components/vw/Skeletons";
import { useSession } from "@/lib/auth";
import { ALERT_RULE_LABEL, isReadOnly, SEVERITY_RANK } from "@/lib/roles";
import type { Alert, AlertRule, AlertSeverity } from "@/types/vitalwatch";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — full alert log · VITalWatch" },
      {
        name: "description",
        content:
          "The complete VITalWatch alert log: enrolment lag, ethics renewals, CTRI updates, overdue monitoring visits and SAE timeline breaches, filterable and acknowledgeable. Synthetic demo data only.",
      },
      { property: "og:title", content: "Alerts — full alert log · VITalWatch" },
      {
        property: "og:description",
        content:
          "Every raised alert, severity-ranked and filterable, with per-alert acknowledgement. Demo system, synthetic data only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AlertsPage,
});

const SEVERITIES: AlertSeverity[] = ["critical", "warning", "info"];
const RULES = Object.keys(ALERT_RULE_LABEL) as AlertRule[];

function AlertsPage() {
  const { effectiveRole, user } = useSession();
  const readOnly = isReadOnly(effectiveRole);
  const queryClient = useQueryClient();

  const [severity, setSeverity] = useState<AlertSeverity | "all">("all");
  const [rule, setRule] = useState<AlertRule | "all">("all");
  const [blocked, setBlocked] = useState(false);

  const alertsQuery = useQuery({ queryKey: ["alerts"], queryFn: listAlerts });

  const ackMutation = useMutation({
    mutationFn: (alert: Alert) => ackAlert(alert.id, user?.id ?? "U-000"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const visible = useMemo(
    () =>
      [...(alertsQuery.data ?? [])]
        .filter((a) => (severity === "all" || a.severity === severity))
        .filter((a) => (rule === "all" || a.rule === rule))
        .sort(
          (a, b) =>
            Number(a.acknowledged_by !== null) - Number(b.acknowledged_by !== null) ||
            SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
            new Date(b.raised_at).getTime() - new Date(a.raised_at).getTime(),
        ),
    [alertsQuery.data, severity, rule],
  );

  const unacknowledged = visible.filter((a) => a.acknowledged_by === null).length;

  return (
    <AppShell
      title="Alerts"
      description="Every rule breach raised across the programme, severity-ranked."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as AlertSeverity | "all")}
            className="rounded-md border border-input bg-surface-2 px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by rule"
            value={rule}
            onChange={(e) => setRule(e.target.value as AlertRule | "all")}
            className="rounded-md border border-input bg-surface-2 px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All rules</option>
            {RULES.map((r) => (
              <option key={r} value={r}>
                {ALERT_RULE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {blocked ? (
        <div className="mb-4">
          <ReadOnlyNotice action="acknowledge alerts" />
        </div>
      ) : null}

      {alertsQuery.isPending ? (
        <div className="space-y-3">
          <PanelSkeleton height="h-24" />
          <PanelSkeleton height="h-24" />
          <PanelSkeleton height="h-24" />
        </div>
      ) : alertsQuery.isError ? (
        <ErrorState message="The alert log could not be loaded." onRetry={() => alertsQuery.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No alerts match these filters"
          hint="Widen the severity or rule filter to see more of the log."
        />
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            <span className="mono text-foreground">{visible.length}</span> alerts shown ·{" "}
            <span className="mono text-foreground">{unacknowledged}</span> unacknowledged
          </p>
          <div className="space-y-2">
            {visible.map((alert, i) => (
              <AlertBanner
                key={alert.id}
                alert={alert}
                index={i}
                readOnly={readOnly}
                acknowledging={ackMutation.isPending && ackMutation.variables?.id === alert.id}
                onAcknowledge={(a) => {
                  if (readOnly) {
                    setBlocked(true);
                    return;
                  }
                  ackMutation.mutate(a);
                }}
              />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

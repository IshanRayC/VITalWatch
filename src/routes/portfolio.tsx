import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import {
  downloadSdtmHeaderCsv,
  getEnrolmentCurve,
  getPortfolioKpi,
  listAdverseEvents,
  listAlerts,
  listSites,
  listStudies,
} from "@/lib/api";
import { AppShell, ReadOnlyNotice } from "@/components/vw/AppShell";
import { KpiTile } from "@/components/vw/KpiTile";
import { AlertBanner } from "@/components/vw/AlertBanner";
import { StudyGrid, buildStudyRows } from "@/components/vw/StudyGrid";
import { EmptyState, ErrorState, KpiSkeletonRow, PanelSkeleton, TableSkeleton } from "@/components/vw/Skeletons";
import { useSession } from "@/lib/auth";
import { isReadOnly, SEVERITY_RANK } from "@/lib/roles";
import { pct } from "@/lib/format";
import type { EnrolmentCurve } from "@/types/vitalwatch";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — live trial oversight · VITalWatch" },
      {
        name: "description",
        content:
          "Live portfolio KPIs, severity-ranked alerts and a sortable study grid showing enrolment against plan, activated sites and open SAEs. Synthetic demo data only.",
      },
      { property: "og:title", content: "Portfolio — live trial oversight · VITalWatch" },
      {
        property: "og:description",
        content:
          "Six live KPI tiles, ranked alerts and per-study enrolment progress in one view instead of stale spreadsheets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { effectiveRole } = useSession();
  const readOnly = isReadOnly(effectiveRole);
  const [exportBlocked, setExportBlocked] = useState(false);

  const kpiQuery = useQuery({ queryKey: ["kpi", "portfolio"], queryFn: getPortfolioKpi });
  const alertsQuery = useQuery({ queryKey: ["alerts"], queryFn: listAlerts });
  const studiesQuery = useQuery({ queryKey: ["studies"], queryFn: listStudies });
  const sitesQuery = useQuery({ queryKey: ["sites"], queryFn: () => listSites() });
  const aeQuery = useQuery({ queryKey: ["ae", {}], queryFn: () => listAdverseEvents() });

  const studies = studiesQuery.data ?? [];
  const curvesQuery = useQuery({
    queryKey: ["curves", studies.map((s) => s.id)],
    enabled: studies.length > 0,
    queryFn: async () => {
      const entries = await Promise.all(
        studies.map(async (s) => [s.id, await getEnrolmentCurve(s.id)] as const),
      );
      return Object.fromEntries(entries) as Record<string, EnrolmentCurve>;
    },
  });

  const saeCountByStudy = useMemo(() => {
    const out: Record<string, number> = {};
    for (const ae of aeQuery.data ?? []) {
      if (!ae.serious) continue;
      out[ae.study_id] = (out[ae.study_id] ?? 0) + 1;
    }
    return out;
  }, [aeQuery.data]);

  const rows = useMemo(
    () =>
      buildStudyRows(studies, sitesQuery.data ?? [], saeCountByStudy, curvesQuery.data ?? {}),
    [studies, sitesQuery.data, saeCountByStudy, curvesQuery.data],
  );

  const topAlerts = useMemo(
    () =>
      [...(alertsQuery.data ?? [])]
        .sort(
          (a, b) =>
            SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
            new Date(b.raised_at).getTime() - new Date(a.raised_at).getTime(),
        )
        .slice(0, 8),
    [alertsQuery.data],
  );

  const kpi = kpiQuery.data;

  return (
    <AppShell
      title="Portfolio"
      description="Live status across every study, site and safety signal in the programme."
      actions={
        <button
          type="button"
          onClick={() => {
            if (readOnly) {
              setExportBlocked(true);
              return;
            }
            downloadSdtmHeaderCsv("DM");
          }}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
        >
          <Download className="size-3.5" /> Export DM (CSV header)
        </button>
      }
    >
      {exportBlocked ? (
        <div className="mb-4">
          <ReadOnlyNotice action="trigger data exports" />
        </div>
      ) : null}

      {kpiQuery.isPending ? (
        <KpiSkeletonRow />
      ) : kpiQuery.isError || !kpi ? (
        <ErrorState message="Portfolio KPIs could not be loaded." onRetry={() => kpiQuery.refetch()} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiTile label="Active studies" value={kpi.active_studies} sub="Currently open" />
          <KpiTile
            label="Enrolled vs target"
            value={kpi.enrolled_total}
            sub={`of ${kpi.target_total} · ${pct(kpi.enrolled_total, kpi.target_total)}%`}
          />
          <KpiTile
            label="Sites activated"
            value={kpi.sites_activated}
            sub={`of ${kpi.sites_total} sites`}
          />
          <KpiTile label="Open queries" value={kpi.open_queries} sub="Awaiting site response" />
          <KpiTile
            label="Overdue monitoring visits"
            value={kpi.overdue_monitoring_visits}
            sub="Past visit window"
            variant={kpi.overdue_monitoring_visits > 0 ? "attention" : "neutral"}
          />
          <KpiTile
            label="Open SAEs"
            value={kpi.open_saes}
            sub="Serious adverse events"
            variant={kpi.open_saes > 0 ? "attention" : "neutral"}
          />
        </div>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section>
          <h2 className="mb-2 text-sm font-semibold text-foreground">Studies</h2>
          {studiesQuery.isPending ? (
            <TableSkeleton rows={8} />
          ) : studiesQuery.isError ? (
            <ErrorState message="Studies could not be loaded." onRetry={() => studiesQuery.refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState title="No studies in scope" hint="Nothing is assigned to this role yet." />
          ) : (
            <StudyGrid rows={rows} />
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Alerts <span className="text-muted-foreground">· severity-ranked</span>
          </h2>
          {alertsQuery.isPending ? (
            <PanelSkeleton height="h-72" />
          ) : alertsQuery.isError ? (
            <ErrorState message="Alerts could not be loaded." onRetry={() => alertsQuery.refetch()} />
          ) : topAlerts.length === 0 ? (
            <EmptyState title="No alerts raised" hint="Every rule is currently within tolerance." />
          ) : (
            <div className="space-y-2">
              {topAlerts.map((alert, i) => (
                <AlertBanner key={alert.id} alert={alert} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

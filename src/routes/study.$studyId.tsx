import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import {
  getEnrolmentCurve,
  getStudy,
  getStudyKpi,
  listDeviations,
  listMilestones,
  listQueries,
  listSites,
} from "@/lib/api";
import { AppShell } from "@/components/vw/AppShell";
import { EnrolmentChart } from "@/components/vw/EnrolmentChart";
import { KpiTile } from "@/components/vw/KpiTile";
import {
  DeviationSeverityBadge,
  MilestoneStatusBadge,
  SiteStatusBadge,
  StatusPill,
} from "@/components/vw/Badges";
import {
  EmptyState,
  ErrorState,
  KpiSkeletonRow,
  PanelSkeleton,
  TableSkeleton,
} from "@/components/vw/Skeletons";
import { MILESTONE_LABEL, ROLE_LABEL } from "@/lib/roles";
import { formatDate, humanEnum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Milestone, Role } from "@/types/vitalwatch";

export const Route = createFileRoute("/study/$studyId")({
  head: () => ({
    meta: [
      { title: "Study drill-down — enrolment, milestones, sites · VITalWatch" },
      {
        name: "description",
        content:
          "Per-study view: enrolment against plan, milestone timeline from EC approval to close-out, activated sites, protocol deviations and ageing data queries. Synthetic demo data only.",
      },
      {
        property: "og:title",
        content: "Study drill-down — enrolment, milestones, sites · VITalWatch",
      },
      {
        property: "og:description",
        content:
          "Enrolment curve versus plan, milestone status, site activation and open queries for a single trial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudyPage,
});

const MILESTONE_NODE: Record<Milestone["status"], string> = {
  planned: "bg-muted border-border",
  achieved: "bg-success border-success",
  at_risk: "bg-warning border-warning",
  missed: "bg-critical border-critical",
};

function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const reduced = useReducedMotion();
  if (milestones.length === 0) {
    return <EmptyState title="No milestones planned" hint="Nothing scheduled for this study yet." />;
  }
  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {milestones.map((m, i) => (
        <motion.li
          key={m.id}
          initial={reduced ? { opacity: 1 } : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.06, duration: 0.3 }}
          className="relative"
          title={m.owner_role ? `Accountable: ${ROLE_LABEL[m.owner_role as Role] ?? m.owner_role}` : undefined}
        >
          <span
            aria-hidden
            className={cn(
              "absolute -left-[31px] top-1 size-3 rounded-full border-2",
              MILESTONE_NODE[m.status],
            )}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-foreground">{MILESTONE_LABEL[m.type]}</span>
            <MilestoneStatusBadge status={m.status} />
          </div>
          <p className="mono mt-0.5 text-[11px] text-muted-foreground">
            planned {formatDate(m.planned_date)} · actual {formatDate(m.actual_date)}
            {m.owner_role ? ` · owner ${m.owner_role}` : ""}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}

function StudyPage() {
  const { studyId } = Route.useParams();

  const studyQuery = useQuery({ queryKey: ["study", studyId], queryFn: () => getStudy(studyId) });
  const kpiQuery = useQuery({ queryKey: ["kpi", "study", studyId], queryFn: () => getStudyKpi(studyId) });
  const curveQuery = useQuery({ queryKey: ["curve", studyId], queryFn: () => getEnrolmentCurve(studyId) });
  const sitesQuery = useQuery({ queryKey: ["sites", studyId], queryFn: () => listSites(studyId) });
  const milestonesQuery = useQuery({
    queryKey: ["milestones", studyId],
    queryFn: () => listMilestones(studyId),
  });
  const deviationsQuery = useQuery({
    queryKey: ["deviations", studyId],
    queryFn: () => listDeviations(studyId),
  });
  const queriesQuery = useQuery({
    queryKey: ["queries", studyId],
    queryFn: () => listQueries(studyId),
  });

  const study = studyQuery.data;
  const kpi = kpiQuery.data;
  const openQueries = (queriesQuery.data ?? []).filter((q) => q.status === "open");

  return (
    <AppShell
      title={study ? study.title : "Study"}
      description={study ? `${study.therapeutic_area} · Phase ${study.phase}` : "Loading study…"}
    >
      {studyQuery.isPending ? (
        <PanelSkeleton height="h-24" />
      ) : studyQuery.isError || !study ? (
        <ErrorState message="This study could not be loaded." onRetry={() => studyQuery.refetch()} />
      ) : (
        <section className="rounded-lg border border-border glass p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Study</p>
              <p className="mono text-sm text-foreground">{study.id}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Protocol</p>
              <p className="mono text-sm text-foreground">{study.protocol_no}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">CTRI</p>
              {study.ctri_number ? (
                <p className="mono text-sm text-foreground">{study.ctri_number}</p>
              ) : (
                <p className="inline-flex items-center gap-1.5 rounded-md border border-warning/50 bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
                  <AlertTriangle className="size-3.5" /> Not yet registered
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Status</p>
              <StatusPill status={study.status} />
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Principal Investigator
              </p>
              <p className="mono text-sm text-foreground">{study.pi_id}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">EC validity</p>
              <p className="mono text-sm text-foreground">
                {formatDate(study.ec_approval_date)} → {formatDate(study.ec_expiry_date)}
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="mt-4">
        {kpiQuery.isPending ? (
          <KpiSkeletonRow count={6} />
        ) : kpiQuery.isError || !kpi ? (
          <ErrorState message="Study KPIs could not be loaded." onRetry={() => kpiQuery.refetch()} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <KpiTile label="Enrolled" value={kpi.enrolled} sub={`of ${kpi.target} target`} />
            <KpiTile
              label="Enrolment"
              value={kpi.enrolment_pct}
              suffix="%"
              sub={`expected ${kpi.expected_by_today} by today`}
              variant={kpi.enrolled < kpi.expected_by_today ? "attention" : "neutral"}
            />
            <KpiTile
              label="Screen failure rate"
              value={kpi.screen_failure_rate}
              suffix="%"
              sub="Screened but not enrolled"
            />
            <KpiTile
              label="Visit compliance"
              value={kpi.visit_compliance_pct}
              suffix="%"
              sub="Visits inside window"
            />
            <KpiTile
              label="Open queries"
              value={kpi.open_queries}
              sub={`avg age ${kpi.open_query_ageing_days}d`}
              variant={kpi.open_query_ageing_days > 14 ? "attention" : "neutral"}
            />
            <KpiTile
              label="Open SAEs"
              value={kpi.open_saes}
              sub={kpi.next_milestone ? `Next: ${kpi.next_milestone}` : "No upcoming milestone"}
              variant={kpi.open_saes > 0 ? "attention" : "neutral"}
            />
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg border border-border glass p-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            Enrolment vs plan <span className="text-muted-foreground">· actual, expected, target</span>
          </h2>
          {curveQuery.isPending ? (
            <PanelSkeleton height="h-64" />
          ) : curveQuery.isError || !curveQuery.data ? (
            <ErrorState
              message="The enrolment curve could not be loaded."
              onRetry={() => curveQuery.refetch()}
            />
          ) : (
            <EnrolmentChart curve={curveQuery.data} />
          )}
        </section>

        <section className="rounded-lg border border-border glass p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Milestones</h2>
          {milestonesQuery.isPending ? (
            <PanelSkeleton height="h-64" />
          ) : milestonesQuery.isError ? (
            <ErrorState
              message="Milestones could not be loaded."
              onRetry={() => milestonesQuery.refetch()}
            />
          ) : (
            <MilestoneTimeline milestones={milestonesQuery.data} />
          )}
        </section>
      </div>

      <section className="mt-4">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Sites</h2>
        {sitesQuery.isPending ? (
          <TableSkeleton rows={5} />
        ) : sitesQuery.isError ? (
          <ErrorState message="Sites could not be loaded." onRetry={() => sitesQuery.refetch()} />
        ) : sitesQuery.data.length === 0 ? (
          <EmptyState title="No sites attached" hint="This study has no participating sites yet." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border glass">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="border-b border-border glass-soft">
                <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-3 py-2 text-left">Site</th>
                  <th className="px-3 py-2 text-left">City / state</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Site PI</th>
                  <th className="px-3 py-2 text-right">Capacity</th>
                  <th className="px-3 py-2 text-left">Activated</th>
                </tr>
              </thead>
              <tbody>
                {sitesQuery.data.map((site) => (
                  <tr key={site.id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5 text-foreground">
                      {site.name}
                      <span className="mono ml-2 text-[11px] text-muted-foreground">{site.id}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {site.city}, {site.state}
                    </td>
                    <td className="px-3 py-2.5">
                      <SiteStatusBadge status={site.status} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground/90">{site.pi_name}</td>
                    <td className="mono px-3 py-2.5 text-right text-xs">{site.capacity}</td>
                    <td className="mono px-3 py-2.5 text-xs text-muted-foreground">
                      {formatDate(site.activated_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border glass p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Protocol deviations{" "}
            <span className="mono text-xs text-muted-foreground">
              {deviationsQuery.data ? `· ${deviationsQuery.data.length}` : ""}
            </span>
          </h2>
          {deviationsQuery.isPending ? (
            <PanelSkeleton height="h-40" />
          ) : deviationsQuery.isError ? (
            <ErrorState
              message="Deviations could not be loaded."
              onRetry={() => deviationsQuery.refetch()}
            />
          ) : deviationsQuery.data.length === 0 ? (
            <EmptyState title="No deviations recorded" hint="Nothing reported for this study." />
          ) : (
            <ul className="space-y-2">
              {deviationsQuery.data.slice(0, 6).map((d) => (
                <li key={d.id} className="rounded-md border border-border p-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono text-[11px] text-muted-foreground">{d.id}</span>
                    <DeviationSeverityBadge severity={d.severity} />
                    <span className="text-xs text-muted-foreground">{formatDate(d.detected_date)}</span>
                    {!d.reported_to_ec ? (
                      <span className="text-[11px] font-medium text-warning">not reported to EC</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">{d.description}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{humanEnum(d.category)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-border glass p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Open data queries{" "}
            <span className="mono text-xs text-muted-foreground">· {openQueries.length}</span>
          </h2>
          {queriesQuery.isPending ? (
            <PanelSkeleton height="h-40" />
          ) : queriesQuery.isError ? (
            <ErrorState message="Queries could not be loaded." onRetry={() => queriesQuery.refetch()} />
          ) : openQueries.length === 0 ? (
            <EmptyState title="No open queries" hint="Every raised query has been answered or closed." />
          ) : (
            <ul className="space-y-2">
              {openQueries.slice(0, 6).map((q) => (
                <li key={q.id} className="flex items-start gap-3 rounded-md border border-border p-2.5">
                  <span
                    className={cn(
                      "mono rounded-md border px-2 py-1 text-xs font-semibold",
                      q.age_days >= 30
                        ? "border-critical/50 bg-critical-soft text-critical"
                        : q.age_days >= 14
                          ? "border-warning/50 bg-warning-soft text-warning"
                          : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {q.age_days}d
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground/90">{q.question}</p>
                    <p className="mono mt-0.5 truncate text-[11px] text-muted-foreground">
                      {q.id} · {q.field} · raised {formatDate(q.raised_date)} by {q.raised_by}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

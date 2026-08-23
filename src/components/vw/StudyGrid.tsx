import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDY_STATUS_LABEL, STUDY_STATUS_ORDER } from "@/lib/roles";
import { ProgressBar, StatusPill } from "@/components/vw/Badges";
import type { Site, Study, StudyStatus } from "@/types/vitalwatch";
import type { EnrolmentCurve } from "@/types/vitalwatch";

type SortKey = "id" | "title" | "phase" | "status" | "therapeutic_area" | "enrolment" | "sites" | "saes";

export interface StudyGridRow {
  study: Study;
  sitesActivated: number;
  openSaes: number;
  /** Actual enrolment is behind the expected curve for today. */
  lagging: boolean;
}

export function buildStudyRows(
  studies: Study[],
  sites: Site[],
  saeCountByStudy: Record<string, number>,
  curves: Record<string, EnrolmentCurve | undefined>,
): StudyGridRow[] {
  return studies.map((study) => {
    const curve = curves[study.id];
    const expected = curve ? (curve.expected[curve.expected.length - 1] ?? 0) : 0;
    return {
      study,
      sitesActivated: sites.filter(
        (s) => study.site_ids.includes(s.id) && s.status === "activated",
      ).length,
      openSaes: saeCountByStudy[study.id] ?? 0,
      lagging: expected > 0 && study.actual_enrolment < expected * 0.85,
    };
  });
}

export function StudyGrid({ rows }: { rows: StudyGridRow[] }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [asc, setAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StudyStatus | "all">("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  const areas = useMemo(
    () => [...new Set(rows.map((r) => r.study.therapeutic_area))].sort(),
    [rows],
  );

  const visible = useMemo(() => {
    const filtered = rows.filter(
      (r) =>
        (statusFilter === "all" || r.study.status === statusFilter) &&
        (areaFilter === "all" || r.study.therapeutic_area === areaFilter),
    );
    const dir = asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "title":
          return a.study.title.localeCompare(b.study.title) * dir;
        case "phase":
          return a.study.phase.localeCompare(b.study.phase) * dir;
        case "status":
          return (
            (STUDY_STATUS_ORDER.indexOf(a.study.status) -
              STUDY_STATUS_ORDER.indexOf(b.study.status)) *
            dir
          );
        case "therapeutic_area":
          return a.study.therapeutic_area.localeCompare(b.study.therapeutic_area) * dir;
        case "enrolment":
          return (
            (a.study.actual_enrolment / Math.max(1, a.study.target_enrolment) -
              b.study.actual_enrolment / Math.max(1, b.study.target_enrolment)) *
            dir
          );
        case "sites":
          return (a.sitesActivated - b.sitesActivated) * dir;
        case "saes":
          return (a.openSaes - b.openSaes) * dir;
        default:
          return a.study.id.localeCompare(b.study.id) * dir;
      }
    });
  }, [rows, sortKey, asc, statusFilter, areaFilter]);

  const header = (key: SortKey, label: string, className?: string) => (
    <th className={cn("px-3 py-2 text-left", className)}>
      <button
        type="button"
        onClick={() => {
          if (sortKey === key) setAsc((v) => !v);
          else {
            setSortKey(key);
            setAsc(true);
          }
        }}
        className="inline-flex items-center gap-1 text-xs tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        {label}
        {sortKey === key ? (
          asc ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : null}
      </button>
    </th>
  );

  return (
    <section className="rounded-lg border border-border glass">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Studies</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StudyStatus | "all")}
            className="rounded-md border border-input bg-surface-2 px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All statuses</option>
            {STUDY_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STUDY_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by therapeutic area"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-md border border-input bg-surface-2 px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All therapeutic areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          No studies match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead className="border-b border-border glass-soft">
              <tr>
                {header("id", "ID")}
                {header("title", "Title")}
                {header("phase", "Phase")}
                {header("status", "Status")}
                {header("therapeutic_area", "Area")}
                {header("enrolment", "Enrolment")}
                {header("sites", "Sites")}
                {header("saes", "Open SAEs")}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <motion.tr
                  key={row.study.id}
                  initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduced ? 0 : i * 0.03 }}
                  onClick={() =>
                    navigate({ to: "/study/$studyId", params: { studyId: row.study.id } })
                  }
                  className={cn(
                    "cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/50",
                    row.lagging && "bg-warning-soft/25",
                  )}
                >
                  <td className="mono px-3 py-2.5 text-xs whitespace-nowrap text-muted-foreground">
                    {row.study.id}
                  </td>
                  <td className="max-w-[320px] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-foreground">{row.study.title}</span>
                      {row.lagging ? (
                        <span
                          title="Behind the expected enrolment curve"
                          className="inline-flex items-center gap-1 rounded border border-warning/40 bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-warning"
                        >
                          <TrendingDown className="size-3" /> Lagging
                        </span>
                      ) : null}
                    </div>
                    <span className="mono text-[11px] text-muted-foreground">
                      {row.study.protocol_no}
                    </span>
                  </td>
                  <td className="mono px-3 py-2.5 text-xs">{row.study.phase}</td>
                  <td className="px-3 py-2.5">
                    <StatusPill status={row.study.status} />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {row.study.therapeutic_area}
                  </td>
                  <td className="w-40 px-3 py-2.5">
                    <div className="mono flex items-center justify-between text-xs">
                      <span className="text-foreground">
                        {row.study.actual_enrolment}/{row.study.target_enrolment}
                      </span>
                      <span className="text-muted-foreground">
                        {row.study.target_enrolment
                          ? Math.round(
                              (row.study.actual_enrolment / row.study.target_enrolment) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar
                        value={row.study.actual_enrolment}
                        total={row.study.target_enrolment}
                        attention={row.lagging}
                      />
                    </div>
                  </td>
                  <td className="mono px-3 py-2.5 text-xs">
                    {row.sitesActivated}/{row.study.site_ids.length}
                  </td>
                  <td
                    className={cn(
                      "mono px-3 py-2.5 text-xs",
                      row.openSaes > 0 ? "text-warning" : "text-muted-foreground",
                    )}
                  >
                    {row.openSaes}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

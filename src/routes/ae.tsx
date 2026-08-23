import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";
import {
  getSignals,
  listAdverseEvents,
  listSites,
  listStudies,
  reportAdverseEvent,
  suggestCoding,
} from "@/lib/api";
import { AppShell, ReadOnlyNotice } from "@/components/vw/AppShell";
import { TimelineClock } from "@/components/vw/TimelineClock";
import { SignalTable } from "@/components/vw/SignalTable";
import {
  AeSeverityBadge,
  CodingSourceBadge,
  TimelineStatusBadge,
} from "@/components/vw/Badges";
import {
  EmptyState,
  ErrorState,
  PanelSkeleton,
  TableSkeleton,
} from "@/components/vw/Skeletons";
import { useSession } from "@/lib/auth";
import { isReadOnly, TIMELINE_THRESHOLDS } from "@/lib/roles";
import { formatDate, humanEnum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AdverseEvent,
  AdverseEventCreate,
  AECausality,
  AEOutcome,
  AESeverity,
  CodingCandidate,
} from "@/types/vitalwatch";

export const Route = createFileRoute("/ae")({
  head: () => ({
    meta: [
      { title: "Pharmacovigilance — AE intake & signals · VITalWatch" },
      {
        name: "description",
        content:
          "Report adverse events with live coding suggestions, watch 24-hour and 14-day SAE reporting deadlines tick down, and review DSMB term signals. Synthetic demo data only.",
      },
      { property: "og:title", content: "Pharmacovigilance — AE intake & signals · VITalWatch" },
      {
        property: "og:description",
        content:
          "AE intake with assisted coding, live SAE countdown clocks and aggregated term signals for DSMB review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PharmacovigilancePage,
});

const SEVERITIES: AESeverity[] = ["mild", "moderate", "severe"];
const CAUSALITIES: AECausality[] = [
  "unrelated",
  "unlikely",
  "possible",
  "probable",
  "certain",
];
const OUTCOMES: AEOutcome[] = [
  "recovered",
  "recovering",
  "not_recovered",
  "recovered_with_sequelae",
  "fatal",
  "unknown",
];

const field =
  "w-full rounded-md border border-input bg-surface-2 px-2.5 py-1.5 text-sm text-foreground";
const labelClass = "text-[11px] font-medium tracking-wide text-muted-foreground uppercase";

function IntakeForm({
  readOnly,
  onBlocked,
  onCreated,
}: {
  readOnly: boolean;
  onBlocked: () => void;
  onCreated: (ae: AdverseEvent) => void;
}) {
  const queryClient = useQueryClient();
  const studiesQuery = useQuery({ queryKey: ["studies"], queryFn: listStudies });
  const sitesQuery = useQuery({ queryKey: ["sites", "all"], queryFn: () => listSites() });

  const [studyId, setStudyId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [narrative, setNarrative] = useState("");
  const [onsetDate, setOnsetDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [serious, setSerious] = useState(false);
  const [severity, setSeverity] = useState<AESeverity>("moderate");
  const [causality, setCausality] = useState<AECausality>("possible");
  const [outcome, setOutcome] = useState<AEOutcome>("recovering");
  const [suspectDrug, setSuspectDrug] = useState("");
  const [accepted, setAccepted] = useState<CodingCandidate | null>(null);
  const [candidates, setCandidates] = useState<CodingCandidate[]>([]);
  const [coding, setCoding] = useState(false);

  useEffect(() => {
    const first = studiesQuery.data?.[0];
    if (first && !studyId) setStudyId(first.id);
  }, [studiesQuery.data, studyId]);

  const studySites = useMemo(
    () => (sitesQuery.data ?? []).filter((s) => s.study_ids.includes(studyId)),
    [sitesQuery.data, studyId],
  );

  useEffect(() => {
    const first = studySites[0];
    if (first && !studySites.some((s) => s.id === siteId)) setSiteId(first.id);
  }, [studySites, siteId]);

  /** Debounced coding suggestions as the narrative is typed. */
  useEffect(() => {
    const text = narrative.trim();
    if (text.length < 4) {
      setCandidates([]);
      return;
    }
    let cancelled = false;
    setCoding(true);
    const id = window.setTimeout(() => {
      suggestCoding(text)
        .then((res) => {
          if (!cancelled) setCandidates(res.candidates);
        })
        .catch(() => {
          if (!cancelled) setCandidates([]);
        })
        .finally(() => {
          if (!cancelled) setCoding(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [narrative]);

  const mutation = useMutation({
    mutationFn: (payload: AdverseEventCreate) => reportAdverseEvent(payload),
    onSuccess: (created) => {
      onCreated(created);
      setNarrative("");
      setSubjectCode("");
      setAccepted(null);
      setCandidates([]);
      void queryClient.invalidateQueries({ queryKey: ["ae"] });
      void queryClient.invalidateQueries({ queryKey: ["signals"] });
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });

  const submit = () => {
    if (readOnly) {
      onBlocked();
      return;
    }
    mutation.mutate({
      study_id: studyId,
      site_id: siteId,
      subject_code: subjectCode.trim(),
      narrative: narrative.trim(),
      onset_date: onsetDate,
      serious,
      severity,
      causality,
      outcome,
      suspect_drug: suspectDrug.trim() || null,
      coded_term: accepted?.term ?? null,
      coded_code: accepted?.code ?? null,
    });
  };

  const valid = studyId && siteId && subjectCode.trim() && narrative.trim().length > 3;

  if (studiesQuery.isPending || sitesQuery.isPending) return <PanelSkeleton height="h-96" />;
  if (studiesQuery.isError || sitesQuery.isError) {
    return (
      <ErrorState
        message="The intake form could not load studies and sites."
        onRetry={() => {
          void studiesQuery.refetch();
          void sitesQuery.refetch();
        }}
      />
    );
  }

  return (
    <section className="rounded-lg border border-border glass p-4">
      <h2 className="text-sm font-semibold text-foreground">Report an adverse event</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Subjects are pseudonymous — use the subject code only, never a name.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={labelClass}>Study</span>
          <select value={studyId} onChange={(e) => setStudyId(e.target.value)} className={field}>
            {(studiesQuery.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Site</span>
          <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className={field}>
            {studySites.length === 0 ? <option value="">No sites for this study</option> : null}
            {studySites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Subject code</span>
          <input
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            placeholder="e.g. S-0142"
            className={cn(field, "mono")}
          />
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Onset date</span>
          <input
            type="date"
            value={onsetDate}
            onChange={(e) => setOnsetDate(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <label className="mt-3 block space-y-1">
        <span className={labelClass}>Narrative</span>
        <textarea
          rows={3}
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder="Describe the event in clinical terms…"
          className={cn(field, "resize-y")}
        />
      </label>

      <div className="mt-2 rounded-md border border-dashed border-border glass p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {coding ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5 text-primary" />
          )}
          Coding suggestions — provenance is always labelled. This demo uses a curated term set and
          semantic matching; no licensed dictionary (MedDRA/WHODrug) is in use.
        </div>
        <AnimatePresence initial={false}>
          {candidates.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {narrative.trim().length < 4
                ? "Start typing a narrative to see candidate terms."
                : "No candidate terms matched — the event will be filed as uncoded."}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {candidates.map((c) => (
                <motion.button
                  key={`${c.code}-${c.term}`}
                  type="button"
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setAccepted(c)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors",
                    accepted?.code === c.code
                      ? "border-primary bg-primary-muted/50 text-foreground"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  <span className="block font-medium text-foreground">{c.term}</span>
                  <span className="mono block text-[11px] text-muted-foreground">
                    {c.code} · confidence {Math.round(c.score * 100)}% ·{" "}
                    {c.source === "semantic" ? "semantic match" : "curated term set"}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
        {accepted ? (
          <p className="mt-2 text-xs text-foreground">
            Accepted coded term: <span className="mono">{accepted.term}</span> (
            <span className="mono">{accepted.code}</span>){" "}
            <button
              type="button"
              onClick={() => setAccepted(null)}
              className="ml-1 text-primary hover:underline"
            >
              clear
            </button>
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1">
          <span className={labelClass}>Severity</span>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as AESeverity)}
            className={field}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {humanEnum(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Causality (WHO-UMC)</span>
          <select
            value={causality}
            onChange={(e) => setCausality(e.target.value as AECausality)}
            className={field}
          >
            {CAUSALITIES.map((c) => (
              <option key={c} value={c}>
                {humanEnum(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Outcome</span>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as AEOutcome)}
            className={field}
          >
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {humanEnum(o)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelClass}>Suspect drug</span>
          <input
            value={suspectDrug}
            onChange={(e) => setSuspectDrug(e.target.value)}
            placeholder="Optional"
            className={field}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={serious}
            onChange={(e) => setSerious(e.target.checked)}
            className="size-4 accent-[var(--color-critical)]"
          />
          Serious (SAE) — starts the 24-hour and 14-day reporting clocks
        </label>
        <button
          type="button"
          disabled={!valid || mutation.isPending}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Submit adverse event
        </button>
      </div>
      {mutation.isError ? (
        <p className="mt-2 text-xs text-critical">
          The adverse event could not be filed. Check the form and try again.
        </p>
      ) : null}
    </section>
  );
}

function AeTable({ events }: { events: AdverseEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No adverse events match these filters"
        hint="Clear the study or seriousness filter to see the full log."
      />
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border glass">
      <table className="w-full min-w-[1040px] border-collapse text-sm">
        <thead className="border-b border-border glass-soft">
          <tr className="text-xs tracking-wide text-muted-foreground uppercase">
            <th className="px-3 py-2 text-left">Study</th>
            <th className="px-3 py-2 text-left">Subject</th>
            <th className="px-3 py-2 text-left">Onset</th>
            <th className="px-3 py-2 text-left">Serious</th>
            <th className="px-3 py-2 text-left">Severity</th>
            <th className="px-3 py-2 text-left">Coded term</th>
            <th className="px-3 py-2 text-left">Causality</th>
            <th className="px-3 py-2 text-left">Outcome</th>
            <th className="px-3 py-2 text-left">Timeline</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ae) => (
            <tr key={ae.id} className="border-b border-border/70 last:border-0">
              <td className="mono px-3 py-2.5 text-xs text-muted-foreground">{ae.study_id}</td>
              <td className="mono px-3 py-2.5 text-xs text-foreground">{ae.subject_code}</td>
              <td className="mono px-3 py-2.5 text-xs text-muted-foreground">
                {formatDate(ae.onset_date)}
              </td>
              <td className="px-3 py-2.5">
                {ae.serious ? (
                  <span className="rounded border border-critical/50 bg-critical-soft px-1.5 py-0.5 text-[10px] font-semibold text-critical">
                    SAE
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">no</span>
                )}
              </td>
              <td className="px-3 py-2.5">
                <AeSeverityBadge severity={ae.severity} />
              </td>
              <td className="px-3 py-2.5">
                {ae.coded_term ? (
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-foreground">{ae.coded_term}</span>
                    <CodingSourceBadge source={ae.coding_source} />
                  </span>
                ) : (
                  <span className="rounded border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    uncoded
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                {humanEnum(ae.causality)}
              </td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                {humanEnum(ae.outcome)}
              </td>
              <td className="px-3 py-2.5">
                <TimelineStatusBadge status={ae.timeline_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PharmacovigilancePage() {
  const { effectiveRole } = useSession();
  const readOnly = isReadOnly(effectiveRole);
  const reduced = useReducedMotion();

  const [tab, setTab] = useState<"intake" | "signals">("intake");
  const [blocked, setBlocked] = useState(false);
  const [studyFilter, setStudyFilter] = useState<string>("all");
  const [seriousOnly, setSeriousOnly] = useState(false);
  const [justFiled, setJustFiled] = useState<AdverseEvent | null>(null);

  const studiesQuery = useQuery({ queryKey: ["studies"], queryFn: listStudies });
  const aeQuery = useQuery({
    queryKey: ["ae", { studyFilter, seriousOnly }],
    queryFn: () =>
      listAdverseEvents({
        ...(studyFilter === "all" ? {} : { studyId: studyFilter }),
        ...(seriousOnly ? { serious: true } : {}),
      }),
  });
  const signalsQuery = useQuery({
    queryKey: ["signals", studyFilter],
    queryFn: () => (studyFilter === "all" ? getSignals() : getSignals(studyFilter)),
  });

  return (
    <AppShell
      title="Pharmacovigilance"
      description="Adverse event intake, assisted coding, reporting deadlines and DSMB term signals."
      actions={
        <div className="flex items-center gap-1 rounded-md border border-border glass p-0.5">
          {(["intake", "signals"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                tab === key
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {key === "intake" ? "Intake & log" : "DSMB signals"}
            </button>
          ))}
        </div>
      }
    >
      {blocked ? (
        <div className="mb-4">
          <ReadOnlyNotice action="file adverse events" />
        </div>
      ) : null}

      {tab === "intake" ? (
        <div className="space-y-4">
          <IntakeForm
            readOnly={readOnly}
            onBlocked={() => setBlocked(true)}
            onCreated={(ae) => setJustFiled(ae)}
          />

          <AnimatePresence>
            {justFiled && justFiled.serious && justFiled.deadline_24h && justFiled.deadline_14d ? (
              <motion.section
                key={justFiled.id}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-critical/40 glass p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    SAE <span className="mono">{justFiled.id}</span> filed — reporting clocks running
                  </h2>
                  <button
                    type="button"
                    onClick={() => setJustFiled(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <TimelineClock
                    label="24-hour initial report"
                    deadline={justFiled.deadline_24h}
                    dueSoonHours={TIMELINE_THRESHOLDS.dueSoonHours24h}
                    hint="Initial notification to the Ethics Committee and licensing authority."
                  />
                  <TimelineClock
                    label="14-day narrative"
                    deadline={justFiled.deadline_14d}
                    dueSoonHours={TIMELINE_THRESHOLDS.dueSoonHours14d}
                    hint="Full narrative and causality assessment submission."
                  />
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>

          <section>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Adverse event log</h2>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter by study"
                  value={studyFilter}
                  onChange={(e) => setStudyFilter(e.target.value)}
                  className="rounded-md border border-input bg-surface-2 px-2 py-1 text-xs text-foreground"
                >
                  <option value="all">All studies</option>
                  {(studiesQuery.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={seriousOnly}
                    onChange={(e) => setSeriousOnly(e.target.checked)}
                    className="size-3.5 accent-[var(--color-critical)]"
                  />
                  Serious only
                </label>
              </div>
            </div>
            {aeQuery.isPending ? (
              <TableSkeleton rows={8} />
            ) : aeQuery.isError ? (
              <ErrorState
                message="Adverse events could not be loaded."
                onRetry={() => aeQuery.refetch()}
              />
            ) : (
              <AeTable events={aeQuery.data} />
            )}
          </section>
        </div>
      ) : (
        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">DSMB term signals</h2>
              <p className="text-xs text-muted-foreground">
                Adverse events aggregated by coded term, ranked by frequency.
              </p>
            </div>
            <select
              aria-label="Filter signals by study"
              value={studyFilter}
              onChange={(e) => setStudyFilter(e.target.value)}
              className="rounded-md border border-input bg-surface-2 px-2 py-1 text-xs text-foreground"
            >
              <option value="all">All studies</option>
              {(studiesQuery.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}
                </option>
              ))}
            </select>
          </div>
          {signalsQuery.isPending ? (
            <TableSkeleton rows={8} />
          ) : signalsQuery.isError ? (
            <ErrorState
              message="Term signals could not be loaded."
              onRetry={() => signalsQuery.refetch()}
            />
          ) : (
            <SignalTable signals={signalsQuery.data} />
          )}
        </section>
      )}
    </AppShell>
  );
}

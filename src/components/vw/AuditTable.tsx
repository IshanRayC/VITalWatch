import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Ban,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FilePlus2,
  FileSignature,
  Link2,
  LogIn,
  Pencil,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AUDIT_ACTION_LABEL } from "@/lib/roles";
import { formatUtcTimestamp } from "@/lib/format";
import { ActorRoleBadge } from "@/components/vw/RoleBadge";
import type { AuditAction, AuditEvent, ChainVerification } from "@/types/vitalwatch";

const ACTION_META: Record<
  AuditAction,
  { icon: typeof Eye; className: string }
> = {
  create: { icon: FilePlus2, className: "text-success" },
  update: { icon: Pencil, className: "text-info" },
  delete: { icon: Trash2, className: "text-critical" },
  login: { icon: LogIn, className: "text-primary" },
  login_failed: { icon: XCircle, className: "text-warning" },
  view: { icon: Eye, className: "text-muted-foreground" },
  export: { icon: Download, className: "text-info" },
  acknowledge: { icon: CheckCircle2, className: "text-success" },
  sign: { icon: FileSignature, className: "text-primary" },
  access_denied: { icon: Ban, className: "text-critical" },
};

function DiffViewer({
  before,
  after,
}: {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];
  const changed = (k: string) =>
    JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]);

  if (keys.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No structured payload recorded for this event (read-only action).
      </p>
    );
  }

  const render = (obj: Record<string, unknown> | null, side: "before" | "after") => (
    <div className="rounded-md border border-border bg-surface-2/60 p-3">
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {side}
      </p>
      {obj === null ? (
        <p className="mono text-xs text-muted-foreground">null</p>
      ) : (
        <dl className="space-y-1">
          {keys.map((k) => (
            <div
              key={k}
              className={cn(
                "mono flex gap-2 rounded px-1 py-0.5 text-xs",
                changed(k) &&
                  (side === "before"
                    ? "bg-critical-soft/50 text-critical"
                    : "bg-success-soft/50 text-success"),
              )}
            >
              <dt className="shrink-0 opacity-80">{k}:</dt>
              <dd className="break-all">
                {k in (obj ?? {}) ? JSON.stringify(obj?.[k]) : "—"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {render(before, "before")}
      {render(after, "after")}
    </div>
  );
}

export function AuditTable({
  events,
  verify,
}: {
  events: AuditEvent[];
  verify: () => Promise<ChainVerification>;
}) {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [walkingSeq, setWalkingSeq] = useState<number | null>(null);
  const [result, setResult] = useState<ChainVerification | null>(null);
  const [verifying, setVerifying] = useState(false);

  const ordered = useMemo(() => [...events].sort((a, b) => a.seq - b.seq), [events]);

  useEffect(() => {
    if (!verifying) return;
    let cancelled = false;
    let i = 0;
    const stepMs = reduced ? 0 : Math.max(24, 900 / Math.max(1, ordered.length));

    const run = async () => {
      const verification = await verify();
      if (cancelled) return;
      const stopAt =
        verification.broken_at !== null
          ? ordered.findIndex((e) => e.seq === verification.broken_at) + 1
          : ordered.length;

      const tick = () => {
        if (cancelled) return;
        if (i >= stopAt) {
          setWalkingSeq(null);
          setResult(verification);
          setVerifying(false);
          return;
        }
        setWalkingSeq(ordered[i]!.seq);
        i += 1;
        window.setTimeout(tick, stepMs);
      };
      tick();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [verifying, ordered, verify, reduced]);

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Audit trail</h2>
          <p className="text-xs text-muted-foreground">
            Append-only hash chain · all timestamps in UTC
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {result ? (
              <motion.span
                key={result.ok ? "pass" : "fail"}
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold",
                  result.ok
                    ? "border-success/50 bg-success-soft text-success"
                    : "border-critical/60 bg-critical-soft text-critical",
                )}
              >
                {result.ok ? (
                  <>
                    <CheckCircle2 className="size-4" /> CHAIN INTACT — {result.checked} entries
                    verified
                  </>
                ) : (
                  <>
                    <ShieldAlert className="size-4" /> CHAIN BROKEN at sequence #
                    {result.broken_at} ({result.checked} entries checked)
                  </>
                )}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <button
            type="button"
            disabled={verifying}
            onClick={() => {
              setResult(null);
              setVerifying(true);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Link2 className={cn("size-4", verifying && "animate-pulse")} />
            {verifying ? "Walking chain…" : "Verify chain"}
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">
          No audit events match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-sm">
            <thead className="border-b border-border bg-surface-2/60">
              <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                <th className="w-10 px-3 py-2" />
                <th className="px-3 py-2 text-left">Seq</th>
                <th className="px-3 py-2 text-left">Timestamp (UTC)</th>
                <th className="px-3 py-2 text-left">Actor</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Resource</th>
                <th className="px-3 py-2 text-left">Hash</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const meta = ACTION_META[event.action];
                const Icon = meta.icon;
                const walking = walkingSeq === event.seq;
                const isOpen = expanded === event.id;
                return (
                  <Fragment key={event.id}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : event.id)}
                      className={cn(
                        "cursor-pointer border-b border-border/70 transition-colors hover:bg-secondary/40",
                        walking && "bg-primary-muted/40",
                        result?.broken_at === event.seq && "bg-critical-soft/60",
                      )}
                    >
                      <td className="px-3 py-2 align-top">
                        <ChevronRight
                          className={cn(
                            "size-4 text-muted-foreground transition-transform",
                            isOpen && "rotate-90",
                          )}
                        />
                      </td>
                      <td className="mono px-3 py-2 text-xs text-muted-foreground">
                        #{event.seq}
                      </td>
                      <td className="mono px-3 py-2 text-xs whitespace-nowrap text-foreground/90">
                        {formatUtcTimestamp(event.timestamp_utc)}
                      </td>
                      <td className="mono px-3 py-2 text-xs">{event.actor_id}</td>
                      <td className="px-3 py-2">
                        <ActorRoleBadge role={event.actor_role} />
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn("inline-flex items-center gap-1.5 text-xs", meta.className)}>
                          <Icon className="size-3.5" />
                          {AUDIT_ACTION_LABEL[event.action]}
                        </span>
                      </td>
                      <td className="mono px-3 py-2 text-xs text-muted-foreground">
                        {event.resource_type}
                        {event.resource_id ? `:${event.resource_id}` : ""}
                      </td>
                      <td className="mono max-w-[150px] truncate px-3 py-2 text-xs text-muted-foreground">
                        {event.hash.slice(0, 16)}…
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr key={`${event.id}-detail`} className="border-b border-border/70 bg-surface-2/40">
                        <td />
                        <td colSpan={7} className="px-3 pt-1 pb-4">
                          <DiffViewer before={event.before} after={event.after} />
                          <dl className="mono mt-3 grid gap-1 text-[11px] text-muted-foreground md:grid-cols-2">
                            <div className="break-all">prev_hash: {event.prev_hash}</div>
                            <div className="break-all">hash: {event.hash}</div>
                            <div>reason: {event.reason ?? "—"}</div>
                            <div>event id: {event.id}</div>
                          </dl>
                        </td>
                      </tr>
                    ) : null}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

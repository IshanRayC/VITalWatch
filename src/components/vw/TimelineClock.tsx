import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AlertOctagon, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { breakdownDuration, formatUtcTimestamp } from "@/lib/format";

export type ClockState = "on_track" | "due_soon" | "breached";

export interface TimelineClockProps {
  label: string;
  /** ISO deadline computed server-side; ticked client-side between fetches. */
  deadline: string;
  /** Hours before the deadline at which the clock turns amber. Configurable. */
  dueSoonHours: number;
  hint?: string;
}

export function TimelineClock({ label, deadline, dueSoonHours, hint }: TimelineClockProps) {
  const reduced = useReducedMotion();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = new Date(deadline).getTime() - now;
  const state: ClockState =
    remainingMs <= 0
      ? "breached"
      : remainingMs <= dueSoonHours * 3_600_000
        ? "due_soon"
        : "on_track";
  const parts = breakdownDuration(remainingMs);

  const style: Record<ClockState, string> = {
    on_track: "border-success/40 bg-success-soft/40 text-success",
    due_soon: "border-warning/50 bg-warning-soft/50 text-warning",
    breached: "border-critical/60 bg-critical-soft/50 text-critical",
  };
  const Icon = state === "breached" ? AlertOctagon : state === "due_soon" ? Clock : ShieldCheck;
  const statusCopy: Record<ClockState, string> = {
    on_track: "Within deadline",
    due_soon: `Due within ${dueSoonHours}h`,
    breached: "BREACHED",
  };

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-lg border p-4 transition-colors", style[state])}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
          <Icon className="size-3.5" /> {statusCopy[state]}
        </span>
      </div>
      <p className="mono mt-2 text-2xl leading-none font-semibold">
        {parts.negative ? "-" : ""}
        {parts.days > 0 ? `${parts.days}d ` : ""}
        {String(parts.hours).padStart(2, "0")}:{String(parts.minutes).padStart(2, "0")}:
        {String(parts.seconds).padStart(2, "0")}
      </p>
      <p className="mono mt-2 text-[11px] opacity-80">
        deadline {formatUtcTimestamp(deadline)} UTC
      </p>
      {hint ? <p className="mt-1 text-[11px] opacity-80">{hint}</p> : null}
      {state === "breached" ? (
        <p className="mt-2 text-[11px] font-semibold">
          Reporting deadline passed — time shown is overdue time, not remaining time.
        </p>
      ) : null}
    </motion.div>
  );
}

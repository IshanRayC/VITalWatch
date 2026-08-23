import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { TermSignal } from "@/types/vitalwatch";

/**
 * DSMB signal view: AE counts by coded term. Bar length and colour carry the
 * signal so an over-represented term jumps out without reading numbers.
 */
export function SignalTable({ signals }: { signals: TermSignal[] }) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...signals.map((s) => s.count));

  if (signals.length === 0) {
    return (
      <p className="rounded-lg border border-border glass px-4 py-10 text-center text-sm text-muted-foreground">
        No coded adverse events yet — nothing to aggregate.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border glass">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead className="border-b border-border glass-soft">
          <tr className="text-xs tracking-wide text-muted-foreground uppercase">
            <th className="px-3 py-2 text-left">Coded term</th>
            <th className="px-3 py-2 text-left">Distribution</th>
            <th className="px-3 py-2 text-right">Events</th>
            <th className="px-3 py-2 text-right">Serious</th>
            <th className="px-3 py-2 text-left">Studies</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((signal, i) => {
            const width = (signal.count / max) * 100;
            const concentrated = signal.studies.length === 1 && signal.count >= max * 0.6;
            return (
              <tr key={signal.term} className="border-b border-border/70 last:border-0">
                <td className="px-3 py-2.5">
                  <span className="text-foreground">{signal.term}</span>
                  {concentrated ? (
                    <span className="ml-2 rounded border border-critical/50 bg-critical-soft px-1.5 py-0.5 text-[10px] font-semibold text-critical">
                      concentrated in {signal.studies[0]}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={reduced ? { width: `${width}%` } : { width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.7, delay: reduced ? 0 : i * 0.04 }}
                      className={cn(
                        "h-full rounded-full",
                        signal.serious_count > 0
                          ? concentrated
                            ? "bg-critical"
                            : "bg-warning"
                          : "bg-primary",
                      )}
                    />
                  </div>
                </td>
                <td className="mono px-3 py-2.5 text-right text-xs text-foreground">
                  {signal.count}
                </td>
                <td
                  className={cn(
                    "mono px-3 py-2.5 text-right text-xs",
                    signal.serious_count > 0 ? "text-critical" : "text-muted-foreground",
                  )}
                >
                  {signal.serious_count}
                </td>
                <td className="mono px-3 py-2.5 text-xs text-muted-foreground">
                  {signal.studies.join(", ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

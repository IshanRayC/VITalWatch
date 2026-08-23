import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, BellRing, Check, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALERT_RULE_LABEL } from "@/lib/roles";
import { relativeTime } from "@/lib/format";
import { SeverityBadge } from "@/components/vw/Badges";
import type { Alert } from "@/types/vitalwatch";

const DOT: Record<Alert["severity"], string> = {
  info: "bg-info text-info",
  warning: "bg-warning text-warning",
  critical: "bg-critical text-critical",
};

export function AlertBanner({
  alert,
  index = 0,
  onAcknowledge,
  readOnly = false,
  acknowledging = false,
  compact = false,
}: {
  alert: Alert;
  index?: number;
  onAcknowledge?: (alert: Alert) => void;
  readOnly?: boolean;
  acknowledging?: boolean;
  compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const acknowledged = alert.acknowledged_by !== null;

  return (
    <motion.article
      layout
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: 18 }}
      animate={{ opacity: acknowledged ? 0.55 : 1, x: 0 }}
      transition={{ duration: 0.35, delay: reduced ? 0 : Math.min(index * 0.06, 0.5) }}
      className={cn(
        "group rounded-lg border glass p-3 transition-colors",
        acknowledged
          ? "border-border"
          : alert.severity === "critical"
            ? "border-critical/40"
            : alert.severity === "warning"
              ? "border-warning/35"
              : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            DOT[alert.severity],
            !acknowledged && !reduced && "pulse-once",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-xs font-medium text-foreground">
              {ALERT_RULE_LABEL[alert.rule]}
            </span>
            <SeverityBadge severity={alert.severity} />
            <span className="text-xs text-muted-foreground">{relativeTime(alert.raised_at)}</span>
            {acknowledged ? (
              <span className="mono text-[11px] text-muted-foreground">
                ack {alert.acknowledged_by}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-foreground/90">{alert.message}</p>
          {!compact && alert.study_title ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              <span className="mono">{alert.study_id}</span> · {alert.study_title}
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-3">
            <Link
              to="/study/$studyId"
              params={{ studyId: alert.study_id }}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Open study <ArrowUpRight className="size-3" />
            </Link>
            {onAcknowledge && !acknowledged ? (
              readOnly ? (
                <span
                  title="Read-only role: the regulator view cannot acknowledge alerts."
                  className="inline-flex cursor-not-allowed items-center gap-1 text-xs text-muted-foreground"
                >
                  <ShieldOff className="size-3" /> Read-only role — cannot acknowledge
                </span>
              ) : (
                <button
                  type="button"
                  disabled={acknowledging}
                  onClick={() => onAcknowledge(alert)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  {acknowledging ? (
                    <BellRing className="size-3 animate-pulse" />
                  ) : (
                    <Check className="size-3" />
                  )}
                  Acknowledge
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

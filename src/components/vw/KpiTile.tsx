import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** Count-up on mount and on every value change. Instant when reduced motion. */
export function useCountUp(target: number, durationMs = 900): number {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? target : 0);
  const fromRef = useRef(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) frame = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reduced]);

  return display;
}

export interface KpiTileProps {
  label: string;
  value: number;
  /** Rendered under the value, e.g. "of 1538 target". */
  sub?: string;
  /** e.g. "%" or "/ 12" appended to the animated number. */
  suffix?: string;
  /** Signed change vs. previous period. */
  delta?: number | null;
  deltaLabel?: string;
  /** "attention" gets a warm accent — used when SAEs / overdue visits > 0. */
  variant?: "neutral" | "attention";
  decimals?: number;
  onClick?: () => void;
}

export function KpiTile({
  label,
  value,
  sub,
  suffix,
  delta = null,
  deltaLabel,
  variant = "neutral",
  decimals = 0,
  onClick,
}: KpiTileProps) {
  const animated = useCountUp(value);
  const reduced = useReducedMotion();
  const attention = variant === "attention";

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-4",
        attention ? "border-warning/40" : "border-border",
        onClick && "cursor-pointer transition-colors hover:border-primary/50",
      )}
    >
      {attention ? (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-warning" aria-hidden />
      ) : null}
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mono mt-2 text-3xl leading-none font-semibold",
          attention ? "text-warning" : "text-foreground",
        )}
      >
        {animated.toLocaleString("en-GB", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix ? (
          <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>
        ) : null}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : <span />}
        {delta !== null ? (
          <span
            className={cn(
              "mono text-xs",
              delta > 0 ? "text-success" : delta < 0 ? "text-critical" : "text-muted-foreground",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta}
            {deltaLabel ? ` ${deltaLabel}` : ""}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

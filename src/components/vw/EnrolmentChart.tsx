import { useReducedMotion } from "motion/react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EnrolmentCurve } from "@/types/vitalwatch";

export function EnrolmentChart({ curve }: { curve: EnrolmentCurve }) {
  const reduced = useReducedMotion();
  const data = curve.labels.map((label, i) => ({
    label,
    actual: curve.actual[i] ?? 0,
    expected: curve.expected[i] ?? 0,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="vw-actual-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            stroke="var(--color-border)"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            stroke="var(--color-border)"
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-popover-foreground)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine
            y={curve.target}
            stroke="var(--color-warning)"
            strokeDasharray="6 4"
            label={{
              value: `Target ${curve.target}`,
              position: "insideTopRight",
              fill: "var(--color-warning)",
              fontSize: 11,
            }}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual enrolment"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#vw-actual-fill)"
            isAnimationActive={!reduced}
            animationDuration={1100}
          />
          <Line
            type="monotone"
            dataKey="expected"
            name="Expected by plan"
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={!reduced}
            animationDuration={1400}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

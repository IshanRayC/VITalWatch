import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAuditEvents, verifyAuditChain } from "@/lib/api";
import { AppShell } from "@/components/vw/AppShell";
import { AuditTable } from "@/components/vw/AuditTable";
import { ErrorState, TableSkeleton } from "@/components/vw/Skeletons";
import { ROLE_LABEL, ROLES } from "@/lib/roles";
import type { Role } from "@/types/vitalwatch";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit trail — hash-chained record · VITalWatch" },
      {
        name: "description",
        content:
          "An append-only, hash-chained audit trail of every action in VITalWatch, with before/after diffs and a one-click chain verification walk. Synthetic demo data only.",
      },
      { property: "og:title", content: "Audit trail — hash-chained record · VITalWatch" },
      {
        property: "og:description",
        content:
          "Every create, update, export, sign and access-denied event, chained by hash and verifiable in one click.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [actor, setActor] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params: { actor?: string; role?: string; from?: string; to?: string } = {};
  if (actor.trim()) params.actor = actor.trim();
  if (role !== "all") params.role = role;
  if (from) params.from = from;
  if (to) params.to = to;

  const auditQuery = useQuery({
    queryKey: ["audit", params],
    queryFn: () => listAuditEvents(params),
  });

  const inputClass =
    "rounded-md border border-input bg-surface-2 px-2 py-1 text-xs text-foreground";

  return (
    <AppShell
      title="Audit trail"
      description="Append-only, hash-chained record of every action. All timestamps are UTC."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <input
            aria-label="Filter by actor"
            placeholder="Actor id…"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className={`${inputClass} mono w-32`}
          />
          <select
            aria-label="Filter by role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role | "all")}
            className={inputClass}
          >
            <option value="all">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            From
            <input
              type="date"
              aria-label="From date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            To
            <input
              type="date"
              aria-label="To date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      }
    >
      {auditQuery.isPending ? (
        <TableSkeleton rows={10} label="audit" />
      ) : auditQuery.isError ? (
        <ErrorState
          message="The audit trail could not be loaded."
          onRetry={() => auditQuery.refetch()}
        />
      ) : (
        <AuditTable events={auditQuery.data} verify={verifyAuditChain} />
      )}
    </AppShell>
  );
}

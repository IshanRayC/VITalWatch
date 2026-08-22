import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { Activity, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth";
import { DISCLAIMER } from "@/components/vw/AppShell";
import { ROLE_LABEL, ROLE_LANDING, ROLE_SCOPE } from "@/lib/roles";
import { RoleBadge } from "@/components/vw/RoleBadge";
import { Shimmer } from "@/components/vw/Skeletons";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · VITalWatch CTMS" },
      {
        name: "description",
        content:
          "Sign in to VITalWatch, the real-time clinical trial management and pharmacovigilance console for AIIA. Demo system with synthetic data only.",
      },
      { property: "og:title", content: "Sign in · VITalWatch CTMS" },
      {
        property: "og:description",
        content:
          "Real-time clinical trial oversight and pharmacovigilance for AIIA. Synthetic demo data only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

/** Slow drifting network of nodes: sites and studies, deliberately quiet. */
function NodeField() {
  const reduced = useReducedMotion();
  const nodes = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: (i * 37) % 100,
    y: (i * 53) % 100,
    d: 12 + (i % 7) * 3,
  }));
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full opacity-40"
    >
      {nodes.map((n, i) => {
        const next = nodes[(i + 5) % nodes.length]!;
        return (
          <line
            key={`l-${n.id}`}
            x1={n.x}
            y1={n.y}
            x2={next.x}
            y2={next.y}
            stroke="var(--color-primary)"
            strokeWidth={0.15}
            opacity={0.35}
          />
        );
      })}
      {nodes.map((n) => (
        <circle
          key={n.id}
          cx={n.x}
          cy={n.y}
          r={0.7}
          fill="var(--color-primary)"
          opacity={0.65}
          style={
            reduced
              ? undefined
              : {
                  animation: `vw-node-drift ${n.d}s ease-in-out ${n.id * 0.2}s infinite`,
                  transformBox: "fill-box",
                }
          }
        />
      ))}
    </svg>
  );
}

/**
 * Clerk's <SignIn /> stands here in a Clerk-connected build. This build is
 * frontend-only (no Clerk instance/keys), so the widget below is a shape- and
 * style-compatible stand-in that produces the same session contract:
 * a signed-in user carrying `publicMetadata.role`.
 */
function SignInPanel() {
  const { availableUsers, isLoaded, signIn, isSignedIn, realRole } = useSession();
  const [selected, setSelected] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && realRole) void navigate({ to: ROLE_LANDING[realRole] as "/portfolio" });
  }, [isSignedIn, realRole, navigate]);

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
      <h1 className="text-base font-semibold text-foreground">Sign in to VITalWatch</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Role comes from the <span className="mono">publicMetadata.role</span> claim on your account.
      </p>

      <div className="mt-5 space-y-2">
        {!isLoaded ? (
          <>
            <Shimmer className="h-12 w-full" />
            <Shimmer className="h-12 w-full" />
            <Shimmer className="h-12 w-full" />
          </>
        ) : availableUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No demo accounts available. Check the API connection.
          </p>
        ) : (
          availableUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelected(u.id)}
              className={
                "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors " +
                (selected === u.id
                  ? "border-primary bg-primary-muted/30"
                  : "border-border hover:bg-secondary/60")
              }
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">{u.full_name}</span>
                <span className="mono block truncate text-[11px] text-muted-foreground">
                  {u.email}
                </span>
              </span>
              <RoleBadge role={u.role} compact />
            </button>
          ))
        )}
      </div>

      {selected ? (
        <p className="mt-3 text-[11px] text-muted-foreground">
          {ROLE_SCOPE[availableUsers.find((u) => u.id === selected)!.role]} ·{" "}
          {ROLE_LABEL[availableUsers.find((u) => u.id === selected)!.role]}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!selected}
        onClick={() => signIn(selected)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Continue <ArrowRight className="size-4" />
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        No account?{" "}
        <Link to="/sign-up" className="font-medium text-primary hover:underline">
          Request access
        </Link>
      </p>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid flex-1 lg:grid-cols-2">
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-border bg-surface p-8 lg:border-r lg:border-b-0 lg:p-12">
          <NodeField />
          <div className="relative">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Activity className="size-4" />
              </span>
              VITalWatch
            </span>
          </div>
          <div className="relative max-w-md">
            <h2 className="text-2xl leading-tight font-semibold tracking-tight text-foreground">
              One live view of every trial, site and safety signal.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Real-time clinical trial management with integrated pharmacovigilance for the All India
              Institute of Ayurveda and India's National Pharmacovigilance Coordination Centre —
              replacing stale spreadsheets with an auditable system of record.
            </p>
          </div>
          <p className="mono relative text-[11px] tracking-wide text-muted-foreground">
            {DISCLAIMER}
          </p>
        </section>
        <section className="flex items-center justify-center bg-background p-8">
          <SignInPanel />
        </section>
      </div>
      <footer className="border-t border-border bg-surface/60 px-4 py-3">
        <p className="mono text-center text-[11px] text-muted-foreground">{DISCLAIMER}</p>
      </footer>
    </div>
  );
}

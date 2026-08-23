import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Activity, ArrowRight, Check } from "lucide-react";
import { useSession } from "@/lib/auth";
import { DISCLAIMER } from "@/components/vw/AppShell";
import { ROLE_LABEL, ROLE_LANDING, ROLE_SCOPE } from "@/lib/roles";
import { RoleBadge } from "@/components/vw/RoleBadge";
import { Shimmer } from "@/components/vw/Skeletons";
import { VideoBackdrop } from "@/components/vw/VideoBackdrop";

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

  const selectedUser = availableUsers.find((u) => u.id === selected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[26rem] overflow-hidden rounded-2xl border border-foreground/12 bg-card/45 p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
    >
      {/* top hairline sheen */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <div className="flex flex-col items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-primary">
          <Activity className="size-5" />
        </span>
        <span className="mt-3 text-lg font-semibold tracking-tight text-foreground">
          VITalWatch
        </span>
        <span className="mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
          Clinical Trial Portal
        </span>
      </div>

      <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-foreground">
        Welcome back.
      </h1>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Access your critical data and manage trials.
      </p>

      <div className="mt-6 space-y-1.5">
        <p className="mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          Account
        </p>
        {!isLoaded ? (
          <>
            <Shimmer className="h-11 w-full" />
            <Shimmer className="h-11 w-full" />
            <Shimmer className="h-11 w-full" />
          </>
        ) : availableUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No demo accounts available. Check the API connection.
          </p>
        ) : (
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {availableUsers.map((u) => {
              const active = selected === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelected(u.id)}
                  className={
                    "group flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 " +
                    (active
                      ? "border-primary/60 bg-primary/12 shadow-[0_0_0_1px_var(--color-primary)]"
                      : "border-foreground/10 bg-foreground/[0.03] hover:border-foreground/25 hover:bg-foreground/[0.07]")
                  }
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-foreground">{u.full_name}</span>
                    <span className="mono block truncate text-[11px] text-muted-foreground">
                      {u.email}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <RoleBadge role={u.role} compact />
                    <Check
                      className={
                        "size-4 shrink-0 transition-opacity " +
                        (active ? "text-primary opacity-100" : "opacity-0")
                      }
                    />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-3 h-4 text-center text-[11px] text-muted-foreground">
        {selectedUser ? `${ROLE_SCOPE[selectedUser.role]} · ${ROLE_LABEL[selectedUser.role]}` : ""}
      </p>

      <button
        type="button"
        disabled={!selected}
        onClick={() => signIn(selected)}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-success via-primary to-info px-4 py-3 text-sm font-semibold tracking-wide text-primary-foreground uppercase transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sign in <ArrowRight className="size-4" />
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/sign-up" className="font-medium text-primary hover:underline">
          Request access for new trials.
        </Link>
      </p>
    </motion.div>
  );
}

function LoginPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <VideoBackdrop variant="cinematic" className="fixed" />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mb-8 max-w-md text-center text-sm text-muted-foreground"
      >
        One live view of every trial, site and safety signal.
      </motion.p>

      <SignInPanel />

      <p className="mono mt-8 max-w-md text-center text-[11px] tracking-wide text-muted-foreground">
        {DISCLAIMER}
      </p>
    </div>
  );
}

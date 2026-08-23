import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Moon, ShieldOff, Sun, X } from "lucide-react";
import markAsset from "@/assets/vitalwatch-mark.png.asset.json";
import { cn } from "@/lib/utils";
import { listAlerts } from "@/lib/api";
import { STUB_MODE } from "@/lib/api";
import { SignedIn, useSession, UserButton } from "@/lib/auth";
import {
  NAV_BY_ROLE,
  NAV_META,
  ROLE_LABEL,
  ROLE_LANDING,
  ROLE_SCOPE,
  ROLES,
  SEVERITY_RANK,
  isReadOnly,
} from "@/lib/roles";
import { AlertBanner } from "@/components/vw/AlertBanner";
import { RoleBadge } from "@/components/vw/RoleBadge";
import { VideoBackdrop } from "@/components/vw/VideoBackdrop";

import type { Role } from "@/types/vitalwatch";

export const DISCLAIMER = "Demo system — synthetic data only. No real patient data at any stage.";

/** Present on every screen, by product requirement. */
export function DisclaimerFooter() {
  return (
    <footer className="border-t border-border glass-soft px-4 py-3 md:px-6">
      <p className="mono text-center text-[11px] tracking-wide text-muted-foreground">
        {DISCLAIMER}
      </p>
    </footer>
  );
}

export function ReadOnlyNotice({ action }: { action: string }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-soft/50 px-3 py-2 text-xs text-warning">
      <ShieldOff className="size-3.5 shrink-0" />
      Read-only role: the regulator view cannot {action}. This is a presentation-only guard — server-side
      RBAC enforcement is out of scope in this build.
    </p>
  );
}

function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("vitalwatch.theme") === "light";
    setLight(stored);
    document.documentElement.classList.toggle("light", stored);
  }, []);
  return (
    <button
      type="button"
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      onClick={() => {
        const next = !light;
        setLight(next);
        document.documentElement.classList.toggle("light", next);
        window.localStorage.setItem("vitalwatch.theme", next ? "light" : "dark");
      }}
      className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}

function RoleSwitcher() {
  const { canSwitchRole, effectiveRole, setEffectiveRole } = useSession();
  const navigate = useNavigate();
  if (!canSwitchRole || !effectiveRole) return null;
  return (
    <label className="hidden items-center gap-2 lg:flex">
      <span className="text-[11px] tracking-wide text-muted-foreground uppercase">View as</span>
      <select
        value={effectiveRole}
        onChange={(e) => {
          const role = e.target.value as Role;
          setEffectiveRole(role);
          void navigate({ to: ROLE_LANDING[role] });
        }}
        className="rounded-md border border-input bg-surface-2 px-2 py-1 text-xs text-foreground"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABEL[role]}
          </option>
        ))}
      </select>
    </label>
  );
}

function AlertBell() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: listAlerts,
    refetchInterval: 30_000,
  });
  const unread = useMemo(
    () =>
      [...alerts]
        .filter((a) => a.acknowledged_by === null)
        .sort(
          (a, b) =>
            SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
            new Date(b.raised_at).getTime() - new Date(a.raised_at).getTime(),
        ),
    [alerts],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Alerts: ${unread.length} unacknowledged`}
        className="relative inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Bell className="size-4" />
        {unread.length > 0 ? (
          <span className="mono absolute -top-1.5 -right-1.5 min-w-4 rounded-full bg-critical px-1 text-[10px] leading-4 font-semibold text-background">
            {unread.length}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/70"
            />
            <motion.aside
              initial={reduced ? { opacity: 0 } : { x: 380 }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: 380 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed top-0 right-0 z-50 flex h-full w-[min(420px,90vw)] flex-col border-l border-border bg-surface/55 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Unacknowledged alerts</h2>
                  <p className="text-xs text-muted-foreground">Severity-ranked, newest first</p>
                </div>
                <button
                  type="button"
                  aria-label="Close alerts panel"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {unread.length === 0 ? (
                  <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                    Nothing outstanding — every alert has been acknowledged.
                  </p>
                ) : (
                  unread
                    .slice(0, 5)
                    .map((alert, i) => (
                      <AlertBanner key={alert.id} alert={alert} index={i} compact />
                    ))
                )}
                {unread.length > 5 ? (
                  <Link
                    to="/alerts"
                    onClick={() => setOpen(false)}
                    className="block px-2 pt-2 text-xs font-medium text-primary hover:underline"
                  >
                    View all {unread.length} alerts →
                  </Link>
                ) : null}
              </div>
              <p className="mono border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                {DISCLAIMER}
              </p>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function TopNav() {
  const { effectiveRole, realRole } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const keys = effectiveRole ? NAV_BY_ROLE[effectiveRole] : [];

  return (
    <header className="sticky top-0 z-40 border-b border-border glass-soft">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-2.5 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={markAsset.url} alt="VITalWatch logo" className="size-7 object-contain" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            VITalWatch
          </span>
          <span className="mono hidden text-[10px] text-muted-foreground sm:inline">
            AIIA · NPvCC
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {keys.map((key) => {
            const meta = NAV_META[key];
            const active = pathname.startsWith(meta.to);
            return (
              <Link
                key={key}
                to={meta.to}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {meta.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {STUB_MODE ? (
            <span className="mono hidden rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground xl:inline">
              stub mode
            </span>
          ) : null}
          <RoleSwitcher />
          {effectiveRole ? (
            <span className="flex items-center gap-1.5">
              <RoleBadge role={effectiveRole} compact />
              {effectiveRole !== realRole ? (
                <span className="mono text-[10px] text-warning">viewing as</span>
              ) : null}
            </span>
          ) : null}
          {isReadOnly(effectiveRole) ? (
            <span className="mono hidden rounded border border-warning/40 bg-warning-soft/40 px-2 py-0.5 text-[10px] text-warning md:inline">
              read-only
            </span>
          ) : null}
          <AlertBell />
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}

/** Page wrapper: nav chrome + animated page transition + the disclaimer footer. */
export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const { isLoaded, isSignedIn, effectiveRole } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) void navigate({ to: "/login" });
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <VideoBackdrop className="fixed" />
      <SignedIn>
        <TopNav />
      </SignedIn>
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 md:px-6">

        {!isLoaded ? (
          <p className="text-sm text-muted-foreground">Restoring session…</p>
        ) : !isSignedIn ? (
          <p className="text-sm text-muted-foreground">
            Redirecting to sign-in — app chrome and data are only shown to signed-in users.
          </p>
        ) : effectiveRole === null ? (
          <div className="rounded-lg border border-warning/40 bg-warning-soft/40 p-6">
            <h1 className="text-base font-semibold text-warning">No role assigned</h1>
            <p className="mt-1 text-sm text-foreground/80">
              This account has no <span className="mono">publicMetadata.role</span> claim. Contact an
              administrator to have a role assigned before using VITalWatch.
            </p>
          </div>
        ) : (
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
                {description ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                ) : null}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {ROLE_SCOPE[effectiveRole]}
                </p>
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
            {children}
          </motion.div>
        )}
      </main>
      <DisclaimerFooter />
    </div>
  );
}

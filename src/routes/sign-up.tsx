import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { DISCLAIMER } from "@/components/vw/AppShell";
import { VideoBackdrop } from "@/components/vw/VideoBackdrop";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Request access · VITalWatch CTMS" },
      {
        name: "description",
        content:
          "Request a VITalWatch account. Roles are assigned by an administrator before trial and pharmacovigilance data can be viewed. Synthetic demo data only.",
      },
      { property: "og:title", content: "Request access · VITalWatch CTMS" },
      {
        property: "og:description",
        content:
          "Accounts for VITalWatch are provisioned by an AIIA administrator, who assigns one of seven clinical roles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid flex-1 lg:grid-cols-2">
        <section className="relative isolate flex flex-col justify-between overflow-hidden border-b border-border bg-surface/70 p-8 lg:border-r lg:border-b-0 lg:p-12">
          <VideoBackdrop variant="hero" />
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Activity className="size-4" />
            </span>
            VITalWatch
          </span>
          <div className="max-w-md">
            <h1 className="text-2xl leading-tight font-semibold tracking-tight text-foreground">
              Access is provisioned, not self-served.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              VITalWatch carries trial oversight and safety-reporting responsibilities, so every
              account is created by an AIIA administrator who assigns one of the seven roles. Until a
              role claim exists on your account, the workspace shows a "no role assigned" state
              rather than defaulting you into anyone's data.
            </p>
          </div>
          <p className="mono text-[11px] text-muted-foreground">{DISCLAIMER}</p>
        </section>
        <section className="relative isolate flex items-center justify-center bg-background p-8">
          <VideoBackdrop />
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-foreground">Request access</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              In a Clerk-connected deployment this panel hosts Clerk's own{" "}
              <span className="mono">&lt;SignUp /&gt;</span> widget, themed to match VITalWatch. This
              frontend-only build has no identity provider attached, so sign-up is deferred to the
              administrator workflow below.
            </p>
            <ol className="mt-4 space-y-2 text-xs text-foreground/80">
              <li className="rounded-md border border-border bg-surface-2 px-3 py-2">
                1. Email the AIIA CTMS administrator with your name, institutional email and the site
                or study you work on.
              </li>
              <li className="rounded-md border border-border bg-surface-2 px-3 py-2">
                2. The administrator creates the account and sets{" "}
                <span className="mono">publicMetadata.role</span>.
              </li>
              <li className="rounded-md border border-border bg-surface-2 px-3 py-2">
                3. Sign in — you land on the default screen for your role.
              </li>
            </ol>
            <Link
              to="/login"
              className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
      <footer className="border-t border-border bg-surface/60 px-4 py-3">
        <p className="mono text-center text-[11px] text-muted-foreground">{DISCLAIMER}</p>
      </footer>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
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
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <VideoBackdrop variant="cinematic" className="fixed" />

      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[28rem] overflow-hidden rounded-2xl border border-foreground/12 bg-card/45 p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
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
          Access is provisioned.
        </h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Every account is created by an AIIA administrator who assigns one of the seven roles.
        </p>

        <ol className="mt-5 space-y-2 text-xs text-foreground/80">
          <li className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2.5">
            1. Email the AIIA CTMS administrator with your name, institutional email and the site or
            study you work on.
          </li>
          <li className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2.5">
            2. The administrator creates the account and sets{" "}
            <span className="mono">publicMetadata.role</span>.
          </li>
          <li className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2.5">
            3. Sign in — you land on the default screen for your role.
          </li>
        </ol>

        <Link
          to="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-success via-primary to-info px-4 py-3 text-sm font-semibold tracking-wide text-primary-foreground uppercase transition-all hover:brightness-110"
        >
          Back to sign in
        </Link>
      </motion.div>

      <p className="mono mt-8 max-w-md text-center text-[11px] text-muted-foreground">
        {DISCLAIMER}
      </p>
    </div>
  );
}

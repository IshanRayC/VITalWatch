import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { ROLE_LANDING } from "@/lib/roles";
import { DISCLAIMER } from "@/components/vw/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VITalWatch — Real-time CTMS & Pharmacovigilance" },
      {
        name: "description",
        content:
          "VITalWatch gives AIIA one live view of every clinical trial, site, enrolment curve and safety signal, with an auditable hash-chained trail. Synthetic demo data only.",
      },
      { property: "og:title", content: "VITalWatch — Real-time CTMS & Pharmacovigilance" },
      {
        property: "og:description",
        content:
          "One live view of every trial, site and safety signal for AIIA and India's NPvCC. Demo system, synthetic data only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { isLoaded, isSignedIn, effectiveRole } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && effectiveRole) {
      void navigate({ to: ROLE_LANDING[effectiveRole] as "/portfolio", replace: true });
    } else {
      void navigate({ to: "/login", replace: true });
    }
  }, [isLoaded, isSignedIn, effectiveRole, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <h1 className="text-lg font-semibold tracking-tight text-foreground">VITalWatch</h1>
      <p className="text-sm text-muted-foreground">
        Real-time clinical trial management and pharmacovigilance for AIIA — loading your workspace…
      </p>
      <p className="mono text-[11px] text-muted-foreground">{DISCLAIMER}</p>
    </div>
  );
}

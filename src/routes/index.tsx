import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useSession } from "@/lib/auth";
import { ROLE_LANDING } from "@/lib/roles";
import { DISCLAIMER } from "@/components/vw/AppShell";
import { VideoBackdrop } from "@/components/vw/VideoBackdrop";

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

const LAYERS = [
  {
    no: "01",
    title: "Study intelligence",
    body: "Protocols, milestones, enrolment curves against plan, site activation and deviation history — every study measured the same way.",
  },
  {
    no: "02",
    title: "Site intelligence",
    body: "Activation status, screening yield, monitoring visit windows, open queries and workload per coordinator.",
  },
  {
    no: "03",
    title: "Safety intelligence",
    body: "AE intake with coding suggestions, SAE countdown clocks, DSMB term aggregation and concentration signals.",
  },
  {
    no: "04",
    title: "Audit intelligence",
    body: "Hash-chained event history. Every write is verifiable, attributable and ordered — no silent edits.",
  },
];

const MODULES = [
  {
    key: "portfolio",
    label: "Portfolio oversight",
    title: "Role-based dashboards",
    body: "Seven roles, one dataset. PI, coordinator, monitor, ethics, PV, admin and a read-only regulator each land on the screen their day starts with.",
  },
  {
    key: "safety",
    label: "Pharmacovigilance",
    title: "Safety, on the clock",
    body: "Adverse event intake with live coding suggestions and regulatory countdowns for 24h, 7-day and 15-day reporting windows.",
  },
  {
    key: "alerts",
    label: "Alerts & thresholds",
    title: "Severity-ranked signals",
    body: "Rule breaches surface ranked, acknowledged and traced to the study that raised them — nothing waits for a monthly report.",
  },
  {
    key: "audit",
    label: "Audit trail",
    title: "Provable history",
    body: "Verify the chain in one click. Any broken link is shown with the exact record where the hash diverges.",
  },
];

function Index() {
  const { isSignedIn, effectiveRole } = useSession();
  const enterTo = (isSignedIn && effectiveRole ? ROLE_LANDING[effectiveRole] : "/login") as
    | "/portfolio"
    | "/login";

  return (
    <div className="relative isolate min-h-screen text-foreground">
      <VideoBackdrop variant="cinematic" className="fixed" />

      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 glass-soft">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={"/vitalwatch-mark.svg"} alt="VITalWatch logo" className="size-7 object-contain" />
            <span className="text-sm font-semibold tracking-tight">VITalWatch</span>
          </Link>
          <nav className="mono ml-auto hidden items-center gap-6 text-[11px] tracking-[0.16em] text-muted-foreground uppercase md:flex">
            <a href="#layers" className="hover:text-foreground">
              Foundation
            </a>
            <a href="#command" className="hover:text-foreground">
              Command centre
            </a>
            <a href="#modules" className="hover:text-foreground">
              Modules
            </a>
          </nav>
          <Link
            to={enterTo}
            className="ml-auto rounded-full border border-primary/50 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 md:ml-6"
          >
            {isSignedIn ? "Open workspace" : "Sign in"}
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-[1200px] px-5 pt-20 pb-24 md:pt-28 md:pb-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mono text-[10px] tracking-[0.34em] text-muted-foreground uppercase"
        >
          AIIA · NPvCC · Clinical trial intelligence
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-[clamp(3rem,10vw,7.5rem)] leading-[0.92] font-light tracking-tight"
        >
          VITalWatch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground"
        >
          Real-time clinical trial management with an integrated pharmacovigilance module. One
          live surface for enrolment, sites, safety signals, regulatory clocks and an auditable
          history of every change.
        </motion.p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to={enterTo}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-success via-primary to-info px-5 py-3 text-xs font-semibold tracking-[0.14em] text-primary-foreground uppercase transition-all hover:brightness-110"
          >
            Enter the portal <ArrowRight className="size-4" />
          </Link>
          <a
            href="#layers"
            className="inline-flex items-center gap-2 rounded-full border border-border glass px-5 py-3 text-xs tracking-[0.14em] text-foreground uppercase transition-colors hover:border-primary/50"
          >
            See the platform
          </a>
        </div>
      </section>

      {/* layers */}
      <section id="layers" className="border-t border-border/50">
        <div className="mx-auto max-w-[1200px] px-5 py-20">
          <p className="mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            01 — Foundation
          </p>
          <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-light tracking-tight md:text-4xl">
            One foundation. Four intelligence layers.
          </h2>

          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-border glass">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,color-mix(in_oklab,var(--color-primary)_28%,transparent),transparent_65%)]" />
              <div className="relative flex h-full flex-col justify-end gap-2 p-6">
                <img
                  src={"/vitalwatch-mark.svg"}
                  alt="VITalWatch shield mark"
                  className="mb-auto size-24 object-contain opacity-90"
                />
                <p className="mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  Studies → Safety → Alerts → Trust
                </p>
                <p className="text-sm text-muted-foreground">
                  Every layer reads from the same record set, so a number never disagrees with
                  itself across two screens.
                </p>
              </div>
            </div>

            <ol className="grid gap-3">
              {LAYERS.map((l, i) => (
                <motion.li
                  key={l.no}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="rounded-xl border border-border glass p-5"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="mono text-[11px] text-primary">{l.no}</span>
                    <h3 className="mono text-xs tracking-[0.18em] text-foreground uppercase">
                      {l.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* command centre */}
      <section id="command" className="border-t border-border/50">
        <div className="mx-auto max-w-[1200px] px-5 py-20">
          <p className="mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            02 — Always on
          </p>
          <h2 className="mt-5 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            The command centre runs. Always.
          </h2>

          <div className="mt-14 flex justify-center">
            <div className="relative flex aspect-square w-full max-w-[520px] items-center justify-center rounded-full border border-border/70 glass">
              <div className="absolute inset-8 rounded-full border border-dashed border-border/60" />
              <div className="text-center">
                <p className="text-2xl leading-snug font-light">
                  We track.
                  <br />
                  We alert.
                  <br />
                  We audit.
                </p>
              </div>
              {[
                { label: "Enrol", pos: "left-1/2 top-3 -translate-x-1/2" },
                { label: "Monitor", pos: "right-4 top-1/4" },
                { label: "Report", pos: "right-4 bottom-1/4" },
                { label: "Verify", pos: "left-1/2 bottom-3 -translate-x-1/2" },
                { label: "Signal", pos: "left-4 bottom-1/4" },
                { label: "Code", pos: "left-4 top-1/4" },
              ].map((n) => (
                <span
                  key={n.label}
                  className={`mono absolute ${n.pos} rounded-full border border-border bg-surface/60 px-2.5 py-1 text-[10px] tracking-[0.16em] text-muted-foreground uppercase`}
                >
                  {n.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* modules */}
      <section id="modules" className="border-t border-border/50">
        <div className="mx-auto max-w-[1200px] px-5 py-20">
          <p className="mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            03 — Modules
          </p>
          <h2 className="mt-5 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            Four modules. One platform.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {MODULES.map((m, i) => (
              <motion.article
                key={m.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-xl border border-border glass p-6"
              >
                <p className="mono text-[10px] tracking-[0.22em] text-primary uppercase">
                  {m.label}
                </p>
                <h3 className="mt-3 text-xl font-light tracking-tight">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to={enterTo}
              className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-5 py-3 text-xs tracking-[0.14em] text-primary uppercase transition-colors hover:bg-primary/20"
            >
              {isSignedIn ? "Open workspace" : "Sign in to the demo"}{" "}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 glass-soft">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 px-5 py-6">
          <img src={"/vitalwatch-mark.svg"} alt="" className="size-6 object-contain opacity-80" />
          <p className="mono text-center text-[11px] tracking-wide text-muted-foreground">
            {DISCLAIMER}
          </p>
        </div>
      </footer>
    </div>
  );
}

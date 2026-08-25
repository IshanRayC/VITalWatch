# Vital Clinical Hub

## My role

I am a frontend engineer and product designer. Build the **complete, production-quality
frontend** for **VITalWatch** — a real-time Clinical Trial Management System (CTMS) with an
integrated Pharmacovigilance (PV) module, built for the All India Institute of Ayurveda (AIIA),
which also hosts India's National Pharmacovigilance Coordination Centre (NPvCC).

This is a **demo system with synthetic data only — no real patient data at any stage.** That line
appears in the footer of every screen. Do not treat it as a throwaway disclaimer; it is a product
requirement.

Output the entire app: every file, fully implemented, no `TODO`, no `// implement later`, no
placeholder JSX. If something is genuinely out of scope (see "Explicitly out of scope" below),
say so in a comment, don't stub it silently.

## Tech stack (non-negotiable)

- **Next.js 15**, App Router, TypeScript, React 19.
- **Clerk (`@clerk/nextjs`)** for authentication — sign-in, sign-up, session, and route
  protection. Do not build a custom login form or a custom token/session layer. See "Auth"
  below for exactly how this wires into the app's 7 roles.
- **Tailwind CSS** for styling.
- **Framer Motion** (`motion/react`) for animation — page transitions, staggered lists, count-up
  numbers, chart draw-ins, the audit hash-chain visualization, and the SAE countdown clocks.
- **Recharts** for the enrolment curve and any other charts.
- Client-side data fetching through a **single API client module** (`lib/api.ts`) — no component
  ever calls `fetch` directly. This is what makes stub mode possible (see below) and it must not
  be violated anywhere in the codebase. Auth is the one exception: Clerk's own hooks/components
  (`useUser`, `auth()`, `<SignInButton>`, etc.) are used directly, not routed through `lib/api.ts`.
- No CSS-in-JS, no component library that fights Tailwind. `shadcn/ui` primitives are fine to use
  *as a base* (button, dialog, table, tooltip, toast) as long as they're restyled to match the
  design language below, not left at their default look. If `shadcn/ui` is used, style Clerk's
  own UI with `@clerk/ui`'s shadcn theme so the sign-in/up screens and `<UserButton>` don't look
  like a foreign component dropped into the app.

## The one architectural rule that matters: stub mode

The app must run **fully, with realistic data, with the backend completely down.**

`lib/api.ts` reads `NEXT_PUBLIC_STUB_MODE`. When `true`, every `apiGet`/`apiPost` call resolves
from local JSON fixtures (provided below, under "Fixture data to ship") instead of hitting
`NEXT_PUBLIC_API_URL`. When `false`, it calls the real FastAPI backend. Every page, every
component, every hook is written against `lib/api.ts` only — never against `fetch` and never
against a fixture file directly. Switching the env var is the only thing that should change
behavior.

This isn't a nice-to-have — it's the thing that lets the frontend be demoed, reviewed, and iterated
on independently of backend readiness. Preserve it exactly.

## Design direction

**Brief:** a premium, trustworthy clinical-SaaS aesthetic — think the polish of Linear or Vercel's
dashboard applied to a regulated healthcare workflow tool. Data-dense screens must still feel calm
and legible, not cluttered. This is a system a Principal Investigator and a government regulator
both have to trust at a glance.

- **Palette:** a deep, desaturated clinical blue/teal as primary, a warm neutral gray scale for
  surfaces, and a disciplined severity scale (info = blue, warning = amber, critical = red) used
  *only* for alerts, breach states, and severity badges — never decoratively. Support both light
  and dark mode; default to a dark, "ops-room" theme for the portfolio and alerts screens since
  this reads as a monitoring tool, with light mode as the alternative, not the afterthought.
- **Typography:** a clean grotesque/humanist sans for UI text (Inter or similar) and a monospace
  face for anything that is literally data — IDs, protocol numbers, hashes, timestamps, the audit
  table. The monospace/sans contrast is a deliberate signal of "this is a real system of record,"
  not styling for its own sake.
- **Density:** this is an information product. Favor compact, well-aligned tables and tiles over
  generous whitespace, but keep a consistent spacing scale so it never feels cramped.
- **Motion language:** motion should communicate *state changing in real time*, because the whole
  pitch of this product is "one live view instead of stale spreadsheets." Numbers count up rather
  than snap in. New alerts slide in and gently pulse once. The audit chain visually links row to
  row. Countdown clocks actually tick. Nothing should be motion for decoration — every animation
  should be answering "what changed, and how urgent is it."
- Respect `prefers-reduced-motion`: provide a reduced-motion fallback (opacity/instant state
  changes only) for every animation described below.

## Roles (presentation-only on the frontend — there is no backend enforcement to respect yet)

```
principal_investigator   — Principal Investigator, scope: own studies
study_coordinator        — Study Coordinator, scope: own sites
monitor                  — Clinical Monitor, scope: assigned studies
ethics_committee         — Ethics Committee, scope: all studies
pharmacovigilance        — Pharmacovigilance Officer, scope: all studies
admin                    — Administrator, scope: all
regulator                — Regulator, scope: all, READ-ONLY (every mutation must be blocked
                            client-side with a visible, explicit "read-only role" message —
                            never a silent no-op)
```

**Role source of truth is now Clerk**, not a login form (see "Auth" below): each signed-in user's
role is read from `publicMetadata.role` on their Clerk user object. For demoing all seven roles
without needing seven real Clerk accounts on stage, add a **"View as" switcher** in the top nav,
but scope it correctly: it only ever appears when `NEXT_PUBLIC_STUB_MODE=true`, and even then only
for a user whose real Clerk role is `admin`. In real/non-stub mode there is no role switcher — the
nav simply reflects the signed-in user's actual `publicMetadata.role`. Either way, changing the
effective role re-routes to that role's default landing screen and re-filters what's visible.
This remains presentation-only: hide/disable UI, don't pretend it enforces security.

## Auth (Clerk)

Set up authentication with `@clerk/nextjs`, following Clerk's own Next.js App Router conventions
exactly:

- Wrap the app in `<ClerkProvider>` **inside `<body>`**, not wrapping `<html>`.
- Add `clerkMiddleware()` to protect every route except `/login`/`/sign-up` and the marketing/
  disclaimer content — an unauthenticated visitor should land on Clerk's sign-in, not on the
  portfolio shell with no data.
- Use `await auth()` (Next.js 15: it's async) in server components/route handlers that need the
  current user; use `useUser()` client-side.
- Never expose `CLERK_SECRET_KEY` outside server code.
- **Role mapping:** this app's 7 roles (`principal_investigator`, `study_coordinator`, `monitor`,
  `ethics_committee`, `pharmacovigilance`, `admin`, `regulator`) are not Clerk's built-in
  org-roles system — they're a custom claim. Store the role in each Clerk user's
  `publicMetadata.role` and read it via `auth()`/`useUser()` wherever the app currently needs
  "current role" (nav filtering, the role badge, gating mutations for `regulator`). If
  `publicMetadata.role` is missing for a signed-in user, show a clear "no role assigned — contact
  an admin" state rather than silently defaulting to any particular role.
- Do not build Clerk Organizations/multi-tenancy for this — the 7 roles are a single-tenant
  concept here, out of scope unless asked for separately.

### 1. `/login` (and `/sign-up`)
Use Clerk's own `<SignIn />` / `<SignUp />` components, not a hand-built form — but give them a
custom appearance so they sit inside VITalWatch's design language rather than looking like a
stock Clerk widget: apply an `appearance` theme (via `@clerk/ui`'s shadcn theme if `shadcn/ui` is
in use, or a custom `appearance` prop otherwise) matching the palette/typography described above.
Wrap them in the same split layout as before: brand/context panel on one side (product name,
one-line mission, the synthetic-data disclaimer, a subtle animated background — e.g. a slow
drifting network of nodes representing sites/studies, not distracting) and the Clerk sign-in/
sign-up widget on the other. After sign-in, route to the landing screen for the signed-in user's
`publicMetadata.role`.

### 2. Root layout / nav shell (`app/layout.tsx` + a client nav component)
Persistent chrome: logo/product name, primary nav (Portfolio, Alerts, Pharmacovigilance, Audit —
conditionally shown per role), `<UserButton />` for account/session management (Clerk's own — sign
out lives there, don't rebuild it), the role switcher described above (stub-mode + admin only), a
**role badge** (color-coded per role) reflecting the effective role, and an **alert bell** with a
live unread count that opens a slide-over preview of the top 3–5 unacknowledged alerts,
severity-ranked. The synthetic-data footer disclaimer is present on every screen, always, not just
the login page. Use `<Show when="signed-out">` / `<Show when="signed-in">` (or `<SignedIn>`/
`<SignedOut>`) so a signed-out visitor never sees app chrome, only Clerk's sign-in.

### 3. `/portfolio` — the home screen for most roles
- **Six KPI tiles**, count-up animated on load and again whenever the underlying number changes:
  active studies, enrolled vs. target (as a fraction and a %), sites activated vs. total, open
  queries, overdue monitoring visits, open SAEs. The SAE tile and overdue-visits tile should read
  as "attention" tiles (subtle warm accent) when > 0; the rest are neutral.
- An **alerts panel**, severity-ranked, each alert a compact card with rule name, human-readable
  message, a relative timestamp, and a deep link into the affected study. Newly-arrived alerts (in
  the demo, simulate this by animating in on mount, staggered) should visibly announce themselves —
  slide + fade + a single soft pulse on the severity dot — then settle.
- A **study grid/table**: id, title, phase, status (as a lifecycle pill — protocol → ec_approval →
  ctri_registered → site_activation → screening → enrolling → follow_up → close_out), therapeutic
  area, enrolment (actual/target with an inline progress bar), sites activated, open SAEs. Sortable,
  filterable by status and therapeutic area. Row click drills into `/study/[id]`.
- Studies lagging behind their expected enrolment curve should be visually flagged in this table
  (not just in the alerts panel) — this is the exact thing a PI needs to see without clicking
  anywhere.

### 4. `/study/[id]` — study drill-down
- Header: title, protocol no., CTRI number (or a visible "not yet registered" state if null —
  this is meant to be noticeable, not hidden), phase, status pill, PI.
- **Enrolment vs. plan chart** (Recharts area/line combo): actual vs. expected curve to today,
  target as a reference line. Animate the line drawing in on mount rather than appearing instantly.
- **Milestone timeline**: protocol → EC approval → CTRI registration → first site activated →
  first subject in → 50% enrolled → last subject in → database lock → close-out. Render as a
  horizontal or vertical timeline with each milestone's status (planned / achieved / at_risk /
  missed) as a colored node, and the accountable role labeled on hover/tap.
- **Site table**: name, city/state, status (planned/activated/suspended/closed), PI name, capacity,
  activation date.
- **Deviations and open queries** as two compact panels — counts plus a short recent list, severity-
  coded for deviations (minor/major/critical), age-in-days shown for open queries (this number is a
  KPI in its own right — make it visually stand out for queries open a long time).

### 5. `/ae` — Pharmacovigilance
This is the screen that has to carry the AE-intake demo moment, so it needs to feel alive.
- **AE intake form**: study, site, subject code, narrative (free text), onset date, serious
  toggle, severity, causality (WHO-UMC scale: unrelated/unlikely/possible/probable/certain),
  outcome, suspect drug.
- As the narrative is typed (debounced), call the coding-suggestion endpoint and show **coding
  candidates** as they arrive — term, code, confidence score, and **explicitly labeled coding
  source** ("curated term set" / "semantic match" — never implied as MedDRA; if `coding_source`
  is `meddra`, still show it, but the product must never claim a licensed dictionary it doesn't
  have). Let the user accept a candidate to fill the coded term.
- On submit with `serious = true`, this is the moment: animate in a **live countdown clock
  component** (`TimelineClock`) showing time remaining to the 24-hour EC/licensing-authority
  deadline and, separately, the 14-day narrative deadline — both computed server-side, both
  ticking in real time client-side between fetches. Color transitions as the deadline approaches:
  calm state → amber inside some threshold (make this configurable, don't hardcode a single magic
  number invisibly) → red and clearly labeled **BREACHED** with a negative "time remaining" once
  past due, not a hidden/zeroed number.
- **AE list**: study, subject code, onset, serious flag, severity, coded term (or "uncoded" as a
  distinct visual state), causality, outcome, timeline status. Filterable by study and by serious.
- **DSMB signal view** (can be a tab or a section on this page): AE counts aggregated by coded
  term, ranked, with serious-count and the list of studies each term appears in. The point of this
  view is to make an over-represented term in one study visually jump out — bar length/color should
  do that work, not just a number in a table cell.

### 6. `/alerts`
Full alert log — same alert shape as the portfolio panel, but the whole list, filterable by
severity and rule type, with an **acknowledge** action per alert (disabled and clearly explained
for the `regulator` role). Acknowledged alerts visually recede (dim/collapse) rather than
disappearing outright.

### 7. `/audit` — the audit trail
This is the single most important screen for the pitch to land, and it should look like it.
- Chronological table, newest first: sequence number, actor, actor role, action (create / update /
  delete / login / login_failed / view / export / acknowledge / sign / access_denied), resource
  type + id, timestamp (UTC, and say so), a `before`/`after` diff viewer (expandable per row — show
  structured JSON, and visually highlight which fields changed between before and after, not just
  dump two blobs side by side).
- Filters: by actor, by role, by date range.
- A **"Verify chain" button**. On click, this should visually walk the chain — animate down the
  sequence, briefly highlighting each row as its hash is (conceptually) checked — and land on a
  clear PASS state (green, with the count of rows checked) or, if the fixture data represents a
  tampered chain, a clear FAIL state naming the exact sequence number where it breaks. This single
  interaction is the strongest 15 seconds of the product's story — build it like a moment, not a
  spinner-then-toast.
- Every row's `action` should carry a small distinct icon/color so the eye can scan action *type*
  down the whole log without reading text.

## Data contracts

Model every TypeScript type below exactly — these mirror the backend's Pydantic contracts
(`contracts/models/`) field-for-field. Do not rename, drop, or loosely type any field (no `any`,
no optional-when-the-contract-says-required).

```ts
// --- enums ---
type StudyPhase = 'I' | 'II' | 'III' | 'IV' | 'observational'
type StudyStatus =
  | 'protocol' | 'ec_approval' | 'ctri_registered' | 'site_activation'
  | 'screening' | 'enrolling' | 'follow_up' | 'close_out'
type SiteStatus = 'planned' | 'activated' | 'suspended' | 'closed'
type SubjectStatus = 'screened' | 'screen_failed' | 'enrolled' | 'completed' | 'withdrawn'
type VisitStatus = 'upcoming' | 'completed' | 'missed' | 'overdue'
type DeviationSeverity = 'minor' | 'major' | 'critical'
type QueryStatus = 'open' | 'answered' | 'closed'
type AESeverity = 'mild' | 'moderate' | 'severe'
type AECausality = 'unrelated' | 'unlikely' | 'possible' | 'probable' | 'certain'
type AEOutcome =
  | 'recovered' | 'recovering' | 'not_recovered' | 'recovered_with_sequelae'
  | 'fatal' | 'unknown'
type CodingSource = 'mock' | 'semantic' | 'meddra' | 'uncoded'
type TimelineStatus = 'on_track' | 'due_soon' | 'breached' | 'not_applicable'
type AlertRule =
  | 'enrolment_lag' | 'ethics_renewal_due' | 'ctri_update_due'
  | 'monitoring_visit_overdue' | 'sae_timeline_breach'
type AlertSeverity = 'info' | 'warning' | 'critical'
type MilestoneType =
  | 'ec_approval' | 'ctri_registration' | 'first_site_activated' | 'first_subject_in'
  | 'fifty_pct_enrolled' | 'last_subject_in' | 'database_lock' | 'close_out'
type MilestoneStatus = 'planned' | 'achieved' | 'at_risk' | 'missed'
type AuditAction =
  | 'create' | 'update' | 'delete' | 'login' | 'login_failed'
  | 'view' | 'export' | 'acknowledge' | 'sign' | 'access_denied'
type Role =
  | 'principal_investigator' | 'study_coordinator' | 'monitor'
  | 'ethics_committee' | 'pharmacovigilance' | 'admin' | 'regulator'

// --- entities ---
interface Study {
  id: string; title: string; protocol_no: string; ctri_number: string | null
  phase: StudyPhase; status: StudyStatus; therapeutic_area: string
  ec_approval_date: string | null; ec_expiry_date: string | null
  ctri_registration_date: string | null
  target_enrolment: number; actual_enrolment: number
  pi_id: string; site_ids: string[]; start_date: string; end_date: string | null
}

interface Site {
  id: string; name: string; city: string; state: string; status: SiteStatus
  activated_date: string | null; pi_name: string; capacity: number; study_ids: string[]
}

// Subject: pseudonymous ONLY. subject_code is the only handle — NEVER add a name field
// or any identifying detail anywhere in the frontend, including mocked demo data.
interface Subject {
  id: string; subject_code: string; study_id: string; site_id: string
  screened_date: string; enrolled_date: string | null; status: SubjectStatus
  arm: string | null; age_band: string | null; sex: string | null
  consent_version: string; consent_date: string
}

interface Visit {
  id: string; study_id: string; site_id: string; subject_code: string | null
  visit_name: string; scheduled_date: string; actual_date: string | null
  window_days: number; status: VisitStatus
  monitoring_visit: boolean; report_filed: boolean
}

interface Deviation {
  id: string; study_id: string; site_id: string; subject_code: string | null
  category: string; description: string; detected_date: string
  severity: DeviationSeverity; reported_to_ec: boolean
  reported_date: string | null; resolution: string | null
}

interface DataQuery {
  id: string; study_id: string; site_id: string; subject_code: string | null
  field: string; question: string; raised_date: string; raised_by: string
  answered_date: string | null; closed_date: string | null; status: QueryStatus
  age_days: number
}

interface AdverseEvent {
  id: string; study_id: string; site_id: string; subject_code: string
  narrative: string; onset_date: string; serious: boolean
  severity: AESeverity; causality: AECausality; outcome: AEOutcome
  coded_term: string | null; coded_code: string | null
  coding_confidence: number | null; coding_source: CodingSource
  suspect_drug: string | null; drug_code: string | null
  drug_coding_source: CodingSource
  reported_at: string; deadline_24h: string | null; deadline_14d: string | null
  timeline_status: TimelineStatus
}

interface Alert {
  id: string; rule: AlertRule; severity: AlertSeverity
  study_id: string; study_title: string | null; message: string
  raised_at: string; deep_link: string
  acknowledged_by: string | null; acknowledged_at: string | null
}

interface Milestone {
  id: string; study_id: string; type: MilestoneType
  planned_date: string; actual_date: string | null
  status: MilestoneStatus; owner_role: string | null
}

interface AuditEvent {
  id: string; seq: number; actor_id: string; actor_role: string
  action: AuditAction; resource_type: string; resource_id: string | null
  before: Record<string, unknown> | null; after: Record<string, unknown> | null
  timestamp_utc: string; reason: string | null
  prev_hash: string; hash: string
}

interface User {
  id: string; email: string; full_name: string; role: Role
  study_ids: string[]; site_ids: string[]; active: boolean
}

interface PortfolioKPI {
  generated_at: string; active_studies: number
  enrolled_total: number; target_total: number
  sites_activated: number; sites_total: number
  open_queries: number; overdue_monitoring_visits: number; open_saes: number
}

interface StudyKPI {
  generated_at: string; study_id: string; enrolment_pct: number
  enrolled: number; target: number; expected_by_today: number
  screen_failure_rate: number; visit_compliance_pct: number
  open_queries: number; open_query_ageing_days: number
  deviation_rate_per_site: number; open_saes: number
  days_to_next_milestone: number | null; next_milestone: string | null
}

interface EnrolmentCurve {
  study_id: string; target: number
  labels: string[]; actual: number[]; expected: number[]
}

interface TermSignal {
  term: string; count: number; serious_count: number; studies: string[]
}

interface ChainVerification { ok: boolean; checked: number; broken_at: number | null }

interface CodingCandidate { term: string; code: string; score: number; source: string }
interface CodingSuggestion { candidates: CodingCandidate[] }
```

## API endpoint map (what backs each screen)

Authentication itself is Clerk's, not these two backend stubs — `POST /auth/login` and
`GET /auth/me` from the original backend contract are superseded by Clerk and should not be
called by the frontend. Everything else below is unchanged and still goes through `lib/api.ts`:

```
GET  /api/kpi/portfolio                 -> PortfolioKPI
GET  /api/kpi/study/{study_id}          -> StudyKPI
GET  /api/studies                       -> Study[]
GET  /api/studies/{study_id}            -> Study
GET  /api/alerts                        -> Alert[]  (already severity-ranked)
POST /api/alerts/{alert_id}/ack         -> Alert

GET  /api/sites?study_id=               -> Site[]
GET  /api/enrolment/{study_id}          -> EnrolmentCurve

GET  /api/ae?study_id=&serious=         -> AdverseEvent[]
GET  /api/ae/{ae_id}                    -> AdverseEvent
POST /api/ae                            -> AdverseEvent
POST /api/coding/suggest  { narrative } -> CodingSuggestion
GET  /api/signals?study_id=             -> TermSignal[]

GET  /api/audit?actor=&role=            -> AuditEvent[]  (newest first)
GET  /api/audit/verify                  -> ChainVerification

GET  /api/users                         -> User[]   (admin only)
GET  /api/export/sdtm?domain=DM|AE      -> CSV download
GET  /api/fhir/ResearchStudy/{id}       -> FHIR ResearchStudy JSON
GET  /api/fhir/AdverseEvent/{id}        -> FHIR AdverseEvent JSON
```

`lib/api.ts` should export a typed function per endpoint (e.g. `getPortfolioKpi()`,
`listStudies()`, `getStudy(id)`, `listAlerts()`, `ackAlert(id)`, `getEnrolmentCurve(id)`,
`listAdverseEvents(params)`, `reportAdverseEvent(payload)`, `suggestCoding(narrative)`,
`getSignals(studyId?)`, `listAuditEvents(params)`, `verifyAuditChain()`) built on top of generic
`apiGet`/`apiPost`, so pages call `getPortfolioKpi()` rather than stringly-typed paths.

## Components to implement (the stubs already named in the repo)

- `KpiTile` — label, value, optional delta/trend, count-up animation on mount and on value change,
  neutral vs. attention visual variants.
- `StudyGrid` — sortable/filterable study table described above.
- `EnrolmentChart` — Recharts actual/expected/target chart with animated draw-in.
- `TimelineClock` — the SAE countdown component: takes a deadline, ticks live, three visual states
  (on track / due soon / breached) with the copy and color transitions described above.
- `AlertBanner` — single alert card used in both the portfolio panel and the nav bell preview,
  entrance animation as described.
- `SignalTable` — DSMB term-signal table/bar view.
- `AuditTable` — the audit log with the diff viewer and the chain-verify interaction.
- `RoleBadge` — small colored pill per role, used in the nav and anywhere an actor is shown.

Add whatever supporting components you need (nav shell, role switcher, toast/notification system,
lifecycle status pill, severity badge, skeleton loaders) — the eight above are the ones the repo
already named and expects to find.

## Fixture data to ship

Generate realistic synthetic fixtures for stub mode covering: 8 studies across varied phases/
statuses/therapeutic areas, ~12 sites, a portfolio KPI snapshot, ~15–20 alerts across all five
rules and all three severities, an enrolment curve per study, 6 milestones per study in varying
states, ~40–50 adverse events (a handful serious, with a realistic mix of coding sources and at
least one clearly `breached` timeline and one clearly `due_soon`), a term-signal aggregation with
one term visibly over-represented in one study, an audit log of 40+ chronological events covering
every `AuditAction` value at least once, and 7 users, one per role. Deliberately build the data so
every UI state in this spec has something real to render — including at least one study with a
null `ctri_number`, at least one deviation of each severity, and (for a compelling "Verify chain"
demo) make the chain verification pass cleanly; don't fixture a broken chain as the default state.

## Explicitly out of scope (do not build; a one-line "deferred" note is enough if you want to
mention it in code comments)

- Real MedDRA/WHODrug — the product must never claim or imply a licensed dictionary is in use.
- Server-side RBAC enforcement — role switching is presentation-only.
- Full SDTM/ADaM — a CSV header download for the DM/AE export button is enough.
- Clerk Organizations, multi-tenancy, or enterprise SSO — plain Clerk auth with a
  `publicMetadata.role` claim is enough; don't build beyond that unless asked.

## Quality bar

- Fully typed, no `any`.
- Every screen has a loading (skeleton) state and an empty state — not just a happy path.
- Every mutation the `regulator` role attempts is visibly blocked with an explanation, not a
  silent failure.
- Responsive down to a reasonable tablet width; this is presented on a laptop in a live demo, not
  optimized for mobile, but shouldn't break above ~1024px viewports going narrower.
- The "synthetic data only, no real patient data" line is present on every screen.
- Ship it as a complete Next.js project: full file tree, `package.json` with exact dependencies,
  and a short README section on how to run it in stub mode (`NEXT_PUBLIC_STUB_MODE=true npm run
  dev`) versus against a live backend (`NEXT_PUBLIC_API_URL=...`).

I've attached a file...you are to only CREATE THE FRONTEND for it...not integrate backend, functions, anything....just the frontend...Also, we'll be using clerk Auth...but ONLY CREATE FRONTEND...

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ca669f0e-e245-429d-a25f-3edf24d4b389).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

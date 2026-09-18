
# VITalWatch

**Real-time Clinical Trial Management & Pharmacovigilance**

_Smart India Hackathon 2024 — Problem Statement 46_  
_All India Institute of Ayurveda (AIIA) · National Pharmacovigilance Coordination Centre (NPvCC)_

[![IshanRayC](https://img.shields.io/badge/IshanRayC-ff4d4d?style=for-the-badge&logo=github&logoColor=black)](https://github.com/IshanRayC)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)]



[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.x-FF4154?style=flat-square)](https://tanstack.com/router)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

> **⚠️ Demo System — Synthetic data only.** No real patient data is used or stored at any stage of this application.

---

## 📖 Overview

**VITalWatch** is a production-quality frontend prototype for a unified **Clinical Trial Management System (CTMS)** and **Pharmacovigilance (PV) module**, built for AIIA and India's NPvCC. It brings the real-time, data-dense aesthetic of modern SaaS dashboards to regulated healthcare workflows — making clinical oversight trustworthy, legible, and highly responsive.

The system covers the full trial lifecycle: from EC approval and CTRI registration, through site activation and enrolment, to safety signal monitoring and audit-ready close-out.

---

## ✨ Features

### 🏛️ Role-Based Access Control — 7 Roles

| Role                      | Scope                       | Default Landing   |
| ------------------------- | --------------------------- | ----------------- |
| Principal Investigator    | Own studies                 | Portfolio         |
| Study Coordinator         | Own sites                   | Portfolio         |
| Clinical Monitor          | Assigned studies            | Portfolio         |
| Ethics Committee          | All studies                 | Portfolio         |
| Pharmacovigilance Officer | All studies                 | Pharmacovigilance |
| Administrator             | Full access + role switcher | Portfolio         |
| Regulator                 | All studies — **read-only** | Audit Trail       |

### 📊 Portfolio Dashboard

- Live KPI tiles: active studies, enrolled vs target, sites activated, open queries, overdue monitoring visits, open SAEs
- Per-study enrolment vs plan curves (Recharts — actual / expected / target)
- Severity-ranked alert sidebar, auto-refreshing every 30 seconds
- Sortable study grid with inline status, enrolment %, and SAE counts per study

### 🔬 Study Drill-Down

- Study header: protocol number, CTRI registration status, EC approval window, PI name
- Enrolment curve chart vs plan
- Milestone timeline (EC approval → database lock → close-out) with colour-coded status nodes
- Site activation table: capacity, status, PI name, activation date
- Protocol deviations log with EC-reporting status flag
- Open data queries with age-based colour coding (green / amber / red)

### 🚨 Alerts & Notifications

- Full alert log: enrolment lag, ethics renewals, CTRI updates, overdue monitoring visits, SAE timeline breaches
- Filter by severity (critical / warning / info) and rule type
- Per-alert acknowledgement with automatic audit trail write
- Live notification bell in top nav with unread badge counter

### 💊 Pharmacovigilance — AE Intake

- AE intake form: study / site / subject / onset / narrative / severity / causality / outcome / suspect drug
- Narrative-driven **semantic coding suggestions** with 400ms debounce — provenance always labelled
- SAE checkbox starts live **24-hour** and **14-day** regulatory countdown clocks
- Full AE log filterable by study and seriousness (SAE only toggle)
- **DSMB signals tab**: AEs aggregated by coded MedDRA-style term, ranked by frequency for committee review

### 🔐 Audit Trail

- Append-only, hash-chained record of every action: create, update, acknowledge, export, login, access-denied
- Before/after diff viewer per event
- **One-click chain verification** — walks the entire hash chain, reports the exact sequence number where any break occurs
- Filterable by actor ID, role, and date range

### 🌙 UX & Design

- Dark mode by default with one-click light mode toggle (persisted in `localStorage`)
- Glassmorphism design with animated video backdrop on all auth pages and the portfolio shell
- Smooth page transitions and micro-animations (Motion)
- Skeleton loaders on every async section — no layout shift
- Responsive: mobile → 4K widescreen
- Accessible: ARIA labels, keyboard navigation, `prefers-reduced-motion` support

---

## 🏗️ Architecture

```
src/
├── routes/                  # File-based routing via TanStack Router
│   ├── __root.tsx           # Root layout — QueryClient, AuthProvider, error/404 pages
│   ├── index.tsx            # Public landing page
│   ├── login.tsx            # Role-select sign-in (Clerk seam)
│   ├── sign-up.tsx          # Account provisioning info page
│   ├── portfolio.tsx        # Portfolio dashboard (post-auth)
│   ├── study.$studyId.tsx   # Per-study drill-down (dynamic route)
│   ├── alerts.tsx           # Full alert log + acknowledgement
│   ├── ae.tsx               # Pharmacovigilance — AE intake & DSMB signals
│   └── audit.tsx            # Hash-chained audit trail + verify
│
├── components/vw/           # Domain UI components
│   ├── AppShell.tsx         # Top nav, alert bell, role switcher, theme toggle
│   ├── VideoBackdrop.tsx    # Background video (ambient / hero / cinematic)
│   ├── KpiTile.tsx          # Animated KPI metric cards
│   ├── AlertBanner.tsx      # Per-alert card + acknowledge button
│   ├── EnrolmentChart.tsx   # Recharts enrolment vs plan curve
│   ├── AuditTable.tsx       # Hash-chain table + one-click verify button
│   ├── StudyGrid.tsx        # Sortable portfolio study table
│   ├── SignalTable.tsx      # DSMB term signal aggregation table
│   ├── TimelineClock.tsx    # Live SAE deadline countdown clocks
│   ├── Badges.tsx           # Status, severity, coding-source badges
│   ├── Skeletons.tsx        # Skeleton loaders (KPI row, table, panel)
│   └── RoleBadge.tsx        # Role label badge
│
├── lib/
│   ├── api.ts               # Typed API client — every fetch goes here, nowhere else
│   ├── auth.tsx             # Auth context (Clerk seam — swap internals to go live)
│   ├── roles.ts             # RBAC constants, nav map, label maps, MILESTONE_LABEL
│   ├── format.ts            # Date/number/enum formatters
│   └── utils.ts             # cn() tailwind merge utility
│
├── data/
│   └── fixtures.ts          # Synthetic stub data (seeded PRNG, anchored to NOW)
│
└── types/
    └── vitalwatch.ts        # Full TypeScript domain type definitions
```

### Stub Mode Architecture

The entire frontend runs **fully detached from any backend**. One environment variable controls it:

```bash
VITE_STUB_MODE=true   # default — uses seeded fixture data, ~260ms simulated latency
VITE_STUB_MODE=false  # live — hits VITE_API_URL with real HTTP requests
```

All API calls are centralized in `lib/api.ts`. No component ever calls `fetch` directly. Switching to a real backend requires changing **only** `api.ts` internals and the `auth.tsx` Clerk seam — nothing else.

---

## 🛠️ Tech Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Build tool    | Vite 8 + Rolldown                   |
| Framework     | React 19                            |
| Language      | TypeScript 5                        |
| Routing       | TanStack Router v1 (file-based)     |
| Data fetching | TanStack Query v5                   |
| Styling       | Tailwind CSS v4                     |
| Animation     | Motion v13 (formerly Framer Motion) |
| Charts        | Recharts v2                         |
| Icons         | Lucide React                        |
| Deployment    | GitHub Pages via GitHub Actions     |

---

## 🚀 Running Locally

**Prerequisites:** Node.js v20+ or Bun

```bash
# 1. Clone the repo
git clone https://github.com/IshanRayC/VITalWatch-Prototype.git
cd VITalWatch-Prototype

# 2. Install dependencies
npm install

# 3. Start the dev server (stub mode is on by default)
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

```bash
# Production build
npm run build

# Preview the production build locally
npm run preview
```

---

## 📦 Deploying Your Own Fork

The repo ships a ready-to-use GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Fork this repository
2. Go to **Settings → Pages → Build and deployment → Source → GitHub Actions**
3. Push any commit to `main` — the workflow fires automatically
4. Your site will be live at `https://<your-username>.github.io/VITalWatch-Prototype/`

The workflow builds with `VITE_STUB_MODE=true` so it works out of the box — no backend required.

---

## 🎭 Demo Accounts

On the login page, pick any persona from the list:

| Name                | Role                      | Landing           |
| ------------------- | ------------------------- | ----------------- |
| Dr. Arjun Mehta     | Principal Investigator    | Portfolio         |
| Priya Sharma        | Study Coordinator         | Portfolio         |
| Ravi Kumar          | Clinical Monitor          | Portfolio         |
| Dr. Ananya Iyer     | Ethics Committee          | Portfolio         |
| Suhana Patel        | Pharmacovigilance Officer | Pharmacovigilance |
| Admin               | Administrator             | Portfolio         |
| Regulatory Observer | Regulator (read-only)     | Audit Trail       |

> 💡 Sign in as **Administrator** to access the **"View as"** role switcher in the top nav — preview any role's perspective instantly without signing out.

---

## 👥 Team

Built for **Smart India Hackathon 2024** by:

| Member | GitHub |
| --- | --- |
| **Ishan Ray Chaudhuri (LEAD)** | [@IshanRayC](https://github.com/IshanRayC) |
| **Roxy** | [GitHub Username](https://github.com/USERNAME) |
| **Sreeja Kotra Reddy** | [GitHub Username](https://github.com/USERNAME) |
| **Kavin K** | [GitHub Username](https://github.com/USERNAME) |
| **Rakshitha S** | [GitHub Username](https://github.com/USERNAME) |

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
  <sub>Built with ❤️ for Smart India Hackathon</sub>
</div>

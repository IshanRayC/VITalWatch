<div align="center">

<img src="https://raw.githubusercontent.com/IshanRayC/VITalWatch/main/public/favicon.png" alt="VITalWatch logo" width="110" />

# VITalWatch

### Clinical Trial Management & Pharmacovigilance

A polished frontend prototype for clinical-trial oversight, safety monitoring, alerts, and auditability — built around **synthetic demo data only**.

<p>
  <a href="https://vital-watch-kv6h1b28i-ishanrayc.vercel.app/"><strong>🌐 Live Demo</strong></a>
  ·
  <a href="https://github.com/IshanRayC/VITalWatch"><strong>💻 Source Code</strong></a>
  ·
  <a href="https://vitalwatch.is-a.dev"><strong>🔗 Custom Domain</strong></a>
</p>

<p>
  <a href="https://github.com/IshanRayC">
    <img src="https://img.shields.io/badge/GitHub-IshanRayC-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub - IshanRayC" />
  </a>
  <a href="https://vercel.com/">
    <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deployed on Vercel" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React 19" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  </a>
</p>

<p>
  <a href="https://vite.dev/">
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  </a>
  <a href="https://tanstack.com/router">
    <img src="https://img.shields.io/badge/TanStack%20Router-v1-FF4154?style=flat-square" alt="TanStack Router v1" />
  </a>
  <a href="https://tanstack.com/query">
    <img src="https://img.shields.io/badge/TanStack%20Query-v5-FF4154?style=flat-square" alt="TanStack Query v5" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  </a>
  <img src="https://img.shields.io/github/last-commit/IshanRayC/VITalWatch?style=flat-square&logo=github" alt="Last commit" />
</p>

</div>

---

> [!WARNING]
> **Demo system — synthetic data only.** VITalWatch is a software prototype and is **not intended for real clinical use**. No real patient data is used or stored by this demo.

## 📌 Project Purpose

**VITalWatch** was built as a software engineering prototype for **Smart India Hackathon 2024 — Problem Statement 46**, focused on a unified **Clinical Trial Management System (CTMS)** and **Pharmacovigilance (PV)** experience for AIIA / NPvCC workflows.

The goal is to demonstrate how multiple clinical operations can be presented through one clear, modern interface:

- Trial portfolio oversight
- Site and enrolment monitoring
- Adverse-event and safety workflows
- Severity-based alerts
- Role-aware navigation and controls
- Audit-ready, hash-chained event history

The current build is a **frontend-first demo** backed by seeded synthetic fixtures, so it can be explored without a separate backend.

---

## 🌐 Live Demo

### Primary demo

**https://vital-watch-kv6h1b28i-ishanrayc.vercel.app/**

### Custom domain

**https://vitalwatch.is-a.dev**

> The custom `.is-a.dev` domain points to the same Vercel deployment once the domain registration and DNS activation are complete. The Vercel URL remains the fallback URL.

---

## ✨ Features

### 🏛️ Role-Based Access

Seven demo personas with role-aware navigation and presentation-level permissions:

| Role | Scope | Landing |
| --- | --- | --- |
| Principal Investigator | Own studies | Portfolio |
| Study Coordinator | Own sites | Portfolio |
| Clinical Monitor | Assigned studies | Portfolio |
| Ethics Committee | All studies | Portfolio |
| Pharmacovigilance Officer | All studies | Pharmacovigilance |
| Administrator | Full access + role switching | Portfolio |
| Regulator | Read-only | Audit Trail |

### 📊 Portfolio Dashboard

- Live KPI tiles for studies, enrolment, sites, queries, monitoring visits, and SAEs
- Enrolment-versus-plan visualisations
- Severity-ranked alerts
- Sortable study grid
- Automatic alert refresh

### 🔬 Study Drill-Down

- Protocol and CTRI status
- EC approval window
- Enrolment curve
- Milestone timeline
- Site activation tracking
- Protocol deviation history
- Open data queries

### 💊 Pharmacovigilance

- Adverse-event intake
- Severity, causality, outcome, and suspect-drug fields
- Coding suggestions with provenance
- SAE deadline countdowns
- AE filtering
- DSMB signal aggregation

### 🚨 Alerts & Notifications

- Enrolment lag
- Ethics renewals
- CTRI updates
- Overdue monitoring visits
- SAE timeline breaches
- Alert acknowledgement and audit logging

### 🔐 Audit Trail

- Append-only event history
- Hash chaining
- Before/after change view
- One-click chain verification
- Actor, role, and date filtering

### 🌙 UX & Design

- Dark mode by default
- Light/dark theme toggle
- Responsive layouts
- Motion-based transitions
- Skeleton loading states
- Keyboard and accessibility considerations
- Self-contained CSS ambient background with no Lovable-hosted runtime assets

---

## 🧭 How to Use the Demo

1. Open the [live demo](https://vital-watch-kv6h1b28i-ishanrayc.vercel.app/).
2. Click **Sign in**.
3. Choose any demo persona — no account creation is required.
4. Explore **Portfolio**, **Study**, **Alerts**, **Pharmacovigilance**, and **Audit Trail**.
5. Try **Administrator → View as** to preview different role perspectives.
6. Open **Audit Trail** and use the verification control to inspect the hash chain.

### Demo personas

| Persona | What to explore |
| --- | --- |
| Administrator | Role switching and full dashboard navigation |
| Pharmacovigilance Officer | AE intake, safety signals, and reporting clocks |
| Regulator | Read-only interface and audit trail |
| Principal Investigator | Study portfolio and study-level oversight |
| Study Coordinator | Site-focused workflow |
| Clinical Monitor | Assigned-study monitoring |
| Ethics Committee | Cross-study oversight |

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript 5 |
| Build tool | Vite 8 |
| Routing | TanStack Router v1 |
| Data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Components | Radix UI + shadcn/ui patterns |
| Animation | Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Validation | Zod |
| Runtime / deployment | TanStack Start + Nitro + Vercel |

---

## 🏗️ Architecture

```text
src/
├── routes/                  # File-based application routes
│   ├── __root.tsx           # Root layout, providers, error/404 handling
│   ├── index.tsx            # Public landing page
│   ├── login.tsx            # Demo role selection
│   ├── sign-up.tsx          # Access request information
│   ├── portfolio.tsx        # Portfolio dashboard
│   ├── study.$studyId.tsx   # Study drill-down
│   ├── alerts.tsx           # Alert log
│   ├── ae.tsx               # Pharmacovigilance / AE intake
│   └── audit.tsx            # Audit trail and verification
│
├── components/
│   ├── ui/                  # Reusable UI primitives
│   └── vw/                  # VITalWatch domain components
│
├── lib/
│   ├── api.ts               # Centralised API / stub client
│   ├── auth.tsx             # Demo auth / session layer
│   ├── roles.ts             # Roles, navigation, RBAC helpers
│   ├── format.ts            # Formatting utilities
│   └── utils.ts             # Shared utilities
│
├── data/
│   └── fixtures.ts          # Seeded synthetic demo data
│
└── types/
    └── vitalwatch.ts        # Domain type definitions
```

### Stub mode

The application is designed to work without a backend:

```bash
VITE_STUB_MODE=true
```

For a future live backend configuration:

```bash
VITE_STUB_MODE=false
VITE_API_URL=https://api.example.org
```

All API access is centralised in `src/lib/api.ts`, keeping UI components decoupled from backend implementation details.

---

## 🚀 Run Locally

### Prerequisites

- **Node.js 20+** or **Bun**
- Git

### 1. Clone the repository

```bash
git clone https://github.com/IshanRayC/VITalWatch.git
cd VITalWatch
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Start the development server

```bash
npm run dev
```

Then open **http://localhost:5173**.

### 4. Create a production build

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

---

## ☁️ Deploy to Vercel

VITalWatch is configured for **Vercel + TanStack Start + Nitro**.

### Easiest method

1. Open [Vercel New Project](https://vercel.com/new).
2. Sign in with GitHub.
3. Import **`IshanRayC/VITalWatch`**.
4. Keep the repository root as the project root.
5. Let Vercel detect the project configuration.
6. Click **Deploy**.

Because the demo uses synthetic stub data by default, no backend is required for the public demo.

### Custom domain

To connect `vitalwatch.is-a.dev`, use the is-a.dev registration process and then add the domain under:

**Vercel → Project → Settings → Domains**

For the current registration request, see [PR #52994](https://github.com/is-a-dev/register/pull/52994).

---

## 🔒 Security & Data Notes

- This repository contains **synthetic demo data only**.
- The application is a prototype and should not be used with real patient information.
- The regulator interface demonstrates UI-level read-only controls; this build does not provide production-grade server-side RBAC.
- Backend integration, production authentication, persistence, and regulatory validation are outside the current demo scope.

---

## 📁 Repository

**GitHub:** https://github.com/IshanRayC/VITalWatch

**Owner:** [@IshanRayC](https://github.com/IshanRayC)

---

## 👤 Author

<div align="center">

<a href="https://github.com/IshanRayC">
  <img src="https://img.shields.io/badge/Ishan%20Ray%20Chaudhuri-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Ishan Ray Chaudhuri on GitHub" />
</a>

<br />

<sub>Computer Science · Software Engineering · AI/ML · Data Science</sub>

</div>

---

## 📄 License

No license file is currently included in this repository. Add an explicit `LICENSE` file before distributing or reusing the project under specific open-source terms.

<div align="center">

### Built with ❤️ for Smart India Hackathon

</div>

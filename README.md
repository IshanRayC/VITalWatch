<div align="center">

<img src="https://raw.githubusercontent.com/IshanRayC/VITalWatch/main/public/favicon.png" alt="VITalWatch logo" width="118" />

# VITalWatch

### 🧬 Clinical Trial Management × Pharmacovigilance

<p>
  <strong>A modern frontend prototype for clinical-trial oversight, safety monitoring, alerts, and auditability.</strong><br/>
  Built as a unified experience around synthetic clinical data and role-aware workflows.
</p>

<br/>

<a href="https://vital-watch-sand.vercel.app/">
  <img src="https://img.shields.io/badge/%E2%96%B6%20LIVE%20DEMO-22D3EE?style=for-the-badge&logo=vercel&logoColor=0B1118" alt="Live Demo" />
</a>
<a href="https://github.com/IshanRayC/VITalWatch">
  <img src="https://img.shields.io/badge/%E2%96%A0%20SOURCE-0B1118?style=for-the-badge&logo=github&logoColor=22D3EE" alt="Source Code" />
</a>
<a href="https://github.com/IshanRayC">
  <img src="https://img.shields.io/badge/%E2%9C%A6%20AUTHOR-IshanRayC-0EA5E9?style=for-the-badge&logo=github&logoColor=white" alt="Author GitHub" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/REACT-19-22D3EE?style=flat-square&logo=react&logoColor=0B1118" alt="React 19" />
<img src="https://img.shields.io/badge/TYPESCRIPT-5-38BDF8?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
<img src="https://img.shields.io/badge/VITE-8-6366F1?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
<img src="https://img.shields.io/badge/TANSTACK-ROUTER%20%2B%20QUERY-0EA5E9?style=flat-square" alt="TanStack Router and Query" />
<img src="https://img.shields.io/badge/TAILWIND-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
<img src="https://img.shields.io/github/last-commit/IshanRayC/VITalWatch?style=flat-square&logo=github&label=LAST%20COMMIT" alt="Last commit" />

</div>

---

> [!WARNING]
> **DEMO SYSTEM • SYNTHETIC DATA ONLY**
>
> VITalWatch is a software prototype and is **not intended for real clinical use**. It does not use or store real patient information.

## ⚡ PROJECT // VITALWATCH

VITalWatch was developed as a frontend-first prototype for **Smart India Hackathon 2024 — Problem Statement 46**, exploring a unified **Clinical Trial Management System (CTMS)** and **Pharmacovigilance (PV)** experience for AIIA / NPvCC-oriented workflows.

The core idea is simple:

> **Bring study oversight, safety monitoring, alerts, role-based access, and auditability into one focused interface.**

### SYSTEM OBJECTIVES

| Module | Focus |
| :--- | :--- |
| 🧪 **Trial Operations** | Studies, sites, enrolment, milestones, monitoring |
| 💊 **Pharmacovigilance** | Adverse events, severity, causality, outcomes |
| 🚨 **Alerts** | Time-sensitive safety and operational notifications |
| 👥 **Role Access** | Persona-aware navigation and presentation-level permissions |
| 🔐 **Auditability** | Append-only events, hash chaining, verification |
| 📊 **Analytics** | KPIs, trends, enrolment tracking, safety signals |

---

## 🌐 LIVE // DEPLOYMENT

<div align="center">

### ▶️ [OPEN VITALWATCH](https://vital-watch-sand.vercel.app/)

**Live Vercel deployment**

<br/>

<a href="https://vital-watch-sand.vercel.app/">
  <img src="https://img.shields.io/badge/STATUS-%E2%97%89%20ONLINE-22D3EE?style=for-the-badge&logo=vercel&logoColor=0B1118" alt="Deployment status" />
</a>

</div>

---

## ✨ FEATURES // CORE SYSTEMS

### 🏛️ Role-Based Access

Seven demo personas provide different navigation and presentation-level views:

| Persona | Primary scope |
| :--- | :--- |
| 🧑‍⚕️ Principal Investigator | Own studies |
| 📋 Study Coordinator | Own sites |
| 🔎 Clinical Monitor | Assigned studies |
| ⚖️ Ethics Committee | Cross-study oversight |
| 💊 Pharmacovigilance Officer | Safety workflows |
| 🛠️ Administrator | Full access + role switching |
| 🏛️ Regulator | Read-only + audit access |

### 📊 Portfolio Command Center

- Study, site, enrolment, query, monitoring-visit, and SAE KPIs
- Enrolment-versus-plan visualisations
- Severity-ranked alerts
- Sortable study overview
- Automatic alert refresh

### 🔬 Study Intelligence

- Protocol and CTRI status
- Ethics approval windows
- Enrolment curves
- Milestone timelines
- Site activation tracking
- Protocol deviation history
- Open data queries

### 💊 Pharmacovigilance Desk

- Adverse-event intake
- Severity, causality, outcome, and suspect-drug capture
- Coding suggestions with provenance
- SAE deadline countdowns
- AE filtering
- DSMB signal aggregation

### 🚨 Alert Engine

- Enrolment lag
- Ethics renewals
- CTRI updates
- Overdue monitoring visits
- SAE timeline breaches
- Alert acknowledgement with audit logging

### 🔐 Audit Trail

- Append-only event history
- Hash chaining
- Before/after change inspection
- Chain verification
- Actor, role, and date filtering

### 🌙 Interface

- Dark-first visual system
- Light / dark theme toggle
- Responsive layouts
- Motion-based transitions
- Skeleton loading states
- Keyboard and accessibility considerations
- Self-contained visual background with no Lovable-hosted runtime assets

---

## 🧭 DEMO // HOW TO USE

### 01 — Open

Go to **[vital-watch-sand.vercel.app](https://vital-watch-sand.vercel.app/)**.

### 02 — Sign in

Click **Sign in** on the landing page.

### 03 — Pick a persona

Choose any demo persona. **No account creation is required.**

### 04 — Explore the system

**Portfolio** → **Study** → **Alerts** → **Pharmacovigilance** → **Audit Trail**

### 05 — Switch perspective

Use **Administrator → View as** to preview different role experiences.

### 06 — Verify the chain

Open **Audit Trail** and use the verification control to inspect the event hash chain.

### QUICK TOUR

| Start here | Try this |
| :--- | :--- |
| 🛠️ Administrator | Role switching + complete dashboard |
| 💊 Pharmacovigilance Officer | AE intake + safety signals + reporting clocks |
| 🏛️ Regulator | Read-only workflows + audit trail |
| 🧑‍⚕️ Principal Investigator | Study portfolio + oversight |
| 📋 Study Coordinator | Site-focused operations |
| 🔎 Clinical Monitor | Assigned-study monitoring |
| ⚖️ Ethics Committee | Cross-study review |

---

## 🧰 STACK // TECHNOLOGY

| Layer | Technology |
| :--- | :--- |
| ⚛️ UI | React 19 |
| 🟦 Language | TypeScript 5 |
| ⚡ Build | Vite 8 |
| 🧭 Routing | TanStack Router v1 |
| 🔄 Data | TanStack Query v5 |
| 🎨 Styling | Tailwind CSS v4 |
| 🧩 Components | Radix UI + shadcn/ui patterns |
| ✨ Motion | Motion |
| 📈 Charts | Recharts |
| 🖱️ Icons | Lucide React |
| ✅ Validation | Zod |
| ☁️ Runtime | TanStack Start + Nitro + Vercel |

---

## 🏗️ ARCHITECTURE // MAP

~~~text
VITalWatch/
├── public/
│   └── favicon.png
│
├── src/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── sign-up.tsx
│   │   ├── portfolio.tsx
│   │   ├── study.$studyId.tsx
│   │   ├── alerts.tsx
│   │   ├── ae.tsx
│   │   └── audit.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── vw/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.tsx
│   │   ├── roles.ts
│   │   ├── format.ts
│   │   └── utils.ts
│   │
│   ├── data/
│   │   └── fixtures.ts
│   │
│   └── types/
│       └── vitalwatch.ts
│
└── vercel.json
~~~

### Stub-first architecture

VITalWatch works without a backend through seeded fixture data:

~~~env
VITE_STUB_MODE=true
~~~

Future live API configuration can be introduced through:

~~~env
VITE_STUB_MODE=false
VITE_API_URL=https://api.example.org
~~~

API access is centralised in **src/lib/api.ts** so the UI stays decoupled from backend implementation details.

---

## 🚀 DEVELOPMENT // LOCAL

### Prerequisites

- **Node.js 20+** or **Bun**
- **Git**

### Clone

~~~bash
git clone https://github.com/IshanRayC/VITalWatch.git
cd VITalWatch
~~~

### Install

Using npm:

~~~bash
npm install
~~~

Or Bun:

~~~bash
bun install
~~~

### Run

~~~bash
npm run dev
~~~

Then open:

**http://localhost:5173**

### Build

~~~bash
npm run build
~~~

### Preview

~~~bash
npm run preview
~~~

---

## ☁️ DEPLOYMENT // VERCEL

VITalWatch is configured for **Vercel + TanStack Start + Nitro**.

1. Open [Vercel New Project](https://vercel.com/new).
2. Sign in with GitHub.
3. Import **IshanRayC/VITalWatch**.
4. Keep the repository root as the project root.
5. Let Vercel detect the project configuration.
6. Click **Deploy**.

No separate backend is required for the current synthetic-data demo.

---

## 🔒 SECURITY // DATA

- 🧪 Synthetic demo data only
- 🚫 Not for real patient information
- 🛡️ Regulator controls are presentation-level in this build
- 🔑 Production authentication and server-side RBAC are outside the current demo scope
- 🗄️ Persistence and backend integration are intentionally separated from the frontend prototype

---

## 👤 AUTHOR // ISHAN RAY CHAUDHURI

<div align="center">

<a href="https://github.com/IshanRayC">
  <img src="https://img.shields.io/badge/GITHUB-ISHANRAYC-0B1118?style=for-the-badge&logo=github&logoColor=22D3EE" alt="GitHub" />
</a>
<a href="https://www.linkedin.com/in/ishan-ray-chaudhuri/">
  <img src="https://img.shields.io/badge/LINKEDIN-06B6D4?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
</a>
<a href="https://leetcode.com/u/IshanRayC">
  <img src="https://img.shields.io/badge/LEETCODE-22D3EE?style=for-the-badge&logo=leetcode&logoColor=0B1118" alt="LeetCode" />
</a>
<a href="https://codeforces.com/profile/IshanRayC">
  <img src="https://img.shields.io/badge/CODEFORCES-0EA5E9?style=for-the-badge&logo=codeforces&logoColor=white" alt="Codeforces" />
</a>
<a href="https://www.kaggle.com/ishanrayc">
  <img src="https://img.shields.io/badge/KAGGLE-0891B2?style=for-the-badge&logo=kaggle&logoColor=white" alt="Kaggle" />
</a>

<br/><br/>

<sub>Computer Science · Software Engineering · AI/ML · Data Science</sub>

</div>

---

## 📁 REPOSITORY // LINKS

| Resource | Link |
| :--- | :--- |
| 🌐 Live Demo | [vital-watch-sand.vercel.app](https://vital-watch-sand.vercel.app/) |
| 💻 Source Code | [IshanRayC/VITalWatch](https://github.com/IshanRayC/VITalWatch) |
| 👤 GitHub | [@IshanRayC](https://github.com/IshanRayC) |

---

<div align="center">

### // BUILT WITH ❤️ FOR SMART INDIA HACKATHON

<sub>VITalWatch • Clinical Trial Management & Pharmacovigilance • Synthetic Demo System</sub>

</div>

# CloudCost IQ — Multi-Cloud Asset Cost Optimization Portal

**Course:** Software Engineering Lab (Dept. of CSE, PES University)  
**Student Name:** Navaneeth Tanuboddi  
**SRN:** PES1UG24CS709  
**Problem Statement #45:** Multi-Cloud Asset Cost Optimization Portal  
**Primary Domain:** Developer Tools, Cloud Operations & FinOps  

---

## 🌟 Overview

**CloudCost IQ** is a production-grade FinOps analytics, monitoring, and automated remediation web application designed to eliminate financial waste across heterogeneous multi-cloud environments (AWS, Microsoft Azure, and Google Cloud Platform).

It addresses the fundamental operational challenges of modern cloud infrastructure: fragmented billing data, unmonitored idle compute workloads, orphaned persistent block storage volumes, and budget overruns.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** React 18 (TypeScript)
- **Build Tool & Bundler:** Vite 6
- **Styling & Design System:** Tailwind CSS (Dark FinOps executive theme)
- **Data Visualization & Charts:** Recharts (Responsive Area, Bar, and Donut charts)
- **Icons & UI Micro-interactions:** Lucide React, Canvas Confetti
- **Document Generation:** jsPDF & jsPDF-AutoTable (Client-side executive PDF audits)
- **Billing Normalization:** FinOps Open Cost & Usage Specification (FOCUS 1.0) parser

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Run Commands

```bash
# Navigate to the project directory
cd project

# Install dependencies
npm install

# Launch development server (with HMR)
npm run dev

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The application runs locally at `http://localhost:5173`.

---

## 💡 Core Features & Lab Requirement Mappings

### 1. Executive FinOps Dashboard (`src/components/ExecutiveDashboard.tsx`)
- Maps to **FR-001** and **Jira Story 2.1 (MCCOP-8)**.
- Real-time KPI summary: Total Monthly Spend ($122,850/mo), Annualized Run-Rate ($1,474,200), Projected Potential Savings ($1,230/mo), and FinOps Maturity Score (78/100).
- Multi-cloud monthly spend trend graphs (AWS vs Azure vs GCP vs Kubernetes).
- Department cost breakdown (Engineering, Data Science, Product, Security).

### 2. Compute Optimization Engine (`src/components/ComputeOptimization.tsx`)
- Maps to **FR-002** and **Jira Story 3.2 (MCCOP-12)**.
- 14-day rolling telemetry evaluation ($	ext{Avg CPU} < 5\%$ and $	ext{Network I/O} < 100	ext{ MB/day}$).
- Automated classification into `IDLE`, `UNDERUTILIZED`, `OPTIMAL`, and `EXEMPT_IDLE`.
- Tag policy exemption handling (e.g. `Environment=DisasterRecovery` workloads are protected from termination).

### 3. Storage & Disk Optimization (`src/components/StorageOptimization.tsx`)
- Maps to **FR-003** and **Jira Story 3.1 (MCCOP-11)**.
- Detects unattached EBS volumes, Azure Managed Disks, and GCP Persistent Disks detached for $> 7$ days.
- Modernization assistant for migrating legacy AWS `gp2` volumes to higher performance, lower cost `gp3` tiers (saving 20%).

### 4. Budget Center & Alerting (`src/components/BudgetCenter.tsx`)
- Maps to **FR-004** and **Jira Story 4.1 & 4.2 (MCCOP-13, MCCOP-14)**.
- Department budget limits with multi-tier thresholds ($80\%$ warning, $90\%$ critical, $100\%$ breach).
- Multi-channel notification simulations across Slack, Email, PagerDuty, and Webhooks.
- Interactive spend spike simulator to test threshold alarms.

### 5. Automated Remediation Hub (`src/components/RemediationHub.tsx`)
- Maps to **FR-005** and **Jira Story 1.1 & 3.1**.
- Role-Based Access Control (RBAC): FinOps Analyst (audit view) vs Cloud Administrator (execution approval).
- Generates reproducible Terraform IaC code and AWS/Azure/GCP CLI commands for safety snapshotting and resource decommissioning.
- One-click execution and instant rollback mechanism.

### 6. Multi-Cloud Ingestion Engine (`src/services/billingParser.ts`)
- Maps to **FR-001** and **Jira Story 1.2 & 1.3 (MCCOP-6, MCCOP-7)**.
- Ingests raw AWS Cost and Usage Reports (CUR), Azure Cost Management exports, GCP Cloud Billing exports, and maps them to the FinOps FOCUS 1.0 normalized schema.

---

## 📁 Directory Structure

```
project/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── main.tsx                    # React application root
    ├── App.tsx                     # Main layout, router tabs & modal controller
    ├── components/                 # Modular UI components
    │   ├── ExecutiveDashboard.tsx
    │   ├── ComputeOptimization.tsx
    │   ├── StorageOptimization.tsx
    │   ├── BudgetCenter.tsx
    │   ├── RemediationHub.tsx
    │   └── Navbar.tsx
    ├── data/                       # Mock cloud inventories & sample CSVs
    │   ├── mockCloudData.ts
    │   └── sampleCsvs.ts
    ├── services/                   # Business logic engines
    │   ├── billingParser.ts
    │   ├── idleDetector.ts
    │   ├── storageAnalyzer.ts
    │   ├── budgetEngine.ts
    │   ├── remediationEngine.ts
    │   └── reportGenerator.ts
    ├── styles/                     # Tailwind styling & glassmorphic utilities
    │   └── index.css
    └── types/                      # TypeScript definitions & schemas
        └── finops.ts
```

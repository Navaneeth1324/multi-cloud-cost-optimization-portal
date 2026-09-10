# Multi-Cloud Asset Cost Optimization Portal (CloudCost IQ)

> **Course:** Software Engineering Lab — Dept. of CSE, PES University  
> **Student Name:** Navaneeth Tanuboddi  
> **SRN:** PES1UG24CS709  
> **Problem Statement #45:** Multi-Cloud Asset Cost Optimization Portal  
> **Primary Domain:** Developer Tools, Cloud Operations & FinOps  

---

## 📑 Repository Structure & Lab Deliverables

This repository is organized into dedicated folders for each lab deliverable and the implementation codebase:

```
multi-cloud-cost-optimization-portal/
├── Lab-1/                     # Lab 1: Requirements Engineering & UML Use-Case Modelling
│   └── README.md              # SRS, Functional/NFR specs, Actors, Mermaid diagram, and Use Case flows
├── Lab-2/                     # Lab 2: Agile Backlog Creation & Sprint Simulation in Jira
│   ├── README.md              # Jira Epics & User Stories, Story Points, Sprint Board, Burndown & Reflection Q&A
│   ├── Lab2_Agile_Backlog_Jira_PES1UG24CS709.pdf  # Original submitted lab report PDF
│   └── screenshots/           # High-resolution Jira backlog, sprint, and burndown chart screenshots
├── Lab-3/                     # Lab 3: Component Modelling & Architectural Pattern Selection
│   ├── README.md              # Architectural evaluation, MCCOP & Coffee Kiosk diagrams, ball-and-socket specs, justification
│   ├── Lab3_Component_Modelling_PES1UG24CS709.pdf  # Formatted publication-ready lab submission PDF
│   └── diagrams/              # High-resolution 300 DPI UML component diagrams with ball-and-socket notation
├── project/                   # Multi-Cloud Cost Optimization Portal Web Application (CloudCost IQ)
│   ├── README.md              # Project overview, architecture, module mapping, and run instructions
│   ├── package.json           # React 18, Vite 6, Tailwind CSS, Recharts, Lucide, jsPDF
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/                   # Complete frontend application source code
└── README.md                  # Main repository index & executive summary
```

---

## 🧭 Navigation Quick Links

| Module | Scope / Content | Direct Link |
| :--- | :--- | :---: |
| **Lab 1: Requirements & UML Modelling** | SRS, Functional & Non-Functional Requirements, Mermaid Use-Case Model, Detailed Flow of Events | [**Lab-1/README.md**](Lab-1/README.md) |
| **Lab 2: Agile Backlog & Jira Sprint** | 10 Jira User Stories (MCCOP-5 to MCCOP-14), Planning Poker / Fibonacci Estimations, Active Sprint Board, Burndown Chart Analysis, Reflection Q&A | [**Lab-2/README.md**](Lab-2/README.md) |
| **Lab 2 Report (PDF)** | Original PDF submission with Jira backlog, story points, sprint board, and burndown chart screenshots | [**Download Lab 2 PDF**](Lab-2/Lab2_Agile_Backlog_Jira_PES1UG24CS709.pdf) |
| **Lab 3: Component Modelling & Architecture** | Architectural pattern evaluations, ball-and-socket UML component diagrams (MCCOP & Coffee Kiosk), interface specs, and 1-page written justification | [**Lab-3/README.md**](Lab-3/README.md) |
| **Lab 3 Report (PDF)** | Publication-ready PDF submission report with embedded high-res diagrams, comparative tables, and written justification | [**Download Lab 3 PDF**](Lab-3/Lab3_Component_Modelling_PES1UG24CS709.pdf) |
| **Project Implementation** | Full-featured interactive React/TypeScript FinOps portal application | [**project/**](project/) |

---

## 🚀 Running the Project Locally

The complete interactive FinOps web portal is located in the [`project/`](project/) directory:

```bash
# 1. Clone the repository
git clone https://github.com/Navaneeth1324/multi-cloud-cost-optimization-portal.git
cd multi-cloud-cost-optimization-portal/project

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

The portal runs locally at `http://localhost:5173`.

---

## 💡 System Overview & Implemented Capabilities

**CloudCost IQ** is an IT operations and FinOps analytics platform designed to eliminate multi-cloud waste across AWS, Azure, and GCP:
1. **Multi-Cloud Billing Ingestion (FR-001, Stories 1.1–1.3):** Ingests and normalizes raw billing reports (AWS CUR, Azure Cost Export, GCP Billing, FOCUS 1.0) with tag categorization.
2. **Idle Compute Detection (FR-002, Story 3.2):** Flags VMs with < 5% average CPU utilization over 14 rolling days with exemption tag checks (`Environment=DisasterRecovery`).
3. **Unattached Storage Volumes (FR-003, Story 3.1):** Scans for detached block storage volumes (> 7 days) and supports gp2 to gp3 storage tier migration.
4. **Budget Management & Multi-Channel Alerting (FR-004, Stories 4.1–4.2):** Departmental budget tracking with real-time alerts across Slack, Email, and PagerDuty.
5. **Automated Remediation Engine (FR-005):** Role-Based Access Control (RBAC) with reproducible Terraform IaC generation, AWS/Azure/GCP CLI commands, and safety snapshots.
6. **Executive PDF Audit Generator:** Client-side vector PDF audit reports generated on-demand.

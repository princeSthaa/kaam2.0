# Production Feature Module Architecture

Welcome to the **Production Module**! This folder encapsulates all frontend features related to manufacturing planning, demand management, stage routing, and pipeline visualization.

---

## 📁 Directory Structure & Responsibilities

```
app/(modules)/production/
├── api/                    # API Service Calls (fetch plans, create plan, check materials)
├── components/             # Reusable UI Components (PlanRow, StatusBadge, MetricGrid)
├── constants/              # Shared Enums & Selection Lists (SIZES, FABRIC_CATEGORIES)
├── dto/                    # Server Data Transfer Objects (ProductionPlanDto, MaterialDto)
├── hooks/                  # Custom React Hooks (useProductionPlans, useProductionKPIs)
├── jobs/                   # Background Async Jobs & Offline Draft Sync Routines
├── lib/                    # Helper Utilities (adToBs date conversion, formatRs currency)
├── schemas/                # Form Input Validation Rules & Guard Functions
├── styles/                 # Local Module Stylesheets (production-plans.css, plan.css)
├── types/                  # Client-side View State Interfaces (ProductionFilterState)
└── [feature-routes]/       # Next.js App Router Page Views (plans, in-progress, board)
```

---

## 🚀 Beginner Quick-Start Guide

### 1. Where do I add a new API request?
Edit `app/(modules)/production/api/production.api.ts`. Keep raw `fetch` logic inside this file so components stay clean.

### 2. How do I format dates in Nepali (BS)?
Use `formatNepaliDate` or `adToBs` from `app/(modules)/production/lib/production-utils.ts`:
```typescript
import { formatNepaliDate } from "@/app/(modules)/production/lib/production-utils";

const bsDate = formatNepaliDate("2026-07-22"); // Outputs: "2083-04-06 BS"
```

### 3. How do I fetch production plans in a page?
Use the custom `useProductionPlans` hook:
```typescript
import { useProductionPlans } from "@/app/(modules)/production/hooks";

export default function MyPage() {
  const { plans, loading, error } = useProductionPlans("in-progress");
  if (loading) return <div>Loading...</div>;
  return <div>Loaded {plans.length} plans</div>;
}
```

### 4. How do I render a plan status badge?
Use the `<StatusBadge />` component:
```typescript
import { StatusBadge } from "@/app/(modules)/production/components/StatusBadge";

<StatusBadge status="In Progress" size="sm" />
```

---

## 🎨 Styling Rules
All production module styles live inside `app/(modules)/production/styles/index.css`.  
Global layout rules stay in `app/styles/globals.css`.

# Phase 1: Target Architecture Definition & Legacy Inventory

## 1. Target Architecture & Folder Mapping

Based on the blueprint, the reference implementation in `frontend/my-app` will be mapped into the `try` directory as follows:

| Legacy Location | Target Location (`try/app/`) | Action |
| :--- | :--- | :--- |
| `app/components/ui/` | `components/ui/` | Extract and keep |
| `app/components/legacy-ui/` | `components/ui/` | Refactor to modernize |
| `app/legacy/classNames.ts` | `lib/classNames.ts` | Keep |
| `app/legacy/navigation.ts` | `navigation/index.ts` & `(modules)/*/navigation.ts` | Split and refactor |
| `app/components/legacy-pages/crm/` | `(modules)/crm/` | Extract logic to module |
| `app/CRM/*` | `(modules)/crm/` | Rewrite into resource routes |
| `app/components/legacy-pages/production/` | `(modules)/production/` | Extract logic to module |
| `app/Production/*` | `(modules)/production/` | Rewrite into resource routes |
| `app/components/legacy-pages/warehouse/` | `(modules)/warehouse/` | Extract logic to module |
| `app/Warehouse/*` | `(modules)/warehouse/` | Rewrite into resource routes |
| `app/generated/` | `(modules)/*/services/` | Delete/Replace with API |

---

## 2. Legacy File Inventory

Every file identified in `frontend/my-app` has been strictly categorized:

### 🟩 KEEP (Move directly, minor import updates)
* `app/globals.css` -> `try/app/styles/globals.css`
* `app/layout.tsx` -> `try/app/layout.tsx`
* `app/favicon.ico` -> `try/app/favicon.ico`
* `app/components/ui/IconButton.tsx`
* `app/components/ui/MaterialIcon.tsx`
* `app/components/ui/NepaliDatePicker.tsx`
* `app/components/ui/RawHtml.tsx`
* `app/components/AppHeader.tsx` -> `try/app/components/layout/AppHeader.tsx`
* `app/components/GlobalHeadLinks.tsx` -> `try/app/components/layout/GlobalHeadLinks.tsx`
* `app/legacy/classNames.ts` -> `try/app/lib/classNames.ts`

### 🟨 REFACTOR (Needs modernization, component isolation, or state management)
* `app/components/Sidebar.tsx` -> Refactor to use new modular navigation registry.
* `app/components/ui/NavLink.tsx`, `NavList.tsx`, `PageShell.tsx` -> Refactor generic layout shells.
* `app/components/legacy-ui/BootstrapCard.tsx`, `FormField.tsx`, `ActionButton.tsx`, `TableShell.tsx`, `EmptyState.tsx`, `PageHeader.tsx` -> Refactor and move to `try/app/components/ui/`.
* `app/legacy/navigation.ts` -> Break apart into `try/app/(modules)/*/navigation.ts`.
* `app/legacy/routing.ts` -> Refactor into `try/app/lib/routing.ts` or replace with native Next.js router.
* `app/components/legacy-ui/WarehousePageHeader.tsx` -> Refactor into `try/app/(modules)/warehouse/components/WarehousePageHeader.tsx`.
* All files in `app/Production/Index/components/` and `app/Production/InProgress/components/` -> Refactor into `try/app/(modules)/production/components/`.

### 🟧 REWRITE (Business logic extraction, strict layering enforcement)
* All files in `app/components/legacy-pages/crm/*` -> Extract data fetching to services, validation to schemas, UI to `try/app/(modules)/crm/pages/`.
* All files in `app/components/legacy-pages/production/*` -> Rewrite into `try/app/(modules)/production/pages/` and `components/`.
* All files in `app/components/legacy-pages/warehouse/*` -> Rewrite into `try/app/(modules)/warehouse/pages/`.
* Action-based route folders (e.g., `app/Production/Customer/CreateCustomer/page.tsx`) -> Rewrite into resource routes (e.g., `try/app/(modules)/production/customers/new/page.tsx`).

### 🟥 REPLACE (Mock data/legacy tools to be swapped with enterprise standards)
* `app/generated/page-data/*` -> Replace with ASP.NET Core API fetches inside `services/`.
* `app/generated/pages.ts`, `types.ts` -> Replace with dynamically mapped domain interfaces in `types/`.
* `app/components/legacy-pages/shared/DefaultPages.tsx` -> Replace with explicit custom pages or generator outputs.
* `app/components/ui/ScriptMount.tsx`, `app/components/LegacyScriptLoader.tsx`, `app/legacy/scripts.ts` -> Replace with native React behaviors (removing jQuery/DOM dependencies).

### ⬛ DELETE (Dead code, redundant legacy wrappers)
* `app/components/LegacyPage.tsx`
* `app/components/LegacyPageContent.tsx`
* `app/legacy/styles.ts` (if injecting obsolete global styles).
* `app/legacy/pageOverrides.tsx`
* Empty action-based route folders once migrated.

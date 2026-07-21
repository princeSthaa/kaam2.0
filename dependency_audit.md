# Phase 2: Dependency Analysis & Core Infrastructure Audit

Before executing the core infrastructure migration (Phase 4), a strict dependency analysis of the target components was conducted to prevent circular dependencies and broken runtime paths.

## 1. Global Layout Dependencies (`app/layout.tsx`)
**Responsibility:** Root HTML shell and global style injection.
**Depends on:**
* `globals.css`
* `components/GlobalHeadLinks.tsx` (which dynamically mounts legacy CSS/JS arrays if needed)
**Target Migration:** `try/app/layout.tsx` (Move directly. `GlobalHeadLinks` moves to `components/layout/`).

## 2. Navigation Architecture (`app/legacy/navigation.ts`)
**Responsibility:** Hardcoded URL registry for the Topbar and Sidebar.
**Current Exports:**
* `topLinks` array
* `sidebarMap` object (keys: `production`, `crm`, `warehouse`)
* Types: `SidebarLink`, `SidebarSection`
**Target Migration:** 
* Types → `try/app/navigation/index.ts`
* `sidebarMap.crm` → `try/app/(modules)/crm/navigation.ts`
* `sidebarMap.production` → `try/app/(modules)/production/navigation.ts`
* `sidebarMap.warehouse` → `try/app/(modules)/warehouse/navigation.ts`

## 3. Topbar (`app/components/AppHeader.tsx`)
**Responsibility:** Global top navigation and profile controls.
**Depends on:**
* `legacy/navigation.ts` (for `topLinks`)
* `legacy/routing.ts` (for `activeTopLink` regex matching)
* `ui/NavList.tsx`, `ui/IconButton.tsx`
**Target Migration:** `try/app/components/layout/AppHeader.tsx`. Will refactor to use Next.js `usePathname` directly instead of the legacy `activeTopLink` regex.

## 4. Sidebar (`app/components/Sidebar.tsx`)
**Responsibility:** Contextual side navigation based on the active module.
**Depends on:**
* `legacy/navigation.ts` (for `sidebarMap`)
* `legacy/routing.ts` (for `pageKeyFromPath`)
* `ui/NavList.tsx`
**Target Migration:** `try/app/components/layout/Sidebar.tsx`. Will refactor to accept navigation items as props from the module-level layout, eliminating the global `sidebarMap` import entirely (enforcing *Dependency Direction Rules*).

## 5. UI Primitives (`app/components/ui/*`)
* `NavList.tsx` depends on `NavLink.tsx`.
* `NavLink.tsx` depends on `next/link` and `classNames.ts`.
* `classNames.ts` has zero dependencies (pure utility).
**Target Migration:** Move sequentially. `classNames.ts` → `try/app/lib/classNames.ts`. UI primitives → `try/app/components/ui/`.

---

### Hidden Runtime Dependencies Identified
* `legacy/routing.ts` tightly couples URL segments to a `generated/pages.ts` mapping. This will be **REPLACED** outright by native App Router path structures, eliminating a major source of technical debt.

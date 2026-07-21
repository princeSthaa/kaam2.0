# Master Enterprise ERP Migration Blueprint

## 1. Project-Wide Principles (The Constitution)
These principles govern every decision, line of code, and architectural choice made during this project.
* **Plan before implementation:** No code is written until the phase plan is approved.
* **Never guess:** Read code before deciding. Never infer functionality from filenames.
* **Preserve behavior before improving implementation:** Ensure it works identically before optimizing.
* **Preserve UI unless instructed otherwise:** Visual consistency is non-negotiable.
* **Prefer composition over inheritance.**
* **Prefer explicit code over clever abstractions.**
* **Optimize for maintainability:** The code must be understandable by the next senior engineer.
* **Complete one module before starting another.**
* **Every architectural decision must have a reason.**

## 2. Goal Description & Primary Objective
Refactor the reference implementation (`frontend/my-app`) into a clean, scalable, feature-based ERP architecture inside the `try` directory using Next.js 15/16 App Router. The target architecture will prioritize long-term maintainability, independent modules, generator readiness, and resource-based routing, while enforcing strict enterprise patterns.

---

## 3. Target Architecture & Module Boundaries
Before implementation begins, a complete target architecture document must be produced, detailing: Folder hierarchy, routing hierarchy, module boundaries, shared infrastructure, data flow, component hierarchy, API layer, state management, styling strategy, and dependency diagrams.

### Explicit Layering
No layer should skip another without justification. The absolute strict data flow is:
`App (Routing)` → `Page` → `Feature Component` → `Hook` → `Service` → `API Client` → `Backend`

### Future Generator Requirements (Module Standards)
The architecture must explicitly preserve generator compatibility. Code generation must be deterministic. Every module will follow this exact internal structure:
```text
app/(modules)/[module-name]/
├── api/          # Server Actions / Route Handlers
├── components/   # Feature-specific UI components
├── constants/    # Enums and immutable values
├── dto/          # Data Transfer Objects
├── hooks/        # Feature-specific React hooks
├── pages/        # Private page boundaries (if nested)
├── schemas/      # API/Data schemas
├── services/     # API fetchers, data mappers, and business logic
├── styles/       # CSS modules
├── types/        # TypeScript interfaces and types
├── validation/   # Zod validation schemas
├── navigation.ts # UI navigation definition
└── layout.tsx    # Module-level layout wrapper
```

### Dependency Direction Rules
To prevent circular architecture and spaghetti code:
* Modules **cannot** depend on other modules.
* Modules **may** depend on: Shared Components, Shared Hooks, Shared Services, Shared Utilities, Shared Types, Shared APIs.
* **Never the reverse.** Shared infrastructure can never import from a feature module.

---

## 4. Architectural Strategies & Standards

### State Management Strategy
* **Local State:** `useState` for simple isolated component state (e.g., toggles, localized form inputs).
* **Server State:** Handled natively by Next.js Server Components and Server Actions where possible. TanStack Query for complex client-side data fetching, caching, and polling.
* **Global App State:** Zustand (or Context if minimal) for cross-cutting global concerns (Theme, Auth user, Sidebar state).
* **URL State:** Prefer URL query parameters for filter, pagination, and tabs to ensure shareable links.

### Data Fetching Strategy
* **Server Components:** Default to fetching initial data securely on the server.
* **Client Components:** Use TanStack Query for interactivity, mutations, and polling.
* **Caching & Revalidation:** Next.js built-in caching for static lookups; tag-based invalidation (ISR) for highly read/rarely updated data.

### Error Handling Strategy
* **Routing Errors:** Global `not-found.tsx` (404) and `error.tsx` (500).
* **Unauthorized:** Middleware redirection to login; unified 401 handling in the API client.
* **Validation:** Inline form errors driven by Zod + React Hook Form.
* **API Failures:** Generic toast notifications for mutations; local loading/error boundaries (`Suspense`, `error.tsx`) for queries.

### Forms & Validation
* **Stack:** `react-hook-form` bound with `@hookform/resolvers/zod`.
* **Validation Location:** Zod schemas live in the module's `validation/` directory. They act as the single source of truth for both client and server action validation.
* **Reusable Forms:** Standardize input, select, and error message components in `app/components/ui`.

### Performance Standards
* **Lazy Loading / Dynamic Imports:** Heavy third-party libraries (e.g., charts, complex editors) must use `next/dynamic`.
* **Client Components:** Use `"use client"` strictly at the leaves of the component tree. Do not blanket entire pages.
* **Bundle Size:** Strictly monitor imports to prevent bloated bundles. 
* **Images:** Always use Next.js `<Image />` for automatic optimization.

### Accessibility Standards
* **Navigation:** Ensure full keyboard navigation capability.
* **ARIA:** Proper `aria-labels` and `aria-expanded` attributes on dynamic UI (modals, dropdowns).
* **Focus Management:** Trap focus inside active modals/drawers.

### Security Standards
* **XSS Prevention:** React handles safe HTML rendering by default. Use `dangerouslySetInnerHTML` only for explicitly sanitized data.
* **Environment Variables:** Strictly separate `NEXT_PUBLIC_` variables from secret backend tokens.
* **Token Handling:** Store authentication tokens securely (HttpOnly cookies preferred over localStorage).

### Naming Standards
Consistency is mandatory.
* **Components:** PascalCase (e.g., `CustomerTable.tsx`).
* **Hooks:** camelCase, prefixed with `use` (e.g., `useCustomerQuery.ts`).
* **Services:** camelCase (e.g., `customerService.ts`).
* **Types / Interfaces:** PascalCase (e.g., `Customer.ts`).
* **DTOs:** PascalCase, suffixed (e.g., `CreateCustomerDto.ts`).
* **Constants & Enums:** UPPER_SNAKE_CASE (e.g., `ORDER_STATUS.ts`).
* **Route Folders:** lowercase, kebab-case (e.g., `customer-orders`).
* **CSS Modules:** lowercase, kebab-case, suffixed (e.g., `customer-table.module.css`).

### Anti-Patterns (FORBIDDEN)
* Don't create god components.
* Don't duplicate services.
* Don't duplicate DTOs.
* Don't create `utils.ts` with unrelated, monolithic helpers.
* Don't use `index.ts` everywhere unnecessarily (barrel file bloat).
* Don't create circular imports.
* Don't put business logic in UI components.
* Don't mix feature code into shared code.

---

## 5. Documentation & Decision Making

### Architecture Decision Record (ADR)
Every major architectural decision must be recorded using the ADR format:
* **Decision:** What was decided.
* **Why chosen:** Rationale.
* **Alternatives considered:** What was rejected.
* **Trade-offs:** Known downsides.
* **Future impact:** How it affects scalability.

### Living Architecture
This architecture document must evolve. Whenever a significant decision changes, update the architecture, folder standards, migration rules, and generator conventions. The plan remains the single source of truth.

---

## 6. Migration Execution Rules

### Legacy Inventory (Pre-Migration Requirement)
Before migration begins, create an inventory. Every file must belong to exactly one category:
`Keep`, `Rewrite`, `Refactor`, `Replace`, `Delete`, `Unknown`.

### Migration Completion Definition
Each phase and module migration strictly ends with this exit criteria checklist:
* [ ] Build succeeds
* [ ] Lint passes
* [ ] TypeScript passes
* [ ] No legacy imports remain
* [ ] UI identical
* [ ] Routes verified
* [ ] Module fully isolated
* [ ] Approved by Lead Architect

---

## 7. The Master Migration Phases

### Phase 1: Target Architecture Definition & Legacy Inventory
* **Tasks:** Produce the target architecture blueprint, dependency diagrams, and the absolute Legacy Inventory categorizing every file.
* **Approval Required:** YES.

### Phase 2: Dependency Analysis & File Audit
* **Tasks:** Trace dependency chains. No file is migrated without a verified dependency graph. Identify hidden runtime/API dependencies.
* **Approval Required:** YES.

### Phase 3: Project Skeleton & Generator Scaffolding Creation
* **Tasks:** Create the exact folder hierarchy defined in the architectural constraints (Modules, Shared UI, API boundaries).
* **Approval Required:** YES.

### Phase 4: Core Infrastructure Migration
* **Tasks:** Migrate layouts, global routing, Error/404 handling, providers, generic Sidebar/Navigation wrappers, authentication setup, and global styling.
* **Approval Required:** YES.

### Phase 5: Shared Component Migration
* **Tasks:** Migrate true generic components (`legacy-ui`) into `try/app/components/ui/`.
* **Approval Required:** YES.

### Phase 6: Sequential Module Migration
* **Order:** CRM → Production → Warehouse → Inventory → Finance → Reports → Settings.
* **Tasks:** Migrate one module fully before touching the next. Extract business logic from UI. Enforce explicit layering and validation strategies.
* **Checkpoints:** Exit criteria checklist (Build, Lint, TS, UI match) is verified per module.
* **Approval Required:** YES.

### Phase 7: JavaScript Modernization & Backend Integration
* **Tasks:** Replace all jQuery/DOM manipulation with native React state. Strip dummy payloads and integrate ASP.NET Core APIs using the defined Data Fetching Strategy.
* **Approval Required:** YES.

### Phase 8: Testing, Cleanup, & Final Documentation
* **Tasks:** Execute visual comparison, eliminate dead code, finalize ADRs, and freeze generator conventions.
* **Approval Required:** YES.

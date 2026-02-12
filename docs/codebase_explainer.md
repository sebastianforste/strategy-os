# StrategyOS Codebase Explainer

## 1. App Topology
- Framework: Next.js App Router
- Main page: `app/page.tsx`
- Root shell: `components/UnifiedCanvas.tsx`
- Core editor: `components/Canvas/CanvasEditor.tsx`
- Command input: `components/Canvas/OmniBar.tsx`

## 2. Directory Map
- `app/`: pages, layout, API routes
- `components/`: UI and shell modules
- `actions/`: server actions orchestrating generation/publish/revision
- `utils/`: services (AI, auth, analytics, storage, vector, platform adapters)
- `prisma/`: schema + DB configuration
- `e2e/`: Playwright end-to-end specs
- `tests/`: Vitest unit/integration tests
- `scripts/`: maintenance, verification, and tooling scripts

## 3. Runtime Flow (Primary)
1. User input enters omnibar in `UnifiedCanvas`.
2. `onDraft` / command parser routes action.
3. Server action `processInput` (`actions/generate.ts`) orchestrates:
   - prompt construction (`utils/prompt-builder.ts`)
   - AI generation (`utils/ai-service-server.ts`)
   - optional image generation (`utils/image-service.ts`)
   - anti-robot post-processing (`utils/text-processor.ts`)
4. Result is rendered in editor and optionally persisted via history/audit services.

## 4. Persona Revision Path
- Entry point: `Revise` control in `CanvasEditor`
- Handler: `handlePersonaRevision` in `UnifiedCanvas`
- Server action: `reviseWithPersonaAction`
- Tone source: `utils/personas.ts`
- Result passes through anti-robot filter before rendering.

## 5. Responsive Shell Model
- Mode hook: `hooks/useLayoutMode.ts`
- Modes: `desktop | tablet | mobile`
- Types: `types/shell-ui.ts`

Behavior:
- desktop: persistent rails
- tablet: drawer rails
- mobile: tools sheet + single-column workspace

## 6. Design System Integration
- Token source: `theme.json`
- Sync script: `scripts/stitch-sync.ts`
- Runtime CSS variable injection: `app/layout.tsx`
- Token diagnostics panel: `components/Canvas/DesignTokensView.tsx`
- Token consistency checks:
  - `scripts/check-stitch-token-usage.ts`
  - `tests/stitch-token-consistency.test.ts`

## 7. Persistence Layers
- Prisma/SQLite for strategies, auth, teams, templates, resources.
- Client-side history/audit stores for low-latency UX.
- Optional history migration endpoint: `app/api/migrate-history/route.ts`.

## 8. API Surface (App Router)
Representative endpoints:
- generation: `app/api/generate/route.ts`
- distribution: `app/api/distribute/route.ts`
- health: `app/api/health/route.ts`
- key validation: `app/api/validate-key/route.ts`
- analytics: `app/api/analytics/team/route.ts`, `app/api/analytics/dashboard/route.ts`
- history: `app/api/history/route.ts`, `app/api/migrate-history/route.ts`
- auth: `app/api/auth/[...nextauth]/route.ts`

## 9. Reliability Controls
- Service worker registration runs only in production and checks `/sw.js` first.
- PWA icons are explicit in `public/manifest.json`.
- Reduced-motion styles enforced in `app/globals.css`.
- E2E guardrails cover overlap/accessibility/tools/modal/core actions.

## 10. Current Risks to Watch
- External model availability and quota can still fail generation paths.
- Auth-required routes return `401` in local unauthenticated runs.
- Some legacy modules remain in repository but are not part of primary shell flow.

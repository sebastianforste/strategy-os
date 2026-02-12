# StrategyOS Development Lifecycle

This document defines the practical development lifecycle used for StrategyOS.

## 1. Lifecycle Phases
### Phase A: Product Intent
- define behavior change and quality gate
- confirm no regressions to core shell actions (`draft`, `revise`, `polish`, `publish`, persona switch)

### Phase B: Design System Alignment
- use Stitch token pipeline as source of truth
- update `theme.json` through `scripts/stitch-sync.ts` when design tokens change
- avoid hardcoded palette values in shell/editor surfaces

### Phase C: Implementation
- implement with clear ownership boundaries:
  - shell orchestration: `UnifiedCanvas`
  - editor interactions: `CanvasEditor`
  - model and generation services: `actions/` + `utils/`

### Phase D: Verification
Run:
```bash
npm test
npx playwright test
```

Required checks:
- responsive overlap gate
- accessibility gate
- modal/tools interaction gate
- shell reliability gate (no hydration mismatch, no SW registration failure in dev)

### Phase E: Documentation and Handover
- update impacted docs in `/docs`
- capture known risks and operational guidance

## 2. Engineering Rules
- keep command semantics stable unless intentionally changed
- add deterministic behavior for SSR/CSR boundaries
- preserve keyboard and reduced-motion support
- guard production-only features (service worker, external integrations)

## 3. Stitch-to-Implementation Bridge
Canonical chain:
1. Stitch export HTML
2. `scripts/stitch-sync.ts`
3. `theme.json`
4. CSS variables injected by `app/layout.tsx`
5. components consume `var(--stitch-*)`

## 4. Release Gate
A change is release-ready only if:
1. lint + tests pass
2. E2E suite is green
3. docs are updated for behavior changes
4. no unresolved P0 regressions

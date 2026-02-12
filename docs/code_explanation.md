# StrategyOS Code Explanation (Practical)

This is a practical explanation of how the current app works, using the files that matter for daily development.

## 1. The Page and Shell
- `app/page.tsx` mounts `UnifiedCanvas`.
- `components/UnifiedCanvas.tsx` is the top-level product surface.

`UnifiedCanvas` owns:
- layout mode decisions
- tool panel routing
- command parsing
- modal open/close state
- editor integration callbacks

## 2. The Editor
- `components/Canvas/CanvasEditor.tsx`

Responsibilities:
- text editing surface
- polish/publish buttons
- persona display and revision controls
- waterfall/editor mode toggle

The key UX change is persona-guided revision with optional instruction input.

## 3. Command Dock
- `components/Canvas/OmniBar.tsx`

It accepts free text and slash commands.
- free text => drafting path
- URL => URL path
- slash command => shell command parser

## 4. Generation and Revision Actions
- `actions/generate.ts`

Important actions:
- `processInput` (main generation orchestration)
- `reviseWithPersonaAction` (rewrite by selected persona)
- `scoreViralityAction`
- `refineAuthorityAction`
- `generateCommentAction`

## 5. Persona Model
- `utils/personas.ts`

Contains each persona’s:
- description
- base/system prompt
- stylistic signals
- optional feature labels

## 6. Theme and Stitch Tokens
- token file: `theme.json`
- runtime injection: `app/layout.tsx`
- sync tool: `scripts/stitch-sync.ts`

Visuals should use CSS variables like `var(--stitch-accent)` instead of hardcoded values.

## 7. Persistence
- DB schema: `prisma/schema.prisma`
- DB access: Prisma client in utilities/actions
- history migration route requires authentication

## 8. Testing
- E2E specs: `e2e/*.spec.ts`
- Unit tests: `tests/*.test.ts`

Run:
```bash
npx playwright test
npm test
```

## 9. What to Edit for Common Tasks
- Change shell layout: `components/UnifiedCanvas.tsx`
- Change editor UX: `components/Canvas/CanvasEditor.tsx`
- Change commands: `components/UnifiedCanvas.tsx` command handler
- Change persona behavior: `utils/personas.ts` + `actions/generate.ts`
- Change design tokens: `theme.json` (+ optional `scripts/stitch-sync.ts`)

## 10. Debug Tips
- Hydration mismatch symptoms: check layout-mode assumptions and client-only branches.
- Model errors: inspect `utils/config.ts` and provider quota.
- Embedding failures: inspect `utils/gemini-embedding.ts` fallback path.

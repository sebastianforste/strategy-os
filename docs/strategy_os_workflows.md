# StrategyOS Workflows

## 1. Primary User Workflow
1. open canvas
2. set persona
3. draft via omnibar
4. revise with persona instruction
5. polish
6. preview
7. publish

## 2. Command Workflow
Input routes in `UnifiedCanvas`:
- slash command => command handler
- URL => URL flow
- plain text => draft generation

High-traffic commands:
- `/revise <instruction>`
- `/preview twitter`
- `/persona cso`
- `/publish`
- `/help`

## 3. Persona Revision Workflow
Files:
- `components/Canvas/CanvasEditor.tsx`
- `components/UnifiedCanvas.tsx`
- `actions/generate.ts`

Flow:
1. user enters optional revision brief
2. `Revise` calls `handlePersonaRevision`
3. server action `reviseWithPersonaAction` rewrites with active persona prompt
4. anti-robot filter finalizes output
5. UI updates editor content and audit logs

## 4. Tools Workflow (Desktop + Mobile)
Action registry is centralized in shell action types (`types/shell-ui.ts`).

Tools available:
- Daily Briefing
- Design DNA
- Settings
- History
- Voice Training
- Ghost Agent
- Analytics
- Manifesto

Responsive routing:
- desktop: header button group
- mobile: tools dialog sheet

## 5. Stitch Design Workflow
1. update Stitch export HTML (`components/stitch-exports/command-center.html`)
2. run sync:
```bash
npx tsx scripts/stitch-sync.ts
```
3. confirm `theme.json` updates
4. runtime picks tokens via `app/layout.tsx`
5. verify usage:
```bash
npx tsx scripts/check-stitch-token-usage.ts
npm test -- tests/stitch-token-consistency.test.ts
```

## 6. QA Workflow
### Local quality gate
```bash
npm run lint
npm test
npx playwright test
```

### E2E focus areas
- shell overlap and bounds at key breakpoints
- accessible names for visible controls
- keyboard/reduced-motion behavior
- service worker and icon reliability
- mobile tools action matrix

## 7. Release Workflow (Practical)
1. sync Prisma schema
```bash
npx prisma db push --schema prisma/schema.prisma
```
2. run full test gate
3. build
```bash
npm run build
```
4. deploy per target environment docs

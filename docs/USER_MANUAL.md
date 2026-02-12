# StrategyOS User Manual

## 1. Overview
StrategyOS is a writing studio for strategy-oriented content creation.

Primary surface: `UnifiedCanvas`.

Core loop:
1. choose persona
2. draft or generate content
3. revise in persona voice
4. polish
5. preview
6. publish

## 2. First Run
1. Open `http://localhost:3000`.
2. In the setup banner, enter your Gemini key (or `demo`).
3. Click `Test key`, then `Save`.

If key save succeeds, generation controls are unblocked.

## 3. Layout Behavior
- Desktop (`>=1280`): left personas rail + right telemetry rail visible.
- Tablet (`768-1279`): rails open via `Toggle personas panel` and `Toggle telemetry panel`.
- Mobile (`<768`): compact top bar + `Tools` panel for secondary actions.

## 4. Personas
Available built-in personas:
- `cso` → The Strategist
- `storyteller` → The Founder
- `colleague` → The High-Performer
- `contrarian` → The Provocateur
- `custom` → Your Voice

Ways to switch:
- persona dropdown in shell
- left rail buttons (desktop/tablet drawer)
- omnibar command: `/persona <id>`

## 5. Writing and Revision
### Drafting
- Type in the bottom omnibar and press `Execute`.
- Or run command-style inputs (`/draft ...`, `/news ...`).

### Persona-Guided Revision
In the editor header:
1. pick a preset (`Sharper`, `Shorter`, etc.) or type custom instruction
2. click `Revise`

Behavior:
- revision preserves core claims
- rewrite is guided by the active persona
- button is disabled if draft content is empty

## 6. Editor Actions
- `Polish`: runs anti-robot cleanup and replacement pass
- `Publish`: sends content through distribution API
- `Waterfall`: enters repurposing layout mode
- `Editor view` / `Preview view`: toggle working mode
- `Open manifesto view`: full-screen reading mode

## 7. Tools Panel / Header Actions
Actions available through desktop header or mobile tools panel:
- Daily Briefing
- Design DNA
- Settings
- History
- Voice Training
- Ghost Agent
- Analytics
- Manifesto

## 8. Omnibar Commands
Supported command set:
- `/help`
- `/settings`
- `/history`
- `/voice`
- `/ghost`
- `/analytics`
- `/tokens`
- `/briefing`
- `/manifesto`
- `/polish`
- `/revise <instruction>` (alias: `/rewrite`)
- `/publish`
- `/preview [linkedin|twitter|x]`
- `/editor`
- `/waterfall`
- `/persona <personaId>`
- `/clear`
- `/news <topic>`
- `/draft <topic>`

## 9. Accessibility and UX
- named controls for actionable buttons
- keyboard navigation through shell controls
- reduced-motion mode disables non-essential animation
- safe-area-aware command dock spacing on mobile

## 10. Troubleshooting
### `GET /sw.js 404` in dev
Expected unless production PWA build is active. Service worker registration is production-only and guarded.

### `Unauthorized` on `/api/history` or `/api/migrate-history`
These endpoints require authenticated session.

### Gemini quota/model errors
If you see `429 RESOURCE_EXHAUSTED` or model `404`:
- check billing/quota
- update configured model chain in `utils/config.ts`

### Embedding warnings
Embedding service now falls back automatically across configured embedding models.

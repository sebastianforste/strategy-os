# StrategyOS Engineering Overview

## Project
- Name: `strategy-os`
- Type: Next.js web application
- Goal: strategy-centric content creation with persona-driven rewriting and publishing workflows

## Runtime Requirements
- Node.js 18+
- npm
- Gemini API key for real generation

## Local Run
```bash
npm install
npx prisma db push --schema prisma/schema.prisma
npm run dev
```

## Build and Production
```bash
npm run build
npm run start
```

## Core Components
- Shell: `components/UnifiedCanvas.tsx`
- Editor: `components/Canvas/CanvasEditor.tsx`
- Omnibar: `components/Canvas/OmniBar.tsx`
- Rails: `components/Canvas/LeftRail.tsx`, `components/Canvas/RightRail.tsx`

## Core Server Actions
- `processInput`
- `reviseWithPersonaAction`
- `scoreViralityAction`
- `refineAuthorityAction`
- `generateCommentAction`

All located in `actions/generate.ts`.

## Data and Auth
- Database: Prisma + SQLite (`prisma/dev.db`)
- Schema: `prisma/schema.prisma`
- Auth: NextAuth (`app/api/auth/[...nextauth]/route.ts`, `utils/auth.ts`)

## API Endpoints
- `/api/generate`
- `/api/distribute`
- `/api/history`
- `/api/migrate-history`
- `/api/analytics/team`
- `/api/analytics/dashboard`
- `/api/validate-key`
- `/api/health`

## Design System
- Token source: `theme.json`
- Injected as `--stitch-*` vars in `app/layout.tsx`
- Sync from Stitch export via `scripts/stitch-sync.ts`

## Testing
### E2E
```bash
npx playwright test
```
Covers shell navigation, accessibility checks, responsive overlap, tools panels, modal flows, onboarding/polish/publish, and mobile tools matrix.

### Unit
```bash
npm test
```
Vitest covers utilities and logic modules.

## Operational Notes
- Service worker registration is production-only and guarded by `/sw.js` existence.
- Manifest icons are loaded from `/public/icons`.
- Reduced motion is enforced in CSS for accessibility.

## Known Failure Classes
- Gemini quota/rate limits (`429`)
- unsupported model IDs (`404`)
- unauthenticated access to auth-gated history routes (`401`)

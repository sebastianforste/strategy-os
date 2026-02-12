# StrategyOS

StrategyOS is a Next.js 16 application for strategy-focused AI writing, persona-guided revision, and multi-surface publishing workflows. It is the flagship implementation of the [2026 Development Manifesto](file:///Users/sebastian/Developer/DEVELOPMENT_MANIFESTO_2026.md).

## What It Does
StrategyOS transforms raw input into "World-Class" strategy and content using an autonomous orchestrator.
- **Unified Canvas**: A cinematic writing shell (`/`) for drafting and polishing.
- **Ghost Agent V2**: Dynamic sector selection and persona-based authority refinement.
- **Intelligence Pipeline**: Autonomous score evaluation (Virality, Authority) and iterative quality gates.
- **Stitch Token Pipeline**: Visual source of truth using `theme.json` for a seamless "Stitch" design system.
- **Contextual Memory**: RAG-enhanced generation using LanceDB and Gemini embeddings.

## The 2026 Stack
Built on the **StrategyOS Standard**:
- **Framework**: Next.js 16 (App Router) + React 19
- **Database**: Prisma 7 + SQLite + LanceDB (Vector)
- **AI**: Gemini 3 Flash (Primary) + Gemini 2.5 Flash Lite (Fallback)
- **Styling**: Tailwind CSS 4 + Glassmorphic UI

## Quick Start
1. Install dependencies
```bash
npm install
```

2. Sync database schema
```bash
npx prisma db push --schema prisma/schema.prisma
```

3. Start development server
```bash
npm run dev
```

4. Open
- [http://localhost:3000](http://localhost:3000)

## Environment Setup
Copy `.env.example` into `.env.local` and set keys as needed.

Minimum useful setup:
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)

Optional:
- OAuth provider keys (Google/LinkedIn/Twitter)
- Stitch project config (`STITCH_PROJECT_ID`)
- social and webhook integrations

### Demo Mode
You can use `demo` as the Gemini key in the UI for non-production smoke flows.

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Unit tests: `npm test`
- E2E tests: `npx playwright test`
- Stitch sync: `npx tsx scripts/stitch-sync.ts`
- Stitch token usage check: `npx tsx scripts/check-stitch-token-usage.ts`

## Quality Gates
Current automated checks cover:
- shell accessibility (named controls, keyboard nav, reduced motion)
- responsive overlap regression at `360/390/768/834/1280/1440`
- modal/tool interactions
- onboarding, polish, publish paths
- tools action matrix (mobile)

## Documentation
See `/docs/README.md` for the full documentation map.

## Notes
- Service worker registration is production-only and guarded by `/sw.js` existence.
- PWA manifest icons are expected at:
  - `/public/icons/icon-192x192.png`
  - `/public/icons/icon-512x512.png`

# StrategyOS Deployment Guide

This guide covers production deployment basics for StrategyOS.

## 1. Deployment Prerequisites
- Node.js 18+
- production environment variables configured
- database URL configured (`DATABASE_URL`)
- OAuth secrets only if those providers are needed

## 2. Required Environment Variables
Minimum:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)

Optional (feature-dependent):
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`, `ENABLE_TWITTER_AUTH=true`
- `STITCH_PROJECT_ID`
- distribution webhook keys/tokens

## 3. Build and Start
```bash
npm install
npm run build
npm run start
```

`npm run build` runs `prisma generate && next build`.

## 4. Database Notes
Local dev defaults to SQLite (`file:./dev.db`).

For production/serverless environments, use a persistent managed database and update Prisma/provider strategy accordingly.

## 5. PWA/Service Worker Notes
- PWA plugin is disabled in development and enabled in production (`next.config.ts`).
- runtime registration only occurs in production and only if `/sw.js` exists (`app/layout.tsx`).

## 6. Vercel Checklist
1. Import repository.
2. Set environment variables in project settings.
3. Ensure build command uses default `npm run build`.
4. Validate runtime:
- `/api/health`
- homepage load
- key validation route (`/api/validate-key`)
- publish path (`/api/distribute`) in configured mode

## 7. Post-Deploy Validation
Run smoke checks:
1. shell renders and no console runtime errors
2. setup banner key validation works
3. draft → revise → polish → publish flow works
4. analytics/history routes behave as expected for authenticated user

## 8. Rollback Guidance
If production fails after release:
1. rollback deployment artifact
2. verify env variable drift
3. verify model config drift in `utils/config.ts`
4. inspect recent schema/data changes

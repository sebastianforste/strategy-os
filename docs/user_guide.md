# StrategyOS Quick User Guide

## Fast Path (2 Minutes)
1. Open `http://localhost:3000`.
2. Save Gemini key (or `demo`) in setup banner.
3. Select persona.
4. Enter topic in omnibar.
5. Click `Execute`.
6. Use `Revise` to match persona voice.
7. Click `Polish`.
8. Preview and `Publish`.

## Persona Revision Workflow
Best-practice sequence:
1. generate first draft
2. keep persona fixed
3. add revision brief (for example: `Make this sharper and less diplomatic`)
4. run `Revise`
5. polish only after revision

This avoids double-transforming tone and keeps outputs consistent.

## Mobile Usage
- Use `Tools` button to access settings/history/analytics/voice/ghost.
- Keep generation in omnibar dock.
- Persona selection remains in top shell control.

## Command Cheatsheet
- `/help`
- `/persona cso`
- `/revise stronger CFO tone`
- `/preview twitter`
- `/publish`
- `/clear`

## Reliability Expectations
Validated by E2E coverage:
- no shell overlap at 360, 390, 768, 834, 1280, 1440
- tools actions open their target surfaces
- onboarding + polish + publish flows pass

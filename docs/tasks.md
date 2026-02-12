# StrategyOS Engineering Tasks

## Current Baseline (February 11, 2026)
Completed baseline:
- Unified Canvas shell with responsive IA (`desktop/tablet/mobile`)
- persona-guided revision flow
- Stitch token pipeline and diagnostics
- accessibility and overlap E2E gates
- mobile tools action matrix coverage

## P0 (Immediate)
1. Stabilize Vitest failures
- fix `tests/history_migration.test.ts` for current auth/session behavior
- refactor `tests/user_functional_test.test.ts` to deterministic mocks or explicit opt-in live mode

2. AI model reliability hardening
- align virality scorer model references with active supported models
- improve fallback behavior for quota and model-not-found responses

3. RAG/vector resilience
- handle missing LanceDB tables gracefully without noisy logs
- add setup/bootstrap script for vector store tables in local dev

## P1 (Near-Term)
1. Consolidate legacy components
- mark non-shell legacy surfaces as archived or feature-flagged
- reduce duplicated UX pathways

2. History and auth UX
- clarify auth-required history migration in UI
- add explicit session-state messaging for `401` routes

3. Publish reliability
- improve cross-platform publish telemetry and retries
- tighten error messaging in distribution path

## P2 (Quality and Ops)
1. CI quality profile
- separate deterministic unit tests from live integration tests
- enforce E2E shell suite as required gate

2. Documentation governance
- keep `/docs/README.md` as source index
- require docs updates for shell/API behavior changes

3. Performance profiling
- add timing instrumentation around prompt construction and generation fallback loops

## Done Snapshot
- responsive shell overlap issue fixed at mobile/tablet breakpoints
- hydration mismatch fixed in layout mode initialization
- service worker dev 404 warning path neutralized via production-only registration guard
- manifest icons validated non-empty
- accessible naming coverage expanded

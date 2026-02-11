# StrategyOS: 2026 Agentic Development Lifecycle

This document defines the standard operating procedure (SOP) for development within StrategyOS, leveraging the **Stitch-to-Antigravity Bridge**.

## 1. The Core Setup: The "Bridge"
We separate concerns between visual aesthetics and logical architecture.

### Phase A: Design & Scaffolding (The "Stitch" Phase)
- **Tool:** Google Stitch / Stitch-MCP.
- **Responsibility:** Atomic Generation (Tokens -> Atoms -> Molecules -> Screens).
- **Output:** Tailwind-powered React components with static props.
- **Workflow:** Define tokens in `theme.json` -> Generate individual components -> Assemble screens.

### Phase B: Logic & Integration (The "Antigravity" Phase)
- **Tool:** Antigravity (Agentic AI).
- **Responsibility:** "The Guts" (Prisma, Server Actions, Auth, API Routes).
- **Workflow:** Ingest Stitch components -> Wire up dynamic props from `schema.prisma` -> Implement error handling and state management.
- **Evidence-Based Loop**: Connect `analytics-service.ts` to the generation pipeline to inject historical "Winning Patterns" from previous viral posts.

## 2. Best Practices (Mission Protocols)

### Mission Control (Manager View)
- Use for multi-file/complex tasks.
- Agent provides a **High-Level Plan** before execution.
- Work is executed in chunked "Tasks" with pause-points for user review.

### Artifact-Driven Development
- **Think First, Code Second.**
- Every major feature requires an `implementation_plan.md` and `task.md`.
- Architecture changes must be documented in a `SPEC.md` or `ADR.md` before implementation.

### Context Pinning (The Source of Truth)
The following files are CRITICAL "Pinned Context" for every session:
1. `prisma/schema.prisma` (Database Truth)
2. `package.json` (Dependency Truth)
3. `next.config.ts` (Config Truth)
4. `tsconfig.json` (Path Truth)

## 3. Technology Pillars
- **shadcn/ui**: The "AI Native" component library.
- **Next.js 16 (App Router)**: Reactive logic layer.
- **Prisma**: Type-safe data access.
- **Moltbook & Stitch**: AI-first design and social feedback loops.

# Developer Directory - Engineering Inventory

**Root**: `/Users/sebastian/Developer`
**Scan Date**: 2026-01-26

## 1. Executive Summary
The `~/Developer` directory governs a diverse ecosystem of tools ranging from frontend applications to background daemons and content repositories. The most active development is focused on **Strategy OS**, a complex AI-powered Next.js application.

## 2. Project Inventorydfad
Projects are listed by decreasing modification activity.

### Active Projects (Deep Dived)
1.  **[Strategy OS](./strategy-os.md)** (TypeScript/Next.js)
    -   *Status*: Active Development.
    -   *Purpose*: CDSO Persona Content Generator.
    -   *Key Tech*: Next.js 16, Google Gemini 3, Local Filesystem persistence.

2.  **[SentinelDaemon](./SentinelDaemon.md)** (Python)
    -   *Status*: Functional.
    -   *Purpose*: Background service to organize `~/Downloads` into `~/Developer` folders using AI.
    -   *Key Tech*: Watchdog, Gemini 1.5 Flash.

3.  **[Gunnercooke Marketing](./gunnercooke-marketing.md)** (Markdown/Python)
    -   *Status*: Data Repository.
    -   *Purpose*: High-signal marketing book summaries (potential RAG dataset).

### Other Projects (Snapshot)
-   `personal_finance_dashboard`: Likely a Streamlit or Dash app.
-   `legal_agent`: AI Agent project.
-   `teams_voice_memos`: Productivity tool.
-   `scripts`: General shell/python utility scripts.
-   `dotfiles`: System configuration.

## 3. Cross-Cutting Concerns

### Security & Secrets
-   **Pattern**: API Keys (Gemini, OpenAi, Serper) are consistently managed via `.env` files (`python-dotenv` or Next.js built-in support).
-   **Risk**: `strategy-os` exposes some keys to the client via `NEXT_PUBLIC_` prefix/localStorage. This is acceptable for a local-only single-user tool but risky if deployed.

### AI Integration
-   **Pattern**: Heavy reliance on **Google Gemini** models across both TypeScript (`strategy-os`) and Python (`SentinelDaemon`) stacks.
-   **Architecture**: Logic is often centralized in `utils/ai-service` or dedicated helper modules (`sorter.py`), showing a good separation of concerns.

### Persistence
-   **Pattern**: Preference for **Local Filesystem** storage (`generated_posts`, `downloads` sorting) and **Browser Storage** (History) over SQL/NoSQL databases. Simplifies architecture but limits scalability.

## 4. Prioritized Improvement Plan

### P0: Observability & Robustness
1.  **Strategy OS**: Move `scripts/` testing logic into a real test suite (`jest` or `vitest`).
2.  **SentinelDaemon**: Implement a logging rotation to avoid massive log files on long runs.

### P1: Security
1.  **Strategy OS**: Consider moving API calls entirely to Server Actions to avoid `NEXT_PUBLIC_` usage (partially implemented, but keys still live in Client Settings).

### P2: Architecture
1.  **Gunnercooke**: Implement the ingestion pipeline in `src/` to make the data usable.

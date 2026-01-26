# Strategy OS - Engineering Explainer

**Project**: `strategy-os`
**Stack**: Next.js 16+, TypeScript, Tailwind CSS, Google Gemini API
**Type**: Web Application

## 1. Executive Overview
Strategy OS is a specialized content generation engine designed to create high-status "Thought Leadership" assets for a Chief Digital Strategy Officer (CDSO) persona. Unlike generic chat interfaces, it enforces strict "Anti-Robot" protocols, specific "Viral Syntax" (Bro-etry), and operates in distinct modes (Newsjacker vs. Translator) to ensure output quality.

It runs locally as a Next.js application, storing history in the browser's `localStorage` and automatically saving generated artifacts to the local filesystem (`/generated_posts`).

## 2. How to Run & Test
### Run Locally
```bash
# Install dependencies
npm install

# Set up environment variables (.env.local)
# NEXT_PUBLIC_GEMINI_API_KEY=...
# NEXT_PUBLIC_SERPER_API_KEY=... (Optional)

# Start Dev Server
npm run dev
```
Access at: `http://localhost:3000`

### Testing
- **Unit/Integration**: `tests/` folder contains standalone scripts (e.g., `verify_constraint_logic.ts`).
- **Manual Verification**: Use `scripts/demo_live.ts` to run a CLI-based end-to-end generation test.

## 3. Architecture & Data Flow
The app follows a **Server Action** architecture. The client handles input/state, while the heavy lifting (AI orchestration, File I/O) happens on the server.

### Core Data Flow
1.  **Input**: User types Topic or URL in `InputConsole`.
2.  **Action**: `processInput` (Server Action) is called.
3.  **Mode Detection**: System detects if input is URL (Translator Mode) or Topic (Newsjacker Mode).
4.  **Enrichment**: (Optional) Fetches Google News context if in Newsjacker mode.
5.  **Generation**: `ai-service` calls Gemini 3 Flash Preview with the specific `CDSO` system prompt.
6.  **Sanitization**: `text-processor` enforces Anti-Robot rules (banning "delve", "leverage").
7.  **Persistence**:
    -   Server: Saves Markdown file to `generated_posts/`.
    -   Client: Saves to `localStorage` history.
8.  **Output**: Returns `GeneratedAssets` (Text, Image Prompt, Video Script) to UI.

## 4. Key Components (Deep Dive)

### `app/page.tsx`
-   **Purpose**: Main entry point. orchestrates state (`input`, `assets`, `history`).
-   **Key Logic**: Loads API keys and History on mount. Managing the generating state.

### `actions/generate.ts`
-   **Type**: `"use server"` Server Action.
-   **Responsibility**: The Controller. It orchestrates the entire pipeline.
-   **Key Feature**: Automatic File Saving. It checks for `generated_posts/` and writes the output there using `fs`.

### `utils/personas.ts`
-   **Purpose**: The "Brain" configuration.
-   **Key Export**: `PERSONAS.cso`. Contains the high-fidelity System Prompt that enforces the "CDSO" voice.

### `utils/ai-service.ts`
-   **Purpose**: The LLM Client.
-   **Logic**: Wrapper around `@google/generative-ai`. Handles retry logic for JSON parsing and selects the specific model (`gemini-3-flash-preview`).

### `utils/text-processor.ts`
-   **Purpose**: The "Editor".
-   **Logic**: Regex-based filter that defensively removes or replaces banned corporate jargon (e.g., "optimize" -> "fix").

### `utils/history-service.ts`
-   **Purpose**: Client-side persistence.
-   **Logic**: Simple wrapper around `localStorage` to save/load generation history.

## 5. Security & Configuration
-   **Secrets**: API Keys are stored in `.env.local`. Client-side components load them from Local Storage if not present in env (Settings Modal fallback).
-   **Note**: The app is designed for *local, single-user* use. `localStorage` is not encrypted.

## 6. Suggested Improvements
1.  **Refactor**: Move `scripts/` to `tests/` and use a proper test runner (Jest/Vitest) instead of standalone TS files.
2.  **Feature**: Add a database (SQLite/Postgres) instead of `localStorage` for robust history.
3.  **UX**: Add a "Diff" view to show exactly what the Anti-Robot filter changed in the text.

# StrategyOS 🧠

**The high-velocity content engine for the modern Chief Strategy Officer.**

StrategyOS is a personal tool that helps you write high-status, contrarian LinkedIn content in seconds, not hours. It combines the analytical precision of a Fortune 500 CSO with the viral hook mastery of a ghostwriter.

---

## 🚀 Key Features

*   **AI Drafting Engine**: Generates 3 assets (Text, Image Prompt, Video Script) from one topic.
*   **World-Class Personas (NEW)**: Choose from the Strategist, the Founder, the High-Performer, or the Provocateur—each with unique biographies, emotional arcs, and signature phrases.
*   **Comment Generator**: Generate high-status, persona-aligned replies to external posts in seconds.
*   **Anti-Detection Layer (NEW)**: Automatically varies sentence structure, list lengths, and inserts human-like "micro-specifics" to bypass AI detectors.
*   **Anti-Robot Core**: Automatically filters out "ChatGPT words" (e.g., *delve, unlock, tapestry*) to ensure your content sounds human and premium.
*   **Trend Hunter**: Scans the web (via Google Grounding) for real-time news to ground your posts in reality.
*   **Visualize Value Images**: Creates minimalist, high-contrast vector art (via Google Imagen 4).
*   **Template Library**: Save your best posts as reusable templates with "Mad Libs" style variables.
*   **Smart Export**: Copy perfectly formatted posts for Notion (Markdown) or Google Docs (HTML).
*   **Team Workspaces**: Switch between different brand contexts or clients.

---

## 🛠️ Prerequisites

To run this app, you need:

1.  **Node.js**: Version 18 or higher. [Download here](https://nodejs.org/).
2.  **API Keys** (Optional for Demo Mode):
    *   **Google Gemini API Key**: This single key powers text generation, Google Search (Grounding), and Image Generation (Imagen).

> **Note:** You can run the app in **Demo Mode** without any keys! Just enter `demo` in the settings menu.

---

## ⚡ Quick Start

1.  **Install Dependencies**
    Open your terminal in this folder and run:
    ```bash
    npm install
    ```

2.  **Run the App**
    Start the local server:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**
    Go to [http://localhost:3000](http://localhost:3000).

---

## 🎮 How to Use

1.  **Enter a Topic**: Type a high-level concept (e.g., "The death of consulting").
2.  **Select Persona**: Choose "CSO" (Analytical), "Storyteller" (Vulnerable), or "Contrarian" (Aggressive).
3.  **Click Generate**: Watch the AI draft your content.
4.  **Reply Mode (NEW)**: Click the "Reply" icon in the header to generate a comment for an external post using your selected persona.
5.  **Refine**:
    *   **Edit**: Tweaks the text directly.
    *   **Save Template**: Click the Bookmark icon to reuse the structure later.
    *   **Export**: Click the Download icon to copy for Notion/Docs.

---

## 📂 Project Structure

*   `/app`: The website pages (Next.js App Router).
*   `/components`: The building blocks (Buttons, Inputs, Cards).
*   `/utils`: The logic (AI Service, History, templates).
*   `/actions`: Server-side code that protects your API keys.

---

## 🆘 Troubleshooting

*   **"Quota Exceeded" Error**: You might be using a free Gemini key. Switch the model in `utils/ai-service.ts` to `gemini-flash-latest`.
*   **Images/Search not working**: Ensure your Gemini API Key has access to `Google Search` and `Imagen` features (Google AI Studio keys usually do).
*   **App won't start**: Try running `npm install` again to ensure all packages are downloaded.

---

*Built with Next.js, TailwindCSS, and Framer Motion.*


## Development Standards

This project follows the "Senior Staff Mentor" persona standards.

### 1. Technology Stack
*   **Framework**: Next.js 16 (App Router).
*   **Language**: TypeScript (Strict Mode).
*   **Styling**: TailwindCSS with `clsx` and `tailwind-merge`.
*   **State**: React Server Components (RSC) by default; Client Components only when interactivity is needed.

### 2. Engineering Principles
*   **Structure**:
    *   `/app`: Routing and Pages (Server Components).
    *   `/components`: Reusable UI elements (Radix UI / Shadcn).
    *   `/utils`: Business logic and AI service wrappers.
*   **Security**: API Keys must strictly be used in Server Actions or API Routes (`/app/api`), never exposed to the client.

### 3. Workflow
*   **Commits**: Conventional Commits (e.g., `feat: add user login`).

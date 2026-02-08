# StrategyOS 🧠 (World-Class Edition)

**The high-velocity content engine for the modern Chief Strategy Officer.**

StrategyOS is a premium AI Strategist that helps you write high-status, contrarian LinkedIn content. Restored to its peak February 3rd design, it now enforces "World-Class" standards for every asset generated.

---

## 🚀 Key Features

*   **AI Drafting Engine**: Generates 3 assets (Text, Image Prompt, Video Script) from one topic.
*   **World-Class Personas**: Choose from the Strategist (CSO), the Founder, or the Provocateur—now calibrated for maximum authority and zero "AI-smell."
*   **Viral Syntax (Bro-etry)**: Guaranteed vertical rhythm. Every sentence is its own paragraph. Single sentences separated by double line breaks.
*   **Anti-Robot Core V2**: Automatic filtering of 24+ high-frequency "LLM words" (e.g., *embark, delve, leverage*).
*   **Cinematic Dark Theme**: A premium, "Visualize Value" inspired UI with noise textures and aurora gradients.
*   **Trend Hunter**: Scans the web via Google Grounding for real-time strategic context.
*   **Visualize Value Images**: Minimalist vector art via Google Imagen 4.
*   **Comment Generator**: Persona-aligned, high-status replies to spark engagement.
*   **Smart Export**: One-click copy for Notion, Google Docs, or direct to social.
*   **Local-First Architecture**: Secure, fast, and private.

---

## 🛠️ Prerequisites

To run this app, you need:

1.  **Node.js**: Version 18 or higher. [Download here](https://nodejs.org/).
2.  **API Keys** (See `.env.example`):
    *   **Google Gemini API Key**: Required for AI generation.
    *   **NextAuth Secret**: Required for authentication (run `openssl rand -base64 32` to generate).
    *   **Social Keys** (Optional): LinkedIn/Twitter keys for collecting analytics/publishing.

> **Note:** You can run the app in **Demo Mode** without any keys! Just enter `demo` in the settings menu.

---

## ⚡ Quick Start

1.  **Install Dependencies**
    Open your terminal in this folder and run:
    ```bash
    npm install
    ```

    ```bash
    npm install
    ```

2.  **Initialize Database**
    Create the local SQLite database:
    ```bash
    npx prisma db push
    ```

3.  **Run the App**
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

*   **"Quota Exceeded" Error**: You might be using a free Gemini key. Switch the model in `utils/config.ts` to `models/gemini-2.0-flash-exp`.
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

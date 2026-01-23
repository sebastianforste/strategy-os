# StrategyOS 🧠

**The high-velocity content engine for the modern Chief Strategy Officer.**

StrategyOS is a personal tool that helps you write high-status, contrarian LinkedIn content in seconds, not hours. It combines the analytical precision of a Fortune 500 CSO with the viral hook mastery of a ghostwriter.

---

## 🚀 Key Features

*   **AI Drafting Engine**: Generates 3 assets (Text, Image Prompt, Video Script) from one topic.
*   **Anti-Robot Core**: Automatically filters out "ChatGPT words" (e.g., *delve, unlock, tapestry*) to ensure your content sounds human and premium.
*   **Trend Hunter**: Scans the web (via Serper) for real-time news to ground your posts in reality.
*   **Visualize Value Images**: Creates minimalist, high-contrast vector art (via DALL-E 3).
*   **Template Library**: Save your best posts as reusable templates with "Mad Libs" style variables.
*   **Smart Export**: Copy perfectly formatted posts for Notion (Markdown) or Google Docs (HTML).
*   **Team Workspaces**: Switch between different brand contexts or clients.

---

## 🛠️ Prerequisites

To run this app, you need:

1.  **Node.js**: Version 18 or higher. [Download here](https://nodejs.org/).
2.  **API Keys** (Optional for Demo Mode):
    *   **Google Gemini API Key** (for text generation).
    *   **OpenAI API Key** (for image generation).
    *   **Serper API Key** (for trend searching).

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
4.  **Refine**:
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

*   **"Quota Exceeded" Error**: You might be using a free Gemini key. Switch the model in `utils/ai-service.ts` to `gemini-1.5-flash`.
*   **Images not generating**: Ensure you have a paid OpenAI account (API usage is billed separately from ChatGPT Plus).
*   **App won't start**: Try running `npm install` again to ensure all packages are downloaded.

---

*Built with Next.js, TailwindCSS, and Framer Motion.*

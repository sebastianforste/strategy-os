# StrategyOS: Code Explanation for Beginners

This document explains exactly how the **StrategyOS** application works, breaking down the code paragraph by paragraph. It is designed for non-technical users to understand the logic behind the "Anti-Robot" filtering and the AI generation.

---

## 1. The Brain: `utils/ai-service.ts`

This file is the connection between our app and Google's Gemini AI. It's responsible for sending your input to the AI and getting the 3 assets back.

### The Setup
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
```
**What it does:** Imports the official Google toolset. Think of this as opening the toolbox so we can use the `GoogleGenerativeAI` wrench.

### The Blueprint (System Prompt)
```typescript
const SYSTEM_PROMPT = `
You are the Chief Strategy Officer...
WRITING RULES...
OUTPUT FORMAT...
`;
```
**What it does:** This is the most critical part. It tells the AI *who* to be.
- **Persona:** "Chief Strategy Officer" (Authoritative, Smart).
- **Rules:** "No paragraphs > 2 lines", "No banned words".
- **Why it matters:** Without this, the AI would sound like a generic robot. This forces it to write like a viral LinkedIn influencer.

### The Main Function: `generateContent`
```typescript
export async function generateContent(input: string, apiKey: string) {
  // Check for Demo Mode
  if (apiKey.toLowerCase().trim() === "demo") { ... }
```
**What it does:**
1.  **Demo Check:** First, it looks at the API key. If you typed "demo", it skips Google entirely and returns pre-written "Mock" text. This ensures you can test the app even if your key works.
2.  **Configuration:** It sets up the `gemini-flash-latest` model.
3.  **The Prompt:** It wraps your simple input (e.g., "AI is dangerous") into a detailed instruction: *"Analyze this input... generate 3 assets... ensure JSON format."*

---

## 2. The Filter: `utils/text-processor.ts`

This file is the "Editor". It takes what the AI wrote and double-checks it to ensure no "robot words" slipped through.

### The Banned List
```typescript
const BANNED_WORDS = [
  "delve", "unlock", "unleash", "elevate", 
  "game-changer", "tapestry", "testament"
];
```
**What it does:** A list of words that scream "I was written by ChatGPT."
**Why it matters:** Using these words lowers the status of the post. We cut them out ruthlessly.

### The Replacements
```typescript
const REPLACEMENTS: Record<string, string> = {
  "leverage": "use",
  "utilize": "use",
  "commence": "start"
};
```
**What it does:** A dictionary that swaps fancy corporate jargon for simple, punchy words.
- *Leverage* $\rightarrow$ *Use* (Faster to read).

### The Cleaner: `applyAntiRobotFilter`
```typescript
export function applyAntiRobotFilter(text: string): string {
  let processed = text;
  // 1. Remove Banned Words
  // 2. Apply Replacements
  // 3. Fix Spacing (Max 2 line breaks)
  return processed;
}
```
**What it does:** It runs the text through a car wash:
1.  **Scrub**: Deletes banned words.
2.  **Swap**: Replaces jargon.
3.  **Iron**: Fixes weird spacing (like 4 empty lines in a row) so the post looks clean on mobile.

---

---

### Formatting Enforcement Details

The `applyAntiRobotFilter` function also ensures the output follows a **viral‑friendly format**:

- **Line Break Normalization** – Windows style `\r\n` is converted to Unix `\n`.
- **Extra Space Cleanup** – Consecutive whitespace characters are collapsed to a single space.
- **Double Line Breaks** – Single newlines are replaced with double newlines, guaranteeing each sentence appears on its own paragraph when rendered on social platforms.
- **Trim** – Leading and trailing whitespace is removed before the final string is returned.

These steps make the generated copy look clean on both desktop and mobile devices, and they help the post stay within typical character limits for platforms like LinkedIn.
---

## 3. The Coordinator: `app/api/generate/route.ts`

Traditional "Server Actions" are synchronous. For V3, we moved to a **Streaming API Route** using the Vercel AI SDK.

### The Streaming Flow
```typescript
import { streamText } from "ai";
// ...
const result = streamText({
  model: google("gemini-flash-latest"),
  system: streamingSystemPrompt,
  prompt: enrichedInput,
});
return result.toTextStreamResponse();
```
**What it does:**
1.  **Enrichment**: It calls `constructEnrichedPrompt` to inject RAG context and trends.
2.  **Streaming**: It uses the `streamText` helper to send chunks of text back to the browser as they are generated.
3.  **Speed**: Using `gemini-flash-latest` ensures the first word appears in less than 500ms.

---

## 4. The Strategic Brain: `utils/rag-service.ts`

This is our Retrieval-Augmented Generation (RAG) engine. It makes the AI smarter by giving it "access" to our curated library of marketing books.

### Vector Search
1.  **Embedding**: When you type a topic, the app converts it into a list of numbers (a "vector") using `text-embedding-004`.
2.  **Similarity**: It compares your topic's vector against thousands of pre-saved vectors in `data/knowledge_index.json`.
3.  **Retrieval**: It finds the top 3 most relevant book sections (e.g., a chapter on "Purple Cows" by Seth Godin) and tells the AI: *"Use this specific strategy context for this post."*


---

## 4. The Artist: `utils/image-service.ts`

This new file connects to Google's **Imagen 4** (via the Gemini API) to generate real images. "A picture is worth a 1000 words," so we use this to create the viral "Visualize Value" style graphics automatically. It uses the same API key as your text generation.

---

## 5. The Hunter: `utils/search-service.ts`

This file is the eyes of the operation.
- **Goal**: Find real-time news so the AI isn't hallucinating.
- **Provider**: **Google Grounding** (Built into Gemini).
- **Logic**: If you type a short phrase like "Nvidia", it triggers a "Hunt". The AI searches Google natively and returns valid JSON data about breaking news, which is then fed back into the Brain. No extra subscription needed.

---

## 6. The Memory: `utils/history-service.ts`

This file is the "Memory Upgrade".
- **Goal**: Remember your great ideas.
- **How**: It uses your browser's internal storage (`localStorage`) to save every successful post.
- **Privacy**: Data stays on your computer. We don't see it.


---

## 8. The Voice: `utils/personas.ts`

This file gives the AI multiple personalities.
- **The CSO**: Analytical, high-status.
- **The Storyteller**: Focuses on "I" statements, failure, and vulnerability.
- **The Contrarian**: Aggressive, debate-sparking.

The `ai-service.ts` now uses this file to swap out the "Brain" of the AI on the fly.

---

## 9. The Polish: UI Components

We added several components to make the app feel premium:
- **`components/ShareButton.tsx`**: Uses "Smart Intent" to open LinkedIn with your post pre-filled.
- **`components/GlitchLogo.tsx`**: Adds a "Chromatic Aberration" effect to the logo on hover.
- **`components/Toast.tsx`**: Replaces ugly browser alerts with sleek, animated notifications.

This is the webpage you actually see.

### The State
```typescript
const [input, setInput] = useState("");
const [assets, setAssets] = useState<GeneratedAssets | null>(null);
const [loading, setLoading] = useState(false);
```
**What it does:** It remembers:
-   **Input**: What you typed.
-   **Assets**: What the AI created (starts empty).
-   **Loading**: Whether the "Spinning Wheel" should show.

### The Logic
**When you click GENERATE:**
1.  It sets `Loading = true` (Button says "PROCESSING").
2.  It calls `processInput` (The Coordinator).
3.  It waits...
4.  It sets `Assets = result` (Shows the tabs).
5.  It sets `Loading = false` (Button says "GENERATE" again).

---

## Summary for Beginners

1.  **You type** a topic.
2.  **Page.tsx** sends it to **generate.ts**.
3.  **Generate.ts** asks **AI-Service** to write a draft using the "CSO Persona".
4.  **AI-Service** talks to **Google Gemini** (or creates Mock data).
5.  **Generate.ts** takes the draft and forces it through the **Text-Processor** to remove "robot words".
6.  **Page.tsx** shows you the final, clean result.

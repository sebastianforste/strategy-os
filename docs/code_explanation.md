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
2.  **Configuration:** It sets up the `gemini-3-flash-preview` model.
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

## 3. The Coordinator: `actions/generate.ts`

This is the "Server Action". It sits between the button you click and the code running on the backend.

### The Workflow
```typescript
export async function processInput(input, apiKeys) {
  // 1. Sanitize Key
  const geminiKey = apiKeys.gemini.trim();

  // 2. Generate
  const rawAssets = await generateContent(enrichedInput, geminiKey);

  // 3. Filter
  const filteredText = applyAntiRobotFilter(rawAssets.textPost);
  
  return { ...rawAssets, textPost: filteredText };
}
```
**What it does:**
1.  **Sanitize**: It cleans up your API key (removes accidental spaces).
2.  **Generate**: It calls the `ai-service` (The Brain) to get the raw ideas.
3.  **Filter**: It passes *only* the LinkedIn text post to the `text-processor` (The Editor) to polish it.
4.  **Return**: It sends the final, polished bundle back to your screen.


---

## 4. The Artist: `utils/image-service.ts`

This new file connects to OpenAI (DALL-E 3) to generate real images.
"A picture is worth a 1000 words," so we use this to create the viral "Visualize Value" style graphics automatically.

---

## 5. The Hunter: `utils/search-service.ts`

This file is the eyes of the operation.
- **Goal**: Find real-time news so the AI isn't hallucinating.
- **Provider**: Serper.dev (A tool that searches Google).
- **Logic**: If you type a short phrase like "Nvidia", it triggers a "Hunt", finds the top 3 news stories from the last 24 hours, and feeds them to the Brain.

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

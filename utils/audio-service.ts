/**
 * AUDIO SERVICE - 2027 Multi-Modal Content Factory
 * 
 * Generates podcast-style audio narration scripts for:
 * - LinkedIn Audio posts
 * - Podcast clips
 * - Voice memos / Audio summaries
 * 
 * Output includes:
 * - Narration script
 * - Suggested music/mood
 * - Timing markers
 */

import { GoogleGenAI } from "@google/genai";

const PRIMARY_MODEL = process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-flash-latest";

// --- TYPES ---

export interface AudioSegment {
  id: number;
  type: "intro" | "main" | "emphasis" | "outro";
  text: string;
  pace: "slow" | "normal" | "fast";
  emotion: "authoritative" | "conversational" | "excited" | "thoughtful";
  pauseAfter: number; // seconds
}

export interface AudioScript {
  title: string;
  totalDuration: number; // estimated seconds
  segments: AudioSegment[];
  mood: string; // Background music mood suggestion
  voiceStyle: string; // Description of ideal voice
}

export interface AudioProgress {
  phase: "analyzing" | "scripting" | "optimizing" | "complete";
  message: string;
}

/**
 * GENERATE AUDIO SCRIPT
 * ---------------------
 * Converts a text post into a podcast-style audio narration script.
 * 
 * @param content - Text post content
 * @param style - "podcast" | "voicememo" | "professional"
 * @param apiKey - Gemini API key
 * @param onProgress - Optional progress callback
 */
export async function generateAudioScript(
  content: string,
  style: "podcast" | "voicememo" | "professional" = "professional",
  apiKey: string,
  onProgress?: (progress: AudioProgress) => void
): Promise<AudioScript> {
  const genAI = new GoogleGenAI({ apiKey });
  
  onProgress?.({ phase: "analyzing", message: "Analyzing content for audio..." });
  
  const styleConfig = {
    podcast: { tone: "conversational, engaging, storytelling", duration: "2-3 minutes" },
    voicememo: { tone: "casual, brief, personal", duration: "30-60 seconds" },
    professional: { tone: "authoritative, clear, TED-talk style", duration: "1-2 minutes" }
  };
  
  const config = styleConfig[style];
  
  const prompt = `
    Convert this content into an AUDIO NARRATION script in the "${style}" style.
    
    CONTENT:
    """
    ${content}
    """
    
    STYLE REQUIREMENTS:
    - Tone: ${config.tone}
    - Target Duration: ${config.duration}
    
    OUTPUT (JSON):
    {
      "title": "Title for the audio clip",
      "totalDuration": 90,
      "segments": [
        {
          "id": 1,
          "type": "intro",
          "text": "Opening line to grab attention",
          "pace": "slow",
          "emotion": "authoritative",
          "pauseAfter": 1
        }
      ],
      "mood": "Ambient, focus, or energetic",
      "voiceStyle": "Description of ideal voice (e.g., 'Deep male voice with calm authority')"
    }
    
    RULES:
    1. Start with a compelling hook (intro segment)
    2. Use "emphasis" type for key insights
    3. Vary pace and emotion to maintain engagement
    4. End with a strong outro (takeaway or CTA)
    5. Include strategic pauses (0.5-2 seconds)
    6. Text should be SPOKEN, not read (contractions, natural flow)
  `;
  
  onProgress?.({ phase: "scripting", message: "Generating audio script..." });
  
  try {
    const result = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const text = result.text || "{}";
    const script = JSON.parse(text) as AudioScript;
    
    onProgress?.({ phase: "complete", message: `Audio script ready: ~${script.totalDuration}s` });
    
    return script;
  } catch (e) {
    console.error("Audio script generation failed:", e);
    return {
      title: "Audio Generation Failed",
      totalDuration: 0,
      segments: [],
      mood: "",
      voiceStyle: ""
    };
  }
}

/**
 * FORMAT AUDIO SCRIPT FOR DISPLAY
 * --------------------------------
 * Converts an AudioScript into a readable markdown format.
 */
export function formatAudioScriptForDisplay(script: AudioScript): string {
  if (!script.segments || script.segments.length === 0) {
    return "Audio script generation failed.";
  }
  
  let output = `# 🎙️ ${script.title}\n\n`;
  output += `**Duration:** ~${script.totalDuration} seconds\n`;
  output += `**Voice Style:** ${script.voiceStyle}\n`;
  output += `**Background Mood:** ${script.mood}\n\n`;
  output += `## 📜 NARRATION SCRIPT\n\n`;
  
  script.segments.forEach((seg) => {
    const emoji = {
      intro: "🎬",
      main: "💬",
      emphasis: "⚡",
      outro: "🎯"
    }[seg.type];
    
    output += `### ${emoji} ${seg.type.toUpperCase()} (${seg.pace}, ${seg.emotion})\n`;
    output += `> "${seg.text}"\n`;
    if (seg.pauseAfter > 0) {
      output += `*[Pause: ${seg.pauseAfter}s]*\n`;
    }
    output += "\n";
  });
  
  return output;
}

/**
 * ESTIMATE AUDIO DURATION
 * -----------------------
 * Estimates speaking duration based on word count.
 * Average speaking rate: ~150 words per minute.
 */
export function estimateAudioDuration(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil((words / 150) * 60);
}

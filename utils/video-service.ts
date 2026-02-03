/**
 * VIDEO SERVICE - 2027 Multi-Modal Content Factory
 * 
 * Generates short-form video scripts and content structure for:
 * - LinkedIn Video Posts
 * - TikTok/Reels vertical format
 * - YouTube Shorts
 * 
 * Output includes:
 * - Storyboard with scenes
 * - Text overlays/captions
 * - Thumbnail prompt for AI image generation
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./config";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

// --- TYPES ---

export interface VideoScene {
  id: number;
  duration: number; // seconds
  visual: string; // Description of what to show
  textOverlay: string; // Text that appears on screen
  voiceover: string; // Narration script
  transition: "cut" | "fade" | "zoom" | "swipe";
}

export interface VideoScript {
  title: string;
  hook: string; // First 3 seconds hook
  scenes: VideoScene[];
  totalDuration: number;
  thumbnailPrompt: string;
  hashtags: string[];
  platform: "linkedin" | "tiktok" | "youtube";
}

export interface VideoProgress {
  phase: "analyzing" | "scripting" | "storyboarding" | "complete";
  message: string;
}

/**
 * GENERATE VIDEO SCRIPT
 * ---------------------
 * Converts a text post or topic into a short-form video script.
 * 
 * @param content - Text post content or topic
 * @param platform - Target platform (affects format/duration)
 * @param apiKey - Gemini API key
 * @param onProgress - Optional progress callback
 */
export async function generateVideoScript(
  content: string,
  platform: "linkedin" | "tiktok" | "youtube" = "linkedin",
  apiKey: string,
  onProgress?: (progress: VideoProgress) => void
): Promise<VideoScript> {
  const genAI = new GoogleGenAI({ apiKey });
  
  onProgress?.({ phase: "analyzing", message: "Analyzing content for video..." });
  
  const platformConfig = {
    linkedin: { maxDuration: 120, style: "professional, insightful", aspectRatio: "16:9 or 9:16" },
    tiktok: { maxDuration: 60, style: "punchy, Gen-Z friendly, trending", aspectRatio: "9:16 vertical" },
    youtube: { maxDuration: 60, style: "engaging hook, value-packed", aspectRatio: "9:16 Shorts format" }
  };
  
  const config = platformConfig[platform];
  
  const prompt = `
    Convert this content into a short-form VIDEO script optimized for ${platform.toUpperCase()}.
    
    CONTENT:
    """
    ${content}
    """
    
    PLATFORM CONSTRAINTS:
    - Max Duration: ${config.maxDuration} seconds
    - Style: ${config.style}
    - Aspect Ratio: ${config.aspectRatio}
    
    OUTPUT (JSON):
    {
      "title": "Catchy video title",
      "hook": "First 3-second hook to stop the scroll (text that appears immediately)",
      "scenes": [
        {
          "id": 1,
          "duration": 5,
          "visual": "Description of what's shown (b-roll, talking head, graphics)",
          "textOverlay": "Text that appears on screen",
          "voiceover": "What to say in this scene",
          "transition": "cut"
        }
      ],
      "totalDuration": 45,
      "thumbnailPrompt": "Detailed prompt for AI thumbnail generation",
      "hashtags": ["#tag1", "#tag2"],
      "platform": "${platform}"
    }
    
    RULES:
    1. Hook MUST be under 3 seconds and create instant curiosity
    2. Each scene should be 5-15 seconds
    3. Total duration should NOT exceed ${config.maxDuration} seconds
    4. Text overlays should be SHORT (max 10 words per scene)
    5. Voiceover should match the text but be more conversational
    6. End with a clear CTA (follow, comment, share)
  `;
  
  onProgress?.({ phase: "scripting", message: "Generating video script..." });
  
  try {
    const result = await genAI.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const text = result.text || "{}";
    const script = JSON.parse(text) as VideoScript;
    
    onProgress?.({ phase: "complete", message: `Video script ready: ${script.totalDuration}s` });
    
    return script;
  } catch (e) {
    console.error("Video script generation failed:", e);
    // Return fallback
    return {
      title: "Video Generation Failed",
      hook: "Check your API key",
      scenes: [],
      totalDuration: 0,
      thumbnailPrompt: "",
      hashtags: [],
      platform
    };
  }
}

/**
 * FORMAT VIDEO SCRIPT FOR DISPLAY
 * --------------------------------
 * Converts a VideoScript into a readable markdown format.
 */
export function formatVideoScriptForDisplay(script: VideoScript): string {
  if (!script.scenes || script.scenes.length === 0) {
    return "Video script generation failed.";
  }
  
  let output = `# 🎬 ${script.title}\n\n`;
  output += `**Platform:** ${script.platform.toUpperCase()}\n`;
  output += `**Duration:** ${script.totalDuration} seconds\n\n`;
  output += `## 🎯 HOOK (First 3s)\n> "${script.hook}"\n\n`;
  output += `## 🎞️ STORYBOARD\n\n`;
  
  script.scenes.forEach((scene) => {
    output += `### Scene ${scene.id} (${scene.duration}s)\n`;
    output += `**Visual:** ${scene.visual}\n`;
    output += `**Text Overlay:** "${scene.textOverlay}"\n`;
    output += `**Voiceover:** ${scene.voiceover}\n`;
    output += `**Transition:** ${scene.transition}\n\n`;
  });
  
  output += `## 🖼️ THUMBNAIL PROMPT\n${script.thumbnailPrompt}\n\n`;
  output += `## # HASHTAGS\n${script.hashtags.join(" ")}\n`;
  
  return output;
}

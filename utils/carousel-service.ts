import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { AI_CONFIG } from "./config";

export interface CarouselSlide {
  title: string;
  body: string;
  footer?: string;
  bgColor?: string; // hex
  textColor?: string; // hex
}

export interface CarouselData {
  slides: CarouselSlide[];
  theme: "viral" | "professional" | "minimal";
}

/**
 * CAROUSEL SERVICE
 * ----------------
 * Transforms a linear text post into a paginated carousel structure.
 */
export async function generateCarouselStruct(post: string, apiKey: string): Promise<CarouselData | null> {
  if (!post || !apiKey) return null;

  const prompt = `
    You are a Viral LinkedIn Carousel Designer.
    Convert the following text post into a 5-10 slide carousel structure.
    
    TEXT:
    """
    ${post}
    """
    
    GUIDELINES:
    1. Slide 1 is the HOOK (Big, punchy text, max 7 words).
    2. Last Slide is the CTA (Call to Action).
    3. Middle slides breakdown the content step-by-step.
    4. Keep body text minimal (under 25 words per slide).
    5. Choose a theme based on content tone: 
       - "viral" (High energy, bold)
       - "professional" (Corporate, trustworthy)
       - "minimal" (Clean, modern)
    
    OUTPUT JSON ONLY:
    {
      "theme": "viral",
      "slides": [
        { "title": "BIG HOOK", "body": "Subtitle or context", "footer": "SWIPE ➔" },
        ...
      ]
    }
  `;

  try {
    const google = createGoogleGenerativeAI({ apiKey });
    
    const { text } = await generateText({
        model: google(AI_CONFIG.primaryModel),
        prompt,
    });

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as CarouselData;
  } catch (e) {
    console.error("Carousel generation failed", e);
    return null;
  }
}

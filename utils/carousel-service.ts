import { GoogleGenAI } from "@google/genai";

export interface CarouselSlide {
  title: string;
  body: string;
  footer?: string;
  bgColor?: string; // hex
  textColor?: string; // hex
}

export interface CarouselData {
  slides: CarouselSlide[];
  theme: "dark" | "light" | "navy";
}

/**
 * CAROUSEL SERVICE
 * ----------------
 * Transforms a linear text post into a paginated carousel structure.
 */
export async function generateCarouselStruct(post: string, apiKey: string): Promise<CarouselData | null> {
  if (!post || !apiKey) return null;

  const prompt = `
    You are a LinkedIn Carousel Designer.
    Convert the following text post into a 5-10 slide carousel structure.
    
    TEXT:
    """
    ${post}
    """
    
    GUIDELINES:
    1. Slide 1 is the HOOK (Big text).
    2. Last Slide is the CTA (Call to Action).
    3. Middle slides break down the content step-by-step.
    4. Keep body text minimal (under 20 words per slide).
    5. Choose a theme: "dark" (black bg), "light" (white bg), or "navy" (deep blue bg).
    
    OUTPUT JSON:
    {
      "theme": "dark",
      "slides": [
        { "title": "BIG HOOK", "body": "Subtitle or context", "footer": "Slide 1/5" },
        ...
      ]
    }
  `;

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContent({
        model: process.env.NEXT_PUBLIC_GEMINI_PRIMARY_MODEL || "models/gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    const text = result.text || "";
    return JSON.parse(text) as CarouselData;
  } catch (e) {
    console.error("Carousel generation failed", e);
    return null;
  }
}

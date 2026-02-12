/**
 * IMAGE GENERATION SERVICE
 * ------------------------
 * Generates visuals using Google's Imagen model via the Gemini API.
 * 
 * Logic:
 * 1. Receives a "Visualize Value" style prompt from the main generation step.
 * 2. Prepends style modifiers (Minimalist, Vector, High Contrast).
 * 3. Calls `imagen-4.0-generate-001`.
 * 4. Returns the result as a Base64 Data URI for immediate display.
 */
import { AI_CONFIG } from "./config";

let imagenUnavailableForKey = false;

export async function generateImage(prompt: string, apiKey: string): Promise<string> {
  // Mock mode for image gen
  if (apiKey.toLowerCase().trim() === "demo") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return "https://placehold.co/1024x1024/000000/FFFFFF/png?text=MOCK+IMAGE+VISUALIZE+VALUE";
  }

  if (imagenUnavailableForKey) {
    return "";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${AI_CONFIG.imageModel}:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            instances: [
                {
                    prompt: `Minimalist vector line art, white on jet black background. High contrast. Geometric. Visualize Value style. ${prompt}`,
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: "1:1"
            }
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        const normalized = errorText.toLowerCase();
        if (
          response.status === 400 &&
          normalized.includes("only accessible to billed users")
        ) {
          imagenUnavailableForKey = true;
          console.warn("[Image Service] Imagen is unavailable for the current API key (billing not enabled). Skipping image generation.");
          return "";
        }
        console.warn(`Imagen API request failed (${response.status} ${response.statusText}).`);
        return "";
    }

    const data = await response.json();
    
    // Imagen returns base64 string in data.predictions[0].bytesBase64Encoded
    // We need to convert this to a usable data URL or handle it.
    // However, most frontends need a URL. Since we don't have storage bucket logic here yet, 
    // sticking to base64 data URI is the quickest robust way for this app unless we want to upload it.
    // The previous implementation returned a URL. Data URI works as a URL source.
    
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) {
      console.warn("Imagen API returned no image data.");
      return "";
    }
    
    // mime type for imagen output is typically image/png or image/jpeg. 
    // usually jpeg or png. Let's assume png or check headers if needed, but standard is usually png.
    return `data:image/png;base64,${b64}`;

  } catch {
    console.warn("Image generation skipped due to non-fatal error.");
    // Don't crash the whole app, just return empty so the UI handles it gracefully
    return ""; 
  }
}

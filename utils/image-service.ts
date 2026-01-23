import OpenAI from "openai";

export async function generateImage(prompt: string, apiKey: string): Promise<string> {
  // Mock mode for image gen
  if (apiKey.toLowerCase().trim() === "demo") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return "https://placehold.co/1024x1024/000000/FFFFFF/png?text=MOCK+IMAGE+VISUALIZE+VALUE";
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Minimalist vector line art, white on jet black background. High contrast. Geometric. Visualize Value style. ${prompt}`,
      n: 1,
      size: "1024x1024",
      response_format: "url", // or 'b64_json' if we want to avoid expiration, but url is fine for MVP
    });

    return response.data?.[0]?.url || "";
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    throw new Error(`Image Generation Failed: ${error.message}`);
  }
}

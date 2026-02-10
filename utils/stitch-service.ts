/**
 * STITCH SERVICE
 * --------------
 * Provides integration with Google Stitch (AI UI Design Tool).
 * Extracts "Design DNA" (colors, typography, structure) for visual grounding.
 */

const STITCH_PROJECT_ID = process.env.STITCH_PROJECT_ID;

export interface DesignDNA {
  colors: string[];
  typography: {
    fontFamily: string;
    weights: string[];
  };
  spacing: string[];
  visualStyle: "minimalist" | "maximalist" | "brutalist" | "corporate";
}

export const stitchService = {
  /**
   * EXTRACT DESIGN DNA
   * Fetches design tokens from a Google Stitch project.
   */
  async getDesignDNA(accessToken?: string): Promise<DesignDNA | null> {
    if (!STITCH_PROJECT_ID) {
      console.warn("STITCH_PROJECT_ID not configured.");
      return this.getFallbackDNA();
    }

    if (!accessToken) {
       console.warn("No OAuth Access Token provided for Stitch. Using fallback.");
       return this.getFallbackDNA();
    }

    try {
      const response = await fetch(`https://labs.google.com/stitch/api/v1/projects/${STITCH_PROJECT_ID}/dna`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Stitch API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Stitch DNA Extraction Error:", error);
      return this.getFallbackDNA();
    }
  },

  getFallbackDNA(): DesignDNA {
    return {
      colors: ["#000000", "#7c3aed", "#6d28d9", "#ffffff"],
      typography: { fontFamily: "Geist Sans", weights: ["400", "700"] },
      spacing: ["0.25rem", "0.5rem", "1rem", "2rem"],
      visualStyle: "minimalist"
    };
  },

  /**
   * FORMAT DNA FOR AI PROMPT
   * Converts Design DNA into a descriptive string for LLM context.
   */
  formatDNAForPrompt(dna: DesignDNA): string {
    return `
DESIGN CONTEXT (Extracted from Google Stitch Project):
- Primary Style: ${dna.visualStyle}
- Brand Colors: ${dna.colors.join(", ")}
- Typography: ${dna.typography.fontFamily} (Weights: ${dna.typography.weights.join(", ")})
- Spacing Scale: ${dna.spacing.join(", ")}
    `.trim();
  }
};

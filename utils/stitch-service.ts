/**
 * STITCH SERVICE
 * --------------
 * Provides integration with Google Stitch (AI UI Design Tool).
 * Extracts "Design DNA" (colors, typography, structure) for visual grounding.
 */
import { readFileSync } from "fs";
import { join } from "path";

const STITCH_PROJECT_ID = process.env.STITCH_PROJECT_ID;
let warnedMissingProject = false;
let warnedMissingToken = false;

export interface DesignDNA {
  source?: "oauth" | "fallback";
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
      if (!warnedMissingProject) {
        warnedMissingProject = true;
        console.warn("STITCH_PROJECT_ID not configured. Using fallback design DNA.");
      }
      return this.getFallbackDNA();
    }

    if (!accessToken) {
       if (!warnedMissingToken) {
         warnedMissingToken = true;
         console.warn("No OAuth access token provided for Stitch. Using fallback design DNA.");
       }
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

      const data = await response.json();
      return { ...data, source: "oauth" };
    } catch (error) {
      console.error("Stitch DNA Extraction Error:", error);
      return this.getFallbackDNA();
    }
  },

  getFallbackDNA(): DesignDNA {
    try {
      // Ground fallback in the synchronized theme.json if available
      const themePath = join(process.cwd(), "theme.json");
      const theme = JSON.parse(readFileSync(themePath, "utf8"));
      
      return {
        source: "fallback",
        colors: [
          theme.theme.colors.background,
          theme.theme.colors.accent,
          theme.theme.colors.surface,
          "#ffffff"
        ],
        typography: { 
          fontFamily: theme.theme.typography.sans.split(',')[0], 
          weights: ["400", "700"] 
        },
        spacing: ["0.25rem", "0.5rem", "1rem", "2rem"],
        visualStyle: "minimalist"
      };
    } catch {
      // Hard fallback if theme.json is missing or corrupt
      return {
        source: "fallback",
        colors: ["#000000", "#7c3aed", "#6d28d9", "#ffffff"],
        typography: { fontFamily: "Geist Sans", weights: ["400", "700"] },
        spacing: ["0.25rem", "0.5rem", "1rem", "2rem"],
        visualStyle: "minimalist"
      };
    }
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

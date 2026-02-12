import fs from "fs";
import path from "path";

/**
 * StrategyOS: Stitch DNA Synchronizer
 * Extracts design tokens from Stitch HTML export and hydrates theme.json.
 */

const STITCH_EXPORT_PATH = path.join(process.cwd(), "components/stitch-exports/command-center.html");
const THEME_JSON_PATH = path.join(process.cwd(), "theme.json");

type ThemeShape = {
  theme: {
    colors: {
      background: string;
      surface: string;
      accent: string;
      muted: string;
      border: string;
      borderLow: string;
      separator: string;
      text: { primary: string; secondary: string; contrast: string };
    };
    typography: { sans: string; serif: string; mono: string };
    spacing: { railWidth: string; gap: string };
    radii?: { panel: string; control: string; chip: string };
    spacingScale?: { xs: string; sm: string; md: string; lg: string; xl: string };
    motion?: { durationFast: string; durationBase: string; durationSlow: string; easingStandard: string };
    elevation?: { low: string; medium: string; high: string };
    shadows?: { subtle: string };
    meta?: { source?: string; lastSynced?: string };
  };
};

const defaults: Required<Pick<ThemeShape["theme"], "radii" | "spacingScale" | "motion" | "elevation">> = {
  radii: {
    panel: "1.5rem",
    control: "0.75rem",
    chip: "999px",
  },
  spacingScale: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  motion: {
    durationFast: "120ms",
    durationBase: "220ms",
    durationSlow: "360ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
  },
  elevation: {
    low: "0 8px 24px rgba(0,0,0,0.32)",
    medium: "0 16px 44px rgba(0,0,0,0.42)",
    high: "0 24px 80px rgba(0,0,0,0.58)",
  },
};

function readTheme(): ThemeShape {
  const raw = fs.readFileSync(THEME_JSON_PATH, "utf8");
  return JSON.parse(raw) as ThemeShape;
}

function safeMatch(raw: string, pattern: RegExp, fallback: string): string {
  const match = raw.match(pattern);
  return match?.[1] || fallback;
}

function mergeDefaults(theme: ThemeShape): ThemeShape {
  return {
    ...theme,
    theme: {
      ...theme.theme,
      radii: {
        ...defaults.radii,
        ...(theme.theme.radii || {}),
      },
      spacingScale: {
        ...defaults.spacingScale,
        ...(theme.theme.spacingScale || {}),
      },
      motion: {
        ...defaults.motion,
        ...(theme.theme.motion || {}),
      },
      elevation: {
        ...defaults.elevation,
        ...(theme.theme.elevation || {}),
      },
    },
  };
}

async function syncStitchDNA() {
  console.log("--- StrategyOS: Stitch DNA Sync Initiated ---");

  if (!fs.existsSync(STITCH_EXPORT_PATH)) {
    console.error(`[Error] Stitch export not found at ${STITCH_EXPORT_PATH}`);
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(STITCH_EXPORT_PATH, "utf8");
  const configMatch = htmlContent.match(/tailwind\.config\s*=\s*({[\s\S]*?})\s*(?:<\/script>|;|$)/);

  if (!configMatch) {
    console.error("[Error] Could not find tailwind.config in Stitch export.");
    process.exit(1);
  }

  try {
    const rawConfig = configMatch[1];
    const currentTheme = mergeDefaults(readTheme());

    const tokens = {
      accent: safeMatch(rawConfig, /"primary":\s*"([^"]+)"/, currentTheme.theme.colors.accent),
      background: safeMatch(rawConfig, /"background-dark":\s*"([^"]+)"/, currentTheme.theme.colors.background),
      display: safeMatch(rawConfig, /"display":\s*\["([^"]+)"/, currentTheme.theme.typography.sans.split(",")[0]),
      mono: safeMatch(rawConfig, /"mono":\s*\["([^"]+)"/, currentTheme.theme.typography.mono.split(",")[0]),
      panelRadius: safeMatch(rawConfig, /"panel-radius":\s*"([^"]+)"/, currentTheme.theme.radii?.panel || defaults.radii.panel),
      controlRadius: safeMatch(rawConfig, /"control-radius":\s*"([^"]+)"/, currentTheme.theme.radii?.control || defaults.radii.control),
      motionBase: safeMatch(rawConfig, /"motion-base":\s*"([^"]+)"/, currentTheme.theme.motion?.durationBase || defaults.motion.durationBase),
      elevationHigh: safeMatch(rawConfig, /"elevation-high":\s*"([^"]+)"/, currentTheme.theme.elevation?.high || defaults.elevation.high),
    };

    console.log("[Stitch] Extracted Tokens:", tokens);

    currentTheme.theme.colors.accent = tokens.accent;
    currentTheme.theme.colors.background = tokens.background;
    currentTheme.theme.typography.sans = `${tokens.display}, sans-serif`;
    currentTheme.theme.typography.mono = `${tokens.mono}, monospace`;
    currentTheme.theme.radii = {
      ...(currentTheme.theme.radii || defaults.radii),
      panel: tokens.panelRadius,
      control: tokens.controlRadius,
    };
    currentTheme.theme.motion = {
      ...(currentTheme.theme.motion || defaults.motion),
      durationBase: tokens.motionBase,
    };
    currentTheme.theme.elevation = {
      ...(currentTheme.theme.elevation || defaults.elevation),
      high: tokens.elevationHigh,
    };
    currentTheme.theme.meta = {
      source: "stitch-sync",
      lastSynced: new Date().toISOString(),
    };

    fs.writeFileSync(THEME_JSON_PATH, JSON.stringify(currentTheme, null, 2), "utf8");

    console.log("--- [Success] theme.json synchronized with Stitch DNA ---");
  } catch (error) {
    console.error("[Error] Failed to parse or sync tokens:", error);
    process.exit(1);
  }
}

syncStitchDNA();

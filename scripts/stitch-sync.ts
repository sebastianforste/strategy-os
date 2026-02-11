
import fs from 'fs';
import path from 'path';

/**
 * StrategyOS: Stitch DNA Synchronizer
 * This script extracts design tokens from the Stitch HTML export 
 * and hydrates the system's theme.json to ensure visual sovereignty.
 */

const STITCH_EXPORT_PATH = path.join(process.cwd(), 'components/stitch-exports/command-center.html');
const THEME_JSON_PATH = path.join(process.cwd(), 'theme.json');

async function syncStitchDNA() {
  console.log('--- StrategyOS: Stitch DNA Sync Initiated ---');

  if (!fs.existsSync(STITCH_EXPORT_PATH)) {
    console.error(`[Error] Stitch export not found at ${STITCH_EXPORT_PATH}`);
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(STITCH_EXPORT_PATH, 'utf8');

  // Extract tailwind.config object from the script tag
  // Updated regex to handle missing semicolon and potential whitespace
  const configMatch = htmlContent.match(/tailwind\.config\s*=\s*({[\s\S]*?})\s*(?:<\/script>|;|$)/);
  
  if (!configMatch) {
    console.error('[Error] Could not find tailwind.config in Stitch export.');
    process.exit(1);
  }

  try {
    // We can't simply JSON.parse because it's JS, but for these specific exports it's usually clean enough
    // Use a safer evaluation or primitive parsing for these specific tokens
    const rawConfig = configMatch[1];
    
    // Extracting specifically what we need: colors and fonts
    const primaryColorMatch = rawConfig.match(/"primary":\s*"([^"]+)"/);
    const bgDarkMatch = rawConfig.match(/"background-dark":\s*"([^"]+)"/);
    const displayFontMatch = rawConfig.match(/"display":\s*\["([^"]+)"/);
    const monoFontMatch = rawConfig.match(/"mono":\s*\["([^"]+)"/);

    const tokens = {
      accent: primaryColorMatch ? primaryColorMatch[1] : "#7c3bed",
      background: bgDarkMatch ? bgDarkMatch[1] : "#080a0f",
      display: displayFontMatch ? displayFontMatch[1] : "Space Grotesk",
      mono: monoFontMatch ? monoFontMatch[1] : "Fira Code"
    };

    console.log('[Stitch] Extracted Tokens:', tokens);

    // Read current theme.json
    const currentTheme = JSON.parse(fs.readFileSync(THEME_JSON_PATH, 'utf8'));

    // Mutate theme.json
    currentTheme.theme.colors.accent = tokens.accent;
    currentTheme.theme.colors.background = tokens.background;
    currentTheme.theme.typography.sans = `${tokens.display}, sans-serif`;
    currentTheme.theme.typography.mono = `${tokens.mono}, monospace`;

    // Write back
    fs.writeFileSync(THEME_JSON_PATH, JSON.stringify(currentTheme, null, 2), 'utf8');

    console.log(`--- [Success] theme.json synchronized with Stitch DNA ---`);
  } catch (error) {
    console.error('[Error] Failed to parse or sync tokens:', error);
    process.exit(1);
  }
}

syncStitchDNA();

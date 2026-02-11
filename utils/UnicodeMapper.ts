/**
 * UnicodeMapper: StrategyOS 2.0 Semantic Sovereignty
 * Maps plain text to high-status mathematical blocks.
 */

export type UnicodeStyle = 'SANS_BOLD' | 'SERIF_BOLD' | 'NONE';

const SANS_BOLD_START = 0x1D5D4; // Mathematical Sans-Serif Bold Capital A
const SERIF_BOLD_START = 0x1D400; // Mathematical Bold Serif Capital A

const SANS_BOLD_LOWER_START = 0x1D5EE; // Mathematical Sans-Serif Bold Lower a
const SERIF_BOLD_LOWER_START = 0x1D41A; // Mathematical Bold Serif Lower a

// Overrides for Letterlike Symbols (if using Script styles)
const SCRIPT_OVERRIDES: Record<string, string> = {
  'B': '\u212C',
  'E': '\u2130',
  'F': '\u2131',
  'H': '\u210B',
  'I': '\u2110',
  'L': '\u2112',
  'M': '\u2133',
  'R': '\u211B',
  'g': '\u210A',
  'o': '\u2134',
};

export function mapToUnicode(text: string, style: UnicodeStyle): string {
  if (style === 'NONE') return text;

  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    
    // Uppercase A-Z (65-90)
    if (code >= 65 && code <= 90) {
      const offset = code - 65;
      const start = style === 'SANS_BOLD' ? SANS_BOLD_START : SERIF_BOLD_START;
      return String.fromCodePoint(start + offset);
    }
    
    // Lowercase a-z (97-122)
    if (code >= 97 && code <= 122) {
      const offset = code - 97;
      const start = style === 'SANS_BOLD' ? SANS_BOLD_LOWER_START : SERIF_BOLD_LOWER_START;
      return String.fromCodePoint(start + offset);
    }

    return char;
  }).join('');
}

export interface UnicodeDensityResult {
  density: number;
  isHigh: boolean;
  plainText: string;
}

export function checkUnicodeDensity(text: string): UnicodeDensityResult {
  const totalChars = text.length;
  if (totalChars === 0) return { density: 0, isHigh: false, plainText: '' };

  let unicodeCount = 0;
  let plainText = '';

  for (const char of text) {
    const codePoint = char.codePointAt(0) || 0;
    if (codePoint > 0xFFFF) {
      unicodeCount++;
      // Attempt to reverse map if needed, for now just identify
    }
    plainText += char;
  }

  const density = unicodeCount / totalChars;
  return {
    density,
    isHigh: density > 0.15,
    plainText: text.normalize('NFKD') // Simple normalization for ARIA fallback
  };
}

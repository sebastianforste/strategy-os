import { describe, it, expect } from 'vitest';
import { mapToUnicode, checkUnicodeDensity } from '../utils/UnicodeMapper';

describe('UnicodeMapper: mapToUnicode', () => {
  it('maps standard uppercase A-Z to Sans-Serif Bold correctly', () => {
    const input = 'ABC';
    const result = mapToUnicode(input, 'SANS_BOLD');
    // Expected: 𝗔𝗕𝗖 (U+1D5D4, U+1D5D5, U+1D5D6)
    expect(result).toBe('𝗔𝗕𝗖');
  });

  it('maps standard lowercase a-z to Sans-Serif Bold correctly', () => {
    const input = 'abc';
    const result = mapToUnicode(input, 'SANS_BOLD');
    // Expected: 𝗮𝗯𝗰 (U+1D5EE, U+1D5EF, U+1D5F0)
    expect(result).toBe('𝗮𝗯𝗰');
  });

  it('maps standard uppercase A-Z to Serif Bold correctly', () => {
    const input = 'ABC';
    const result = mapToUnicode(input, 'SERIF_BOLD');
    // Expected: 𝐀𝐁𝐂 (U+1D400, U+1D401, U+1D402)
    expect(result).toBe('𝐀𝐁𝐂');
  });

  it('leaves non-alphabetic characters unchanged', () => {
    const input = 'Hello, World! 123';
    const result = mapToUnicode(input, 'SANS_BOLD');
    expect(result).toBe('𝗛𝗲𝗹𝗹𝗼, 𝗪𝗼𝗿𝗹𝗱! 123');
  });

  it('returns original text when style is NONE', () => {
    const input = 'Sovereign Strategy';
    expect(mapToUnicode(input, 'NONE')).toBe(input);
  });
});

describe('UnicodeMapper: checkUnicodeDensity', () => {
  it('calculates density correctly for plain text', () => {
    const result = checkUnicodeDensity('Plain text');
    expect(result.density).toBe(0);
    expect(result.isHigh).toBe(false);
  });

  it('calculates density correctly for mixed text', () => {
    const input = 'This is 𝐒𝐨𝐯𝐞𝐫𝐞𝐢𝐠𝐧'; // 9 unicode bold chars
    const result = checkUnicodeDensity(input);
    expect(result.density).toBeGreaterThan(0);
    expect(result.isHigh).toBe(true);
  });

  it('handles empty strings gracefully', () => {
    const result = checkUnicodeDensity('');
    expect(result.density).toBe(0);
    expect(result.isHigh).toBe(false);
  });

  it('provides NFKD normalized plainText', () => {
    const input = '𝐀𝐁𝐂';
    const result = checkUnicodeDensity(input);
    expect(result.plainText.normalize('NFKD')).toBe('ABC');
  });
});

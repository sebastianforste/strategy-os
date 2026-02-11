import { describe, it, expect } from 'vitest';
import { detectIntent } from '../utils/intent-engine';

describe('Intent Engine: detectIntent', () => {
  it('detects IDEATION for empty or very short content', () => {
    expect(detectIntent('').intent).toBe('IDEATION');
    expect(detectIntent('Hi').intent).toBe('IDEATION');
  });

  it('detects DRAFTING for small portions of text', () => {
    const content = 'This is a small drafting session with more than ten words in it.';
    expect(detectIntent(content).intent).toBe('DRAFTING');
  });

  it('detects POLISHING for larger generic text blocks', () => {
    const content = 'Success is not about being smart. It is about avoiding stupidity. Most people think they need to be geniuses to win in the markets, but the reality is that surviveability is the only metric that matters in the long run. If you don\'t blow up, you win by default. This is the fundamental law of strategy and execution. Let us continue to expand on this concept for more clarity and depth.';
    expect(detectIntent(content).intent).toBe('POLISHING');
  });

  it('detects LINKEDIN for "Bro-etry" structure', () => {
    const content = 'Success is hard.\n\nMost people fail.\n\nWhy?\n\nThey lack discipline.';
    const result = detectIntent(content);
    expect(result.intent).toBe('LINKEDIN');
    expect(result.confidence).toBe(0.8);
  });

  it('detects SUBSTACK for long-form content with headers', () => {
    const content = '# The Stupidity Paradox\n\nIn this long-form essay, we will delve into the mechanics of recursive failure and how to avoid the common pitfalls of the modern entrepreneur.';
    const result = detectIntent(content);
    expect(result.intent).toBe('SUBSTACK');
    expect(result.activeContexts).toContain('LONG_FORM');
  });

  it('detects REPLYING for content starting with Re:', () => {
    expect(detectIntent('Re: Your latest post about AI.').intent).toBe('REPLYING');
    expect(detectIntent('Comment on the strategic shift.').intent).toBe('REPLYING');
  });

  it('detects NEWSJACKING for content containing URLs', () => {
    expect(detectIntent('Check this out: https://google.com').intent).toBe('NEWSJACKING');
    expect(detectIntent('Breaking news: http://news.com/latest').intent).toBe('NEWSJACKING');
  });

  it('honors manual #linkedin override with maximum confidence', () => {
    const content = 'Some random content #linkedin';
    const result = detectIntent(content);
    expect(result.intent).toBe('LINKEDIN');
    expect(result.confidence).toBe(1);
  });

  it('honors manual #substack override with maximum confidence', () => {
    const content = 'Brief thought #substack';
    const result = detectIntent(content);
    expect(result.intent).toBe('SUBSTACK');
    expect(result.confidence).toBe(1);
  });

  it('prioritizes manual override over URL signal', () => {
    const content = 'https://google.com #linkedin';
    expect(detectIntent(content).intent).toBe('LINKEDIN');
  });
});

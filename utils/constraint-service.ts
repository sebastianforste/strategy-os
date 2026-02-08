import { BANNED_WORDS } from './text-processor';

export interface ConstraintResult {
    valid: boolean;
    reason?: string;
  }
  
  /**
   * Scientifically validates if the output meets "World-Class" standards.
   * 1. Hook Length (first 2 lines) must be < 210 chars.
   * 2. NO Banned Words (Anti-Robot check).
   */
  export const verifyConstraints = (text: string): ConstraintResult => {
    if (!text) return { valid: false, reason: "Empty text" };
  
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    // 1. Check Hook Length (Line 1 + Line 2)
    let hookLength = 0;
    if (lines.length > 0) hookLength += lines[0].length;
    if (lines.length > 1) hookLength += lines[1].length;
  
    if (hookLength > 210) {
      return { 
        valid: false, 
        reason: `Hook is too long (${hookLength} chars). Must be under 210 characters.` 
      };
    }

    // 2. Anti-Robot Check (Banned Words)
    const normalizedText = text.toLowerCase();
    for (const word of BANNED_WORDS) {
        const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
        if (regex.test(normalizedText)) {
            return {
                valid: false,
                reason: `Banned AI-ism detected: "${word}". Replace with high-status alternatives.`
            };
        }
    }
  
    return { valid: true };
  };
  

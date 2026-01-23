export interface ConstraintResult {
    valid: boolean;
    reason?: string;
  }
  
  /**
   * Scientifically validates if the hook (first 2 lines) is within limits.
   * "World Class" constraint: Hook must be communicative but efficient.
   * Max 280 chars is too long for a hook. 210 is a good "Tweet size" limit for the opener.
   */
  export const verifyConstraints = (text: string): ConstraintResult => {
    if (!text) return { valid: false, reason: "Empty text" };
  
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    // Check Hook Length (Line 1 + Line 2)
    // We treat the first 2 non-empty lines as the "Visual Hook" that appears above "See More"
    let hookLength = 0;
    if (lines.length > 0) hookLength += lines[0].length;
    if (lines.length > 1) hookLength += lines[1].length;
  
    // Constraint: Hook < 210 chars
    if (hookLength > 210) {
      return { 
        valid: false, 
        reason: `Hook is too long (${hookLength} chars). Must be under 210 characters.` 
      };
    }
  
    return { valid: true };
  };
  

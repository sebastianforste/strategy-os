# Implementation Plan - Phase 19: "World Class" Upgrades

# Goal
Close the gap between current StrategyOS and the "LinkedIn Command Center" spec provided by the user.

## Gap Analysis results
- [x] **PDF Generation**: Implemented (Phase 12).
- [ ] **Hard Constraints**: ABSENT. Need a loop to count characters and reject invalid hooks.
- [ ] **Newsjack Toggle**: LOGIC EXISTS, UI MISSING. Need a manual checkbox to force trend search.
- [/] **Modes**: EXIST under different names (Strategist/Contrarian).

## Proposed Changes

### 1. The Quality Gate (`utils/constraint-service.ts`)
- **Function**: `verifyConstraints(text: string): { valid: boolean; reason?: string }`
- **Logic**:
    -   Split text into lines.
    -   Check if Line 1 + Line 2 < 210 characters.
    -   If valid, return true.
    -   If invalid, return false.

### 2. The Retry Loop (`utils/ai-service.ts`)
- Modify `generateContent` to:
    1.  Generate Text.
    2.  Run `verifyConstraints`.
    3.  If fail -> Add "CRITICAL INSTRUCTION: Previous hook was too long. Shorten it." -> Retry (Max 2 retries).

### 3. Newsjack Toggle (`components/InputConsole.tsx`)
- Add a checkbox: `[ ] Newsjack Mode`.
- Pass this boolean to `processInput`.
- If true, FORCE `findTrends` execution regardless of input length.

## Verification
1.  **Constraint Test**: Input a prompt that usually generates long hooks. Verify logs show a "Retry" event and final output is short.
2.  **Newsjack Test**: Check the box with a generic topic ("Business"). Verify it finds news and mentions it in the post.

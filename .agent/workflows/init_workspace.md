# Workflow: Initialize Workspace Architecture

**Trigger:** User types "/init" or "Setup workspace"

## Step 1: Safety Check
- Check if `.agent/` folder exists.
- If it exists, ask the user: "Workspace already initialized. Overwrite rules? (Y/N)"

## Step 2: Scaffold Directory Structure
Create the following folders if they do not exist:
- `.agent/rules/` (For permanent behavioral laws)
- `.agent/skills/` (For custom Python/Bash scripts)
- `.agent/memory/` (For long-term project context)

## Step 3: Inject the "Model Router"
Create a file named `.agent/rules/model_strategy.md`.
Write the following content into it:

"""
# Model Selection Strategy

You are an intelligent orchestrator. Before starting any task, analyze its complexity and explicitly choose the appropriate model tier.

## 🟢 TIER 1: SPEED (Default to Gemini 3 Flash)
**Trigger:** Use for simple, low-risk, or well-defined tasks.
**Criteria:**
- Boilerplate code, unit tests, linting fixes, CSS/Styling.
- "Act fast. Do not over-plan. Output code immediately."

## 🔵 TIER 2: ARCHITECT (Switch to Gemini 3 Pro)
**Trigger:** Use for multi-file logic, refactoring, or system design.
**Criteria:**
- Refactoring >3 files, library migrations, API specs.
- "Check dependency tree. Create a plan first."

## 🟣 TIER 3: DEEP REASONING (Switch to Gemini 3 Deep Think)
**Trigger:** Use ONLY for 'impossible' bugs, complex math, or security audits.
**Criteria:**
- Race conditions, deadlocks, complex SQL optimization.
- "Simulate execution path mentally. Output reasoning steps."
"""

## Step 4: Create Basic Code Style Guide
Create a file named `.agent/rules/style_guide.md` with this placeholder:
"""
# Coding Standards
1. Always add comments to complex logic.
2. Use modern syntax (e.g., ES6+ for JS, Python 3.12+).
3. No magic numbers; use named constants.
"""

## Step 5: Final Report
- Output: "✅ Antigravity Workspace Initialized."
- List the files created.
- Ask: "Would you like me to scan your existing code to update the style guide?"

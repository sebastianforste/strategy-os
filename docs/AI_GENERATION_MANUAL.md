# StrategyOS AI Generation Manual

## 1. Purpose
This manual describes the current AI generation pipeline used by StrategyOS.

## 2. Entry Points
Main server actions in `actions/generate.ts`:
- `processInput`
- `reviseWithPersonaAction`
- `scoreViralityAction`
- `refineAuthorityAction`
- `generateCommentAction`

## 3. Model Configuration
Source of truth: `utils/config.ts`.

Current configuration model pool:
- `models/gemini-2.5-flash`
- `models/gemini-flash-latest`
- `models/gemini-2.5-flash-preview-09-2025`
- `models/gemini-3-flash-preview`

Other configured models:
- fallback: `models/gemini-3-flash-preview`
- reasoning: `models/deep-research-pro-preview-12-2025`
- image: `models/imagen-4.0-generate-001`
- embedding primary: `gemini-embedding-001`
- embedding fallback: `text-embedding-004`

## 4. Generation Pipeline (`processInput`)
1. validate input and Gemini key
2. determine platform adapter (LinkedIn/Twitter)
3. construct enriched prompt (`utils/prompt-builder.ts`)
4. generate text package (`utils/ai-service-server.ts`)
5. optional image generation (`utils/image-service.ts`)
6. apply anti-robot and formatting normalization (`utils/text-processor.ts`)
7. save generated markdown artifact under `generated_posts/`

## 5. Persona Revision Pipeline
`reviseWithPersonaAction`:
1. loads active persona prompt from `utils/personas.ts`
2. builds rewrite instruction
3. calls configured static primary model
4. returns cleaned text via anti-robot filter

## 6. Embeddings and Context
Embedding service: `utils/gemini-embedding.ts`.

Behavior:
- attempts working model, then primary, then fallback list
- marks unsupported models and retries alternatives
- degrades gracefully to empty vectors if models unavailable

## 7. Common Error Classes
### 429 `RESOURCE_EXHAUSTED`
Cause: quota/rate limits.
Action:
- check provider quota/billing
- reduce repeated high-frequency calls
- consider lower-frequency model route

### 404 model not found / unsupported
Cause: invalid or deprecated model for API surface.
Action:
- update model constants in `utils/config.ts`
- re-run smoke tests

### image generation `INVALID_ARGUMENT` billed users only
Cause: Imagen usage entitlement.
Action:
- handle as optional side-asset path
- keep text generation non-blocking

## 8. Safe Usage Notes
- Never rely on hardcoded keys in client code.
- Prefer server action paths for external API calls.
- Keep model references centralized in `utils/config.ts`.

## 9. Verification
Recommended smoke command for persona/function matrix:
```bash
NODE_OPTIONS="--require /tmp/server-only-shim.cjs" npx tsx scripts/test-all-functions.ts "Future of lawyers and influence of AI Agents"
```

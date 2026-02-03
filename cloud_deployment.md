# Deploying StrategyOS to Google Cloud Run 🚀

Since this is a Next.js app, the best way to share it with colleagues is **Google Cloud Run**. It scales to zero (cheap) and gives you a secure HTTPS URL automatically.

## Prerequisites
**1. Install Google Cloud SDK**
If you don't have it installed:
```bash
brew install --cask gcloud-cli
```

**2. Authenticate**
Ensure you are logged in:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

## Step 1: Enable Services
Enable the Container Registry and Cloud Run APIs:
```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

## Step 2: Build the Container
We will use Cloud Build to build the Docker image remotely (so it doesn't slow down your laptop).
```bash
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/strategy-os
```

## Step 3: Deploy to Cloud Run
Deploy the service using the flags below.

> [!IMPORTANT]
> **Environment Variables Checklist:**
> - `NEXT_PUBLIC_GEMINI_API_KEY`: Required for all AI.
> - `NEXT_PUBLIC_SERPER_API_KEY`: Required for Deep Research & Agentic Mode.
> - `NEXT_PUBLIC_GEMINI_PRIMARY_MODEL`: Recommended `models/gemini-2.5-flash-native-audio-latest`.
> - `LINKEDIN_CLIENT_ID` / `..._SECRET`: Required for Auth.

```bash
gcloud run deploy strategy-os \
  --image gcr.io/$(gcloud config get-value project)/strategy-os \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --set-env-vars NEXT_PUBLIC_GEMINI_API_KEY="[YOUR_KEY_HERE]" \
  --set-env-vars NEXT_PUBLIC_SERPER_API_KEY="[YOUR_SERPER_KEY_HERE]" \
  --set-env-vars NEXT_PUBLIC_GEMINI_PRIMARY_MODEL="models/gemini-2.5-flash-native-audio-latest" \
  --set-env-vars LINKEDIN_CLIENT_ID="[LINKEDIN_ID]" \
  --set-env-vars LINKEDIN_CLIENT_SECRET="[LINKEDIN_SECRET]"
```

### 🧠 Performance Note
StrategyOS (Phase 16) now includes **The Council of Agents**. Each debate triggers parallel LLM calls.
- We recommended increasing memory to **2Gi** (flag included above).
- Standard generation without Swarm works fine on default settings.

### 🔐 Security Note (Colleague Access)
- The `--allow-unauthenticated` flag makes the URL public (anyone with the link can access).
- **To restrict to colleagues only:**
  1. Remove `--allow-unauthenticated`.
  2. Go to Google Cloud Console > Cloud Run.
  3. Select `strategy-os` > Permissions.
  4. Add your colleagues' Google emails with the role **"Cloud Run Invoker"**.

## Step 4: Share the URL
The terminal will output a URL like:
`https://strategy-os-xyz123-uc.a.run.app`

Send this to your colleagues!

---

**Troubleshooting**
- **Persistence**: StrategyOS uses `Cloud SQL` (via Prisma) for team-wide strategies, user roles, and audit logs. Real-time assets and local history still benefit from `IndexedDB` for speed.
- If build fails on `next build`, ensure `output: "standalone"` is in `next.config.ts` (Done ✅).

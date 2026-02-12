# StrategyOS on Google Cloud Run

This guide deploys StrategyOS as a containerized service on Cloud Run.

## 1. Prerequisites
- Google Cloud SDK installed
- project selected
- required APIs enabled

```bash
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## 2. Build and Push Image
```bash
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/strategy-os
```

## 3. Deploy
```bash
gcloud run deploy strategy-os \
  --image gcr.io/$(gcloud config get-value project)/strategy-os \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1
```

## 4. Environment Variables
Set via Cloud Run console or CLI. At minimum:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)

Optional provider/integration variables as needed.

## 5. Database Considerations
Cloud Run is stateless. Do not depend on local SQLite file persistence for production data.

Recommended:
- managed SQL backend
- persistent connection URL via `DATABASE_URL`

## 6. Validation Checklist
After deploy:
1. open Cloud Run URL
2. confirm homepage load
3. hit `/api/health`
4. run draft and revision flow
5. verify publish endpoint behavior in your configured mode

## 7. Security Notes
- remove `--allow-unauthenticated` if access should be restricted
- configure IAM invoker permissions for allowed users/services

# ☁️ Vercel Deployment Guide

StrategyOS uses **SQLite** for local development. However, Vercel (Serverless) requires a **Cloud Database** (PostgreSQL) because standard SQLite files are not persistent in a serverless environment.

To deploy to Vercel, follow these steps:

---

## 1. Get a Cloud Database (Free)
We recommend **Neon** (Serverless Postgres) or **Supabase**.

1. Go to [Neon.tech](https://neon.tech) and create a free project.
2. Copy the **Connection String** (e.g., `postgres://user:pass@ep-xyz.aws.neon.tech/neondb...`).

---

## 2. Update Project Config
You must switch the Prisma provider from `sqlite` to `postgresql`.

**Option A: Hybrid Mode (Recommended)**
Keep `sqlite` for local, use `postgresql` for Vercel.
*Note: This is tricky with Prisma. The easiest way is to commit the Postgres schema.*

**Option B: Switch to Postgres Completely**
1. Open `prisma/schema.prisma`.
2. Change:
   ```prisma
   datasource db {
     provider = "postgresql" // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Update `.env`:
   ```bash
   DATABASE_URL="your_neon_connection_string"
   ```
4. Restore native types (Optional):
   - You can add back `@db.Text` for long strings if needed, but standard `String` works fine in Postgres too.

---

## 3. Deploy to Vercel

1. **Push your code** to GitHub.
2. **Import Project** in Vercel.
3. **Environment Variables**:
   Add the following in Vercel Project Settings:
   - `DATABASE_URL`: Your Neon Connection String.
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Your Gemini Key.
   - `NEXTAUTH_SECRET`: Your generated secret.
   
4. **Build Command**:
   Vercel will automatically run `npm run build` (which triggers `prisma generate`).

5. **Database Migration**:
   In Vercel Build Settings (or via Vercel CLI), you might need to run:
   ```bash
   npx prisma db push
   ```
   *Tip: You can add `"build": "prisma db push && next build"` to package.json to ensure DB is synced on every deploy.*

---

## 4. Verify
Once deployed, check:
- Login (NextAuth).
- Content Generation (Gemini).
- Analytics (Database).

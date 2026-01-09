# Deployment Guide: LegalDraft Pro

This document provides step-by-step instructions on how to deploy this application to production and integrate a persistent database for document storage.

## 1. Prepare for Deployment

Before deploying, ensure your code is pushed to a GitHub repository:
1. Create a new repository on [GitHub](https://github.com/new).
2. Run the following in your terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LegalDraft Pro"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## 2. Deploying to Vercel (Recommended)

Vercel is the creator of Next.js and provides the best experience.

1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **"Add New"** > **"Project"**.
3. Import your repository.
4. Vercel will automatically detect Next.js. Click **"Deploy"**.
5. Once finished, you will have a live URL (e.g., `https://your-project.vercel.app`).

---

## 3. Deploying to Render

If you prefer Render:
1. Sign in to [Render](https://render.com).
2. Click **"New"** > **"Web Service"**.
3. Connect your GitHub account and select your repository.
4. Set the following configurations:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
5. Click **"Create Web Service"**.

---

## 4. Persistent Storage (Database Integration)

Currently, the editor saves content in local memory. To store documents permanently across sessions, follow these steps:

### Option A: Supabase (Fastest for Assignments)
1. Create a project on [Supabase](https://supabase.com).
2. Create a table named `documents` with columns: `id` (uuid), `title` (text), `content` (text).
3. Install the client: `npm install @supabase/supabase-js`.
4. Update `Editor.tsx` to call Supabase in the `handleManualSave` function.

### Option B: Vercel Postgres
1. In your Vercel Dashboard, go to the **Storage** tab.
2. Select **Postgres** and connect it to your project.
3. Use the generated environment variables (`POSTGRES_URL`) to connect via an API route in `src/app/api/save/route.ts`.

### Sample API Route (`src/app/api/save/route.ts`)
```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { title, content } = await req.json();
  // TODO: Insert into your DB here (SQL or Prisma)
  return NextResponse.json({ success: true });
}
```

---

## 5. Environment Variables
If you add a database, remember to add your secrets in the Vercel or Render dashboard settings under "Environment Variables":
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

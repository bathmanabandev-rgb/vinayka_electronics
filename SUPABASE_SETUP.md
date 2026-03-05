# Supabase setup for VINAYAGA ELECTRICALS

This project uses **Supabase (PostgreSQL)** as the database.

## 1. Get your Supabase connection string

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Open your project (or create one).
3. Go to **Project Settings** (gear) → **Database**.
4. Under **Connection string**, choose **URI**, and set **Method** to **Session pooler** (not Direct).
5. Copy the connection string. The username **must** be `postgres.[project-ref]` (e.g. `postgres.abc123xyz`), not just `postgres`, or you'll get "Tenant or user not found".
6. Replace `[YOUR-PASSWORD]` with your database password. If the password contains `@`, use `%40` in the URI (e.g. `mypass%40word`).

**For serverless (Vercel)** always use the **Session pooler** (port **6543**), not the direct connection (5432).

## 2. Configure environment variables

**Local (`.env` in project root):**

```env
DATABASE_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SESSION_SECRET=any-random-long-string
```

**Vercel:**  
Project → **Settings** → **Environment Variables** → add:

- `DATABASE_URL` = your Supabase connection string (with real password)
- `SESSION_SECRET` = same random string as above
- `NODE_ENV` = `production`

## 3. Create tables and seed data (one-time)

From the project root:

```bash
npm install
npm run db:push
```

This runs `database/schema-supabase.sql` on your Supabase database (tables + default admin/staff users and sample products).

**Alternative:** open Supabase Dashboard → **SQL Editor**, paste the contents of `database/schema-supabase.sql`, and run it.

## 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000 and log in:

- **Admin:** `admin` / `admin123`
- **Staff:** `staff1` / `staff123`

## 5. Deploy to Vercel

1. Set `DATABASE_URL` and `SESSION_SECRET` in Vercel (see step 2).
2. Deploy (e.g. `vercel --prod` or push to Git if connected).
3. After first deploy, if you didn’t run `db:push` before, run it locally with the same `DATABASE_URL` so the production DB has tables and seed data.

## Resetting passwords (optional)

If you need to reset admin/staff passwords:

```bash
node backend/seed-passwords.js
```

(Uses `DATABASE_URL` or DB vars from `.env`.)

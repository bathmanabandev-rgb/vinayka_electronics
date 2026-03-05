# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm install -g vercel`
3. **MySQL Database**: Use a hosted MySQL (e.g. PlanetScale, AWS RDS, Railway, or any MySQL host)

## Step 1: Prepare Your Database and Push Schema

1. Create a MySQL database on your hosting service and note: **host**, **user**, **password**, **database name**, **port** (usually 3306).
2. In the project root, copy env example and set your **production** DB credentials:
   ```bash
   # Windows: copy .env.example .env
   # Mac/Linux: cp .env.example .env
   ```
   Edit `.env` with your production DB values (same as you will add in Vercel in Step 2).
3. Push schema and all migrations in one command:
   ```bash
   npm run db:push
   ```
   This runs, in order: `schema.sql`, `add-invoice-no-to-bills.sql`, `add-is-active-to-products.sql`, `add-optional-fields-to-bills.sql`, `update-add-image-column.sql`. Safe to run multiple times (idempotent).

## Step 2: Configure Environment Variables

You need to set these environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=3306
SESSION_SECRET=your-random-secret-key-here-change-this
NODE_ENV=production
```

**Important**: Generate a strong random string for `SESSION_SECRET` (you can use an online generator or run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. **Login** (one time): `vercel login`
2. **Deploy** (first time): `vercel` — follow prompts (scope, project name, directory).
3. **Production deploy**: `vercel --prod`

Or use the npm script: `npm run vercel` for deploy, `npm run vercel -- --prod` for production.

### Option B: Using GitHub Integration

1. **Push your code to GitHub** (if not already done)
2. **Go to Vercel Dashboard** → **Add New Project**
3. **Import your GitHub repository**
4. **Configure**:
   - Framework Preset: **Other**
   - Root Directory: `.` (root)
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. **Add Environment Variables** (as described in Step 2)
6. **Deploy**

## Step 4: Update Session Configuration

The session configuration in `backend/server.js` should work with Vercel, but you may need to use a different session store for production (like Redis) if you have multiple serverless instances.

For now, the in-memory session store will work, but sessions won't persist across serverless function restarts.

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Test the application:
   - Login with admin credentials
   - Create a product
   - Generate a bill
   - Download invoice

## Troubleshooting

### Database Connection Issues

- Verify all database environment variables are correct
- Check if your database allows connections from Vercel's IP addresses
- Some databases require IP whitelisting - add Vercel's IP ranges

### Session Issues

- Sessions may not persist across serverless function cold starts
- Consider using a session store like Redis for production

### File Upload Issues

- Vercel has a 4.5MB limit for serverless functions
- Large file uploads may need to be handled differently
- Consider using Vercel Blob Storage or AWS S3 for file storage

### API Routes Not Working

- Ensure `vercel.json` is correctly configured
- Check that all routes are prefixed with `/api`
- Verify environment variables are set

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL database host | `your-db-host.com` |
| `DB_USER` | Database username | `admin` |
| `DB_PASSWORD` | Database password | `your-password` |
| `DB_NAME` | Database name | `billing_app` |
| `DB_PORT` | Database port | `3306` |
| `SESSION_SECRET` | Secret for session encryption | `random-string-here` |
| `NODE_ENV` | Environment | `production` |

## Post-Deployment

1. **Database**: If you didn’t run it before deploy, run `npm run db:push` with production DB in `.env` (same values as in Vercel).
2. **Admin user**: Schema seeds default admin (username: `admin`, password: `admin123`) and staff (username: `staff1`, password: `staff123`). Change passwords after first login.
3. **Test all features**:
   - Login/Logout
   - Product management
   - Bill creation
   - Invoice generation
   - Reports

## Custom Domain (Optional)

1. Go to **Settings** → **Domains** in Vercel
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update your domain's DNS records

## Monitoring

- Check **Vercel Dashboard** → **Deployments** for deployment status
- View **Functions** tab for serverless function logs
- Check **Analytics** for usage statistics

## Support

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Verify all environment variables are set
3. Test database connectivity
4. Review the deployment logs

---

**Note**: For production use, consider:
- Using a managed database service (PlanetScale, AWS RDS)
- Implementing Redis for session storage
- Setting up proper backup strategies
- Configuring monitoring and alerts

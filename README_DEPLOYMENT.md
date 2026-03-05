# Quick Deployment Guide

## 🚀 Deploy to Vercel in 5 Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Set Up Database
- Get a MySQL database (PlanetScale, AWS RDS, or any MySQL host)
- Run the SQL files in the `database/` folder to set up your schema

### Step 4: Deploy
```bash
vercel
```

Follow the prompts, then for production:
```bash
vercel --prod
```

### Step 5: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=3306
SESSION_SECRET=generate-a-random-string-here
NODE_ENV=production
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Files Created for Vercel

- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Root package.json for Vercel
- ✅ `.vercelignore` - Files to exclude from deployment
- ✅ `api/index.js` - Serverless function entry point
- ✅ Updated `backend/server.js` - Vercel-compatible
- ✅ Updated `frontend/js/constants.js` - Auto-detect API URL

## 🔧 Important Notes

1. **Database**: You need a hosted MySQL database. Vercel doesn't provide databases.
2. **Sessions**: In-memory sessions work but won't persist across cold starts. Consider Redis for production.
3. **File Uploads**: Limited to 4.5MB on Vercel. Consider external storage for larger files.
4. **Environment Variables**: Must be set in Vercel dashboard, not in `.env` file.

## 📖 Full Documentation

See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

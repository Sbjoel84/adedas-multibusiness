# ADEDAS MULTIBUSINESS - Deployment Guide

This guide covers deploying the frontend to **Vercel** and backend to **Render**.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- [Vercel Account](https://vercel.com)
- [Render Account](https://render.com)

---

## Frontend Deployment (Vercel)

### Step 1: Prepare for Vercel

The project is already configured with [`vercel.json`](vercel.json) for deployment, including:
- SPA routing support (React Router)
- API proxy configuration for backend communication

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel
```

**Option B: Using GitHub**

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

### Step 3: Configure Environment Variables (Optional)

In Vercel dashboard, add these environment variables:
```
VITE_API_URL=https://your-backend.onrender.com
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_WHATSAPP_ADMIN_PHONE=+2348036262488
```

---

## Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `adedas-postgres`
   - Database Name: `adedas`
   - User: `adedas`
4. Copy the "Internal Database URL"

### Step 2: Deploy Backend Service

**Option A: Using render.yaml (Recommended)**

1. Push your code to GitHub (include the `backend/` folder)
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Select the `backend/render.yaml` file
6. Configure the environment variables:
   - `DATABASE_URL`: Paste the PostgreSQL connection string from Step 1
   - `JWT_SECRET`: Generate a secure random string
   - `PAYSTACK_SECRET_KEY`: Your Paystack secret key
   - `PAYSTACK_PUBLIC_KEY`: Your Paystack public key
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
7. Click "Apply"

**Option B: Manual Service Creation**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `adedas-backend`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. Add Environment Variables (see above)
6. Click "Create Web Service"

### Step 3: Run Database Migrations

After deployment, you need to run Prisma migrations:

```bash
# In your local terminal, run:
cd backend
npx prisma migrate deploy

# Or use Render's SSH to run migrations:
# 1. Go to your backend service in Render
# 2. Click "Shell"
# 3. Run: npx prisma migrate deploy
```

---

## Connecting Frontend to Backend

### Update CORS Settings

In your backend `.env` file, set:
```
FRONTEND_URL=https://your-vercel-frontend.vercel.app
```

### Update API Calls (Future)

When you connect the frontend to the backend, use environment variables:

```typescript
// Example API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

---

## Environment Variables Reference

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_WHATSAPP_ADMIN_PHONE=+2348036262488
```

### Backend (.env)
```
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secure-random-string"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."

# WhatsApp
WHATSAPP_ADMIN_PHONE="+2348036262488"

# App
PORT=3001
FRONTEND_URL="https://your-frontend.vercel.app"
```

---

## Troubleshooting

### Frontend Issues

- **404 on refresh**: Ensure `vercel.json` is configured correctly (already fixed with rewrites)
- **API not working**: Check if frontend is pointing to correct backend URL
- **Build failed**: Ensure all dependencies are in `package.json`

### Backend Issues

- **Missing runtime property**: Ensure `render.yaml` uses `runtime: node` (already fixed)
- **Database connection failed**: Verify `DATABASE_URL` is correct
- **CORS errors**: Update `FRONTEND_URL` in backend environment variables
- **Build failed**: Ensure all dependencies are in `backend/package.json`

---

## Project Structure

```
honey-gold-store/
├── src/                    # React + Vite app
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── ...
├── backend/                # Express + Prisma API
│   ├── src/
│   │   └── server.ts       # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── render.yaml         # Render Blueprint configuration
│   └── package.json
├── vercel.json             # Vercel configuration (SPA routing)
├── vite.config.ts          # Vite configuration
└── DEPLOYMENT.md           # This file
```

---

## Deployment Checklist

Before deploying, ensure:

- [ ] Frontend builds successfully: `npm run build`
- [ ] Backend builds successfully: `cd backend && npm run build`
- [ ] Prisma schema is ready: `cd backend && npx prisma generate`
- [ ] All environment variables are documented in `.env.example`
- [ ] No sensitive data in `.env` files (use `.gitignore`)
- [ ] Backend has health check endpoint at `/api/health`

---

## Quick Deployment Commands

```bash
# Build frontend
npm run build

# Test frontend locally
npm run preview

# Build backend
cd backend
npm run build

# Test backend locally
cd backend
npm run dev
```

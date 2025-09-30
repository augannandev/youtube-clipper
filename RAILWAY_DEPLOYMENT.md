# 🚂 Railway Deployment Guide

This guide will help you deploy the YouTube Clipper backend to Railway.app

## Prerequisites

- GitHub account with your code pushed
- Railway account (sign up at https://railway.app)

---

## 📋 Step-by-Step Deployment

### 1. **Sign Up & Connect GitHub**

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select the `youtube-clipper` repository

### 2. **Configure Backend Service**

1. Railway will auto-detect the Dockerfile
2. Click on the **backend** folder if needed
3. Set the **Root Directory** to: `/backend`

### 3. **Configure Environment Variables**

Click on **"Variables"** tab and add:

```
# Optional: Add if you need specific configurations
PYTHONUNBUFFERED=1
```

Railway will automatically set the `PORT` variable.

### 4. **Deploy**

1. Click **"Deploy"**
2. Wait 3-5 minutes for build to complete
3. Railway will provide you with a public URL like:
   ```
   https://your-app-name.up.railway.app
   ```

### 5. **Get Your Backend URL**

1. Click on your service
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://youtube-clipper-production.up.railway.app`)

### 6. **Test Your Deployment**

Open in browser:
```
https://your-railway-url.up.railway.app/health
```

You should see:
```json
{"status":"healthy","service":"youtube-clipper-api"}
```

---

## 💰 Pricing Estimate

**Railway Pricing:**
- First $5 of usage FREE each month
- After that: ~$0.000231/GB-hour for RAM
- For video processing: **~$10-15/month**

### Cost Optimization Tips:

1. **Scale down when idle**: Railway auto-sleeps inactive services
2. **Monitor usage**: Check Railway dashboard for costs
3. **Set spending limit**: Settings → Billing → Set limit to $20/month

---

## 🔧 Troubleshooting

### Build Fails:
- Check **"Deployments"** → **"Logs"** for errors
- Ensure `Dockerfile` is in `/backend` folder
- Verify all dependencies in `requirements.txt`

### Health Check Fails:
- Ensure `/health` endpoint returns 200 OK
- Check port configuration (Railway uses $PORT)

### Out of Memory:
- Increase RAM in Railway dashboard
- Optimize video processing settings

---

## 🌐 Next Steps: Connect Frontend (Vercel)

After backend is deployed:

1. Copy your Railway backend URL
2. Go to Vercel dashboard
3. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
4. Redeploy frontend

---

## 📊 Monitoring

**View Logs:**
```
Railway Dashboard → Your Service → Deployments → View Logs
```

**Check Metrics:**
```
Railway Dashboard → Your Service → Metrics
```

---

## 🚀 Auto-Deploy from GitHub

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway will detect the push and rebuild!

---

## 🛟 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/your-username/youtube-clipper/issues


# 🚀 Free Deployment Guide - RuralCare Connect

## **Deployment Architecture**
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free)
- **Database**: SQLite (File-based, included in backend)

---

## **Step 1: Prepare Your GitHub Repository**

```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## **Step 2: Deploy Backend to Render (FREE)**

### 2.1 Sign Up & Connect GitHub
1. Go to [render.com](https://render.com)
2. Click **Sign up** → Choose **GitHub**
3. Authorize Render to access your GitHub

### 2.2 Create Web Service
1. Dashboard → **New +** → **Web Service**
2. Select your GitHub repo `ruralcare-connect`
3. Click **Connect**

### 2.3 Configure Deployment
| Setting | Value |
|---------|-------|
| Name | `ruralcare-backend` |
| Environment | `Node` |
| Build Command | `cd server && npm install` |
| Start Command | `cd server && npm start` |
| Instance Type | **Free** ✅ |

### 2.4 Add Environment Variables
Click **Environment** and add:

```
FRONTEND_URL=https://ruralcare-connect.vercel.app
NODE_ENV=production
PORT=5000
```

### 2.5 Deploy
- Click **Create Web Service**
- Wait ~5 minutes for deployment
- Copy your URL: `https://ruralcare-xxxx.onrender.com`

**⚠️ Note**: Free tier spins down after 15 minutes of inactivity. First request takes ~30s to wake up.

---

## **Step 3: Deploy Frontend to Vercel (FREE)**

### 3.1 Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New**
3. Select your GitHub repo
4. Framework: `Vite`
5. Root Directory: `client`

### 3.2 Environment Variables
Add to **Environment Variables**:

```
VITE_API_URL=https://ruralcare-xxxx.onrender.com
```

Replace `ruralcare-xxxx.onrender.com` with your actual Render backend URL.

### 3.3 Deploy
- Click **Deploy**
- Wait ~2 minutes
- Your site: `https://ruralcare-connect.vercel.app`

---

## **Step 4: Verify Deployment**

### Test Backend
```
curl https://ruralcare-xxxx.onrender.com/api/health
```
Expected: `{"status":"ok","message":"Server is running"}`

### Test Frontend
Visit: `https://ruralcare-connect.vercel.app`

### Login with test credentials:
- **Email**: `patient@test.com`
- **Password**: `test123`

---

## **Step 5: Update CORS (if needed)**

If you get CORS errors:

1. Update `server/server.js` line 23 with your Vercel URL
2. Push changes: `git push origin main`
3. Render will auto-redeploy

---

## **Cost Breakdown** 💰

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Vercel Frontend** | ✅ Unlimited | **$0** |
| **Render Backend** | ✅ With limits | **$0** |
| **SQLite Database** | ✅ Included | **$0** |
| **Total Monthly** | | **$0** 🎉 |

---

## **Limitations & Upgrade Path**

### Free Tier Limitations:
- ⏱️ Backend sleeps after 15 min inactivity (first request: ~30s)
- 📊 Limited bandwidth
- No custom domain

### Upgrade Options (When needed):
- **Render**: $7/month (always-on)
- **Vercel**: Free stays free + Pro features
- **Save**: Keep everything free! 🎉

---

## **Troubleshooting**

### Backend won't start
```
Check Render logs: Dashboard → Web Service → Logs
```

### CORS errors
```
Make sure VITE_API_URL matches your Render URL
```

### Database errors
```
SQLite uses local file storage, auto-created on first run
```

---

## **Next Steps**

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Vercel
4. ✅ Test the application
5. ✅ Share your live URL!

Your app is now live! 🎉


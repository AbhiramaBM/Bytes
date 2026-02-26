# 🚀 Deploy RuralCare Connect - Step-by-Step

## **Deploy Backend to Render (5 minutes)**

### Step 1: Visit Render
Open: https://render.com

### Step 2: Sign Up with GitHub
- Click "Get Started"
- Choose "GitHub"
- Authorize and connect your account

### Step 3: Create Web Service
- Dashboard → **New +** → **Web Service**
- Find repo: `ruralcare-connect`
- Click **Connect**

### Step 4: Configure Service
Fill in these exact values:

```
Service Name:        ruralcare-backend
Runtime:             Node
Region:              (default - pick closest to you)
Branch:              main
Build Command:       npm install
Start Command:       npm start
Instance Type:       Free
```

### Step 5: Environment Variables
Click **Environment** tab and add:

```
FRONTEND_URL = https://your-app.vercel.app
NODE_ENV = production
PORT = 5000
```

(You'll update FRONTEND_URL after deploying to Vercel)

### Step 6: Deploy
Click **Create Web Service**

⏳ Wait 3-5 minutes...

✅ Copy your URL when it says "Service is live"
It will look like: `https://ruralcare-xxxx.onrender.com`

---

## **Deploy Frontend to Vercel (3 minutes)**

### Step 1: Visit Vercel
Open: https://vercel.com

### Step 2: Sign In with GitHub
Click "Continue with GitHub"

### Step 3: Import Project
- Click **Add New**
- Search for `ruralcare-connect`
- Click **Import**

### Step 4: Configure Build
```
Project Name:       ruralcare-connect
Framework Preset:   Vite
Root Directory:     client
```

Then click **Continue**

### Step 5: Environment Variables
Add this one variable:

```
VITE_API_BASE_URL = https://ruralcare-xxxx.onrender.com/api
```

(Replace `ruralcare-xxxx.onrender.com` with your actual Render URL from Step 6 above)

### Step 6: Deploy
Click **Deploy**

⏳ Wait 1-2 minutes...

✅ Copy your Vercel URL
It will look like: `https://ruralcare-xxxx.vercel.app`

---

## **Step 7: Update Backend CORS**

Now go back and update Render:

1. Go to your Render Dashboard
2. Select `ruralcare-backend`
3. Settings → Environment → Edit `FRONTEND_URL`
4. Change to: `https://your-vercel-url.vercel.app`
5. Click **Save**
6. Service auto-redeploys

---

## **Step 8: Test Your App**

### Test Backend Health
```
https://your-render-url.onrender.com/api/health
```

Should show: ✅ Running

### Test Frontend
```
https://your-vercel-url.vercel.app
```

### Login Test
```
Email:    patient@test.com
Password: test123
```

---

## **🎉 Done!**

Your app is now LIVE and COMPLETELY FREE!

**Frontend**: https://your-vercel-url.vercel.app
**Backend**: https://your-render-url.onrender.com

Share your frontend URL with anyone! 🚀

---

## **⚠️ Important Notes**

1. **First time loading**: May take 30 seconds (Render wakes up)
2. **CORS errors**: Make sure FRONTEND_URL matches your Vercel URL exactly
3. **Database**: Automatically created in SQLite (no setup needed)
4. **Free tier**: Backend may sleep after 15 min inactivity

---

**Need help? Check DEPLOYMENT_CHECKLIST.md for detailed checklist!**

# 🎯 Render Backend Deployment - Copy & Paste Steps

## STEP 1: Go to Render Dashboard
```
https://render.com/dashboard
```

## STEP 2: Create Web Service
- Click: **New +**
- Click: **Web Service**
- Find and select: **ruralcare-connect**
- Click: **Connect**

Wait for repo to load...

## STEP 3: Fill in Service Details

| Field | Value |
|-------|-------|
| **Name** | `ruralcare-backend` |
| **Environment** | `Node` |
| **Region** | `(default or closest)` |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

## STEP 4: Environment Variables
Click the **Environment** tab.

Add these 3 variables:
```
Key: FRONTEND_URL
Value: https://localhost:5173

Key: NODE_ENV  
Value: production

Key: PORT
Value: 5000
```

(You'll update FRONTEND_URL after Vercel deployment)

## STEP 5: Instance Type
Select: **Free** (if available)

## STEP 6: Deploy!
Click **Create Web Service**

⏳ Wait 3-5 minutes for deployment...

## STEP 7: Get Your URL
Once it says **"Live"**, copy your URL from the top:
```
https://ruralcare-XXXXX.onrender.com
```

✅ **Backend Deployed!**

---

# 📱 Vercel Frontend Deployment - Copy & Paste Steps

## STEP 1: Go to Vercel
```
https://vercel.com
```

## STEP 2: Add New Project
- Click: **Add New**
- Click: **Project**
- Find and select: **ruralcare-connect**
- Click: **Import**

## STEP 3: Configure Project

| Setting | Value |
|---------|-------|
| **Project Name** | `ruralcare-connect` |
| **Framework** | `Vite` |
| **Root Directory** | `client` |

Click **Continue**

## STEP 4: Environment Variables
Add one variable:
```
Name: VITE_API_BASE_URL
Value: https://ruralcare-XXXXX.onrender.com/api
```
(Use your Render URL from above)

Click **Deploy**

⏳ Wait 1-2 minutes...

## STEP 5: Get Your URL
Once green ✅, copy your Vercel URL:
```
https://ruralcare-XXXXX.vercel.app
```

✅ **Frontend Deployed!**

---

# 🔄 Final Step: Update Backend CORS

## Go Back to Render
1. Open: https://render.com/dashboard
2. Click: `ruralcare-backend`
3. Click: **Environment**
4. Find: `FRONTEND_URL`
5. Change value to: `https://ruralcare-XXXXX.vercel.app`
6. Click **Save**
7. Wait for auto-redeploy (~2 min)

✅ **CORS Updated!**

---

# ✅ Test Everything

## Test Backend
```
https://ruralcare-XXXXX.onrender.com/api/health
```
Should return: API is running

## Open Frontend
Open in browser:
```
https://ruralcare-XXXXX.vercel.app
```

## Test Login
```
Email: patient@test.com
Password: test123
```

---

# 🎉 YOU'RE LIVE!

Your app is now deployed for **FREE** 🚀

Share your URL:
```
https://ruralcare-XXXXX.vercel.app
```

Enjoy! 🎊

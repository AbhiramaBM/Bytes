# 📋 Deployment Checklist

## Before Deployment
- [ ] All code committed to GitHub (`git push origin main`)
- [ ] GitHub repository is public
- [ ] `.env.example` files exist in both `server/` and `client/`

## Backend (Render) - 5 minutes
1. [ ] Create Render account at [render.com](https://render.com)
2. [ ] Connect GitHub account
3. [ ] New Web Service → Select `ruralcare-connect` repo
4. [ ] Settings:
   - [ ] Name: `ruralcare-backend`
   - [ ] Build: `cd server && npm install`
   - [ ] Start: `cd server && npm start`
   - [ ] Instance: Free
5. [ ] Add Environment Variables:
   - [ ] `FRONTEND_URL=` (leave for later)
   - [ ] `NODE_ENV=production`
   - [ ] `PORT=5000`
6. [ ] Deploy → Copy URL (e.g., `https://ruralcare-xxxx.onrender.com`)
7. [ ] Test health: `curl YOUR_RENDER_URL/api/health`

## Frontend (Vercel) - 3 minutes
1. [ ] Go to [vercel.com](https://vercel.com)
2. [ ] Import project from GitHub
3. [ ] Settings:
   - [ ] Root Directory: `client`
   - [ ] Framework: `Vite`
4. [ ] Environment Variables:
   - [ ] `VITE_API_BASE_URL=YOUR_RENDER_URL/api`
5. [ ] Deploy
6. [ ] Copy your Vercel URL (e.g., `https://ruralcare-connect.vercel.app`)

## Update Backend CORS
1. [ ] Go back to Render dashboard
2. [ ] Edit environment variables:
   - [ ] `FRONTEND_URL=YOUR_VERCEL_URL`
3. [ ] Manual deploy to apply changes

## Final Testing
1. [ ] Visit your Vercel frontend URL
2. [ ] Login with credentials:
   - Email: `patient@test.com`
   - Password: `test123`
3. [ ] Test core features:
   - [ ] View appointments
   - [ ] Send messages
   - [ ] View health records

## Success! 🎉
Your app is now live for FREE!
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.onrender.com`
- Database: SQLite (local, auto-created)

---

## Important Notes
⚠️ **Render Free Tier**: Backend sleeps after 15 min of inactivity. First request takes ~30 seconds to wake up.

💡 **To keep it always-on**: Upgrade Render to Starter ($7/month)

✅ **Vercel Free**: Unlimited requests, perfect for frontend

📱 **Share your live URL**: `https://your-app.vercel.app`

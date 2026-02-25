# 🚀 Quick Reference Guide

## ⚡ 60-Second Startup

```bash
# 1. Navigate to project
cd ruralcare-connect

# 2. Install everything
npm run install-all

# 3. Start both services
npm run dev

# 4. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:5000/api/health
```

---

## 🔑 Instant Login Credentials

### Patient
```
Email: patient@test.com
Password: test123
```

### Doctor
```
Email: doctor@test.com
Password: test123
```

### Admin
```
Email: admin@test.com
Password: test123
```

---

## 📍 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Web Application |
| Backend API | http://localhost:5000 | API Endpoints |
| Health Check | http://localhost:5000/api/health | Verify Backend |
| Database | server/database/ruralcare.db | SQLite Data |

---

## 🛠️ Common Commands

```bash
# From root directory
npm run install-all       # Install all deps
npm run dev              # Run both services
npm run build            # Build for production

# From server/
cd server
npm run dev              # Start backend
npm start                # Production start

# From client/
cd ../client
npm run dev              # Start frontend
npm run build            # Build frontend
npm run preview          # Preview build
```

---

## 🐛 Quick Fixes

### Port Already in Use
```bash
# Change port in server/.env
PORT=5001
```

### Database Issues
```bash
rm -rf server/database/ruralcare.db
# Restart server to recreate
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### CORS Errors
```bash
# Update server/.env
CORS_ORIGIN=http://localhost:3000
```

---

## ✨ Key Features

### Patient Dashboard
- View appointments
- Book new appointments
- Download prescriptions
- Manage health records
- Set medicine reminders
- Emergency SOS button

### Doctor Dashboard
- View patient appointments
- Approve/reject appointments
- Add prescriptions
- Update patient records
- Message patients

### Admin Dashboard
- System statistics
- User management
- Analytics overview
- System health monitoring

---

## 📊 Project Statistics

- **Total Files**: 50+
- **Backend Routes**: 6 modules
- **Frontend Pages**: 12 pages
- **Database Tables**: 9 tables
- **API Endpoints**: 30+ endpoints
- **UI Components**: 8 reusable components

---

## 📁 Key Directories

```
client/src/
├── pages/        # 12 page components
├── components/   # 4 reusable components
└── context/      # Auth management

server/
├── controllers/  # 6 business logic modules
├── routes/       # 6 API route groups
└── config/       # Database setup
```

---

## 🔒 Security Features

✅ Password hashing (bcryptjs)
✅ JWT authentication
✅ Role-based access control
✅ Protected routes
✅ Input validation
✅ CORS enabled
✅ Error boundaries

---

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🎨 Tech Stack Summary

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Axios
- React Router
- Context API

**Backend**
- Express.js
- Node.js
- SQLite
- JWT
- bcryptjs

---

## ✅ Verification Checklist

- [ ] Node.js installed
- [ ] npm installed
- [ ] Dependencies installed
- [ ] .env files configured
- [ ] Backend running on 5000
- [ ] Frontend running on 5173
- [ ] Database created
- [ ] Can login with demo credentials
- [ ] Dashboard loads
- [ ] Can book appointments
- [ ] Can view doctors

---

## 💡 Development Tips

1. **Hot Reload**: Changes auto-reload in both dev servers
2. **DevTools**: Use browser DevTools to inspect API calls
3. **Database**: Use DB Browser for SQLite to inspect data
4. **Console**: Check terminal logs for errors
5. **Local Storage**: Check browser Storage tab for token

---

## 📚 Documentation Files

- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `PROJECT_STRUCTURE.md` - Architecture overview

---

## 🎯 Next Steps After Setup

1. ✅ Register new account or login
2. ✅ Explore patient dashboard
3. ✅ Book an appointment
4. ✅ View doctors and clinics
5. ✅ Test different user roles
6. ✅ Customize colors/branding
7. ✅ Deploy to production

---

## 📞 Troubleshooting Commands

```bash
# Check Node version
node --version

# Check npm
npm --version

# Check if ports are open
lsof -i :5000      # Backend
lsof -i :5173      # Frontend

# Verify backend is running
curl http://localhost:5000/api/health

# Clear npm cache
npm cache clean --force

# List installed packages
npm list
```

---

## 🌟 Advanced Features

- Medicine reminder notifications
- Emergency SOS with geolocation
- Doctor search by specialization
- Clinic location search
- Health records management
- Secure messaging between users
- Admin analytics dashboard

---

## 📈 Scalability Ready

- Modular architecture
- Database indexing support
- API rate limiting ready
- Caching strategies
- Load balancing compatible
- Cloud deployment ready

---

Last Updated: February 25, 2026
🏥 **RuralCare Connect** - Healthcare for Everyone!

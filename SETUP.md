# 🏥 RuralCare Connect - Complete Setup Guide

## 📋 Project Overview

**RuralCare Connect** is a full-stack healthcare web application designed to improve access to primary healthcare in semi-urban and rural regions. It features a modern, responsive interface with complete patient, doctor, and admin functionality.

---

## ✅ Quick Start (5 minutes)

### 1. Navigate to Project
```bash
cd ruralcare-connect
```

### 2. Install All Dependencies
```bash
npm run install-all
```

### 3. Start Both Services
```bash
npm run dev
```

> The application will start with:
> - **Frontend**: http://localhost:5173
> - **Backend**: http://localhost:5000

---

## 🚀 Detailed Setup Instructions

### Prerequisites
- ✅ Node.js v16 or higher
- ✅ npm or yarn
- ✅ Git
- ✅ A modern web browser

### Verify Installation
```bash
node --version  # Should be v16+
npm --version   # Should be v8+
```

---

## 📦 Step-by-Step Installation

### Step 1: Install Backend Dependencies
```bash
cd server
npm install
```

**Expected packages:**
- express
- sqlite3
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- express-validator
- uuid
- nodemon (dev)

### Step 2: Install Frontend Dependencies
```bash
cd ../client
npm install
```

**Expected packages:**
- react
- react-dom
- react-router-dom
- axios
- lucide-react
- @vitejs/plugin-react
- vite
- tailwindcss
- postcss
- autoprefixer

### Step 3: Verify Installations
```bash
# Back to root
cd ..

# Test backend
cd server && npm list

# Test frontend
cd ../client && npm list
```

---

## 🔧 Configuration

### Server Configuration (.env)
```bash
# Already created at: server/.env
# File contents:
PORT=5000
NODE_ENV=development
JWT_SECRET=ruralcare_secret_key_2026_change_in_production
DB_PATH=./database/ruralcare.db
CORS_ORIGIN=http://localhost:5173
```

**To modify:**
```bash
# Edit the file
nano server/.env
# or
code server/.env  # VS Code
```

### Client Configuration (.env)
```bash
# Already created at: client/.env
# File contents:
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🎯 Running the Application

### Option 1: Run Both Simultaneously (Recommended)
```bash
# From root directory
npm run dev
```

This runs backend and frontend in parallel.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
🏥 RuralCare Connect Server running on port 5000
📍 API Base URL: http://localhost:5000/api
🌐 CORS Origin: http://localhost:5173
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

You should see:
```
VITE v5.0.0 ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Option 3: Production Build
```bash
# Build frontend
cd client
npm run build

# Output in: client/dist/

# Start backend with build
cd ../server
npm start
```

---

## 🔐 Demo Credentials

### Access the Application
- **URL**: http://localhost:5173

### Test Accounts

#### 1. Patient Account
```
Email: patient@test.com
Password: test123
Role: Patient
```

#### 2. Doctor Account
```
Email: doctor@test.com
Password: test123
Role: Doctor
```

#### 3. Admin Account
```
Email: admin@test.com
Password: test123
Role: Admin
```

---

## 📱 Feature Overview by Role

### Patient Features
✅ Dashboard with statistics
✅ Browse and book appointments
✅ View all doctors
✅ Find nearby clinics
✅ Manage health records
✅ View prescriptions
✅ Set medicine reminders
✅ Emergency SOS
✅ Chat with doctors
✅ Update profile

### Doctor Features
✅ Dashboard with appointment stats
✅ View upcoming appointments
✅ Approve/reject appointments
✅ Add prescriptions
✅ Update patient records
✅ Chat with patients
✅ Manage profile

### Admin Features
✅ Admin dashboard
✅ View system statistics
✅ Manage users
✅ Monitor appointments
✅ System analytics
✅ User management

---

## 🌐 API Testing

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "RuralCare Connect Server is running ✅"
}
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "test123"
  }'
```

---

## 📁 Project Structure

```
ruralcare-connect/
│
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, UI components
│   │   ├── pages/           # All page components
│   │   ├── context/         # Auth context
│   │   ├── hooks/           # useAuth hook
│   │   ├── utils/           # API client, Protected routes
│   │   ├── App.jsx          # Main routing
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env
│
├── server/                    # Express Backend
│   ├── controllers/          # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, error handling
│   ├── config/              # Database setup
│   ├── utils/               # Helper functions
│   ├── server.js            # Main server file
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
├── package.json             # Root package
├── README.md               # Main documentation
├── SETUP.md               # This file
└── .gitignore
```

---

## 🐛 Troubleshooting

### Issue: Port Already in Use
```bash
# Check what's using port 5000
lsof -i :5000

# Kill process (if needed)
kill -9 <PID>

# Or change port in server/.env
PORT=5001
```

### Issue: npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock files
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Database Issues
```bash
# Delete old database
rm -rf server/database/ruralcare.db

# Restart server (new database created automatically)
```

### Issue: CORS Errors
```bash
# Update in server/.env
CORS_ORIGIN=http://localhost:3000
# or whatever your frontend port is
```

### Issue: Cannot connect to API
```bash
# Ensure both services are running
# Check if backend is running: http://localhost:5000/api/health

# If errors, check:
# 1. .env files are properly configured
# 2. Port 5000 and 5173 are available
# 3. No firewall blocking
```

---

## 📊 Database

### Auto-Seeded Data
On first run, the database is automatically populated with:
- 2 sample users (patient, doctor)
- 1 admin user
- 2 sample clinics
- 1 sample doctor

### Database Location
```
server/database/ruralcare.db
```

### Database Reset
```bash
rm -rf server/database/ruralcare.db
# Restart server to recreate
```

---

## 🔒 Security Notes

⚠️ **Important for Production:**

1. **Change JWT Secret**
```bash
# In server/.env, replace:
JWT_SECRET=your_strong_secret_key_here
```

2. **Use Environment Variables**
```bash
# Never commit .env files
# Use .env.example as template
```

3. **Enable HTTPS**
```bash
# Use reverse proxy (Nginx, Apache)
# Or cloud services (Heroku, Vercel)
```

4. **Database**
```bash
# Regular backups
# No sensitive data in plain text
```

---

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Doctor Endpoints
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/appointments/list` - Doctor's appointments
- `PUT /api/doctors/appointments/:id/status` - Update appointment
- `POST /api/doctors/prescriptions` - Add prescription

### Patient Endpoints
- `POST /api/patients/appointments` - Book appointment
- `GET /api/patients/appointments` - Get appointments
- `GET /api/patients/prescriptions` - Get prescriptions
- `GET /api/patients/health-records` - Get health records
- `POST /api/patients/medicine-reminders` - Add reminder
- `POST /api/patients/emergency-sos` - Emergency request

### admin Endpoints
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/analytics` - Analytics

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
# Build
npm run build

# Output directory: client/dist/
# Deploy using CLI or git
```

### Backend Deployment (Render/Railway)
```bash
# Add Procfile (for Heroku-like platforms)
# Process: web: npm start

# Deploy with git or CLI
```

---

## 📝 Common Commands

```bash
# Root commands
npm run install-all      # Install all dependencies
npm run dev             # Run both services
npm run build           # Build frontend

# Backend commands (from server/)
npm run dev             # Start with nodemon
npm start               # Start server

# Frontend commands (from client/)
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
```

---

## 💡 Tips & Tricks

1. **Hot Reload**: Both dev servers support hot reload - changes reflect instantly

2. **Debug API**: Use browser DevTools Network tab to inspect API calls

3. **Inspect Database**: Install DB Browser for SQLite to inspect database

4. **Check Logs**: Both servers log important information to console

5. **Mobile Testing**: Use responsive design mode in DevTools

---

## 📞 Support & Help

### Verify Everything Works
1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:5173
3. ✅ Can login with test credentials
4. ✅ Can view dashboard
5. ✅ Database file exists at `server/database/ruralcare.db`

### Getting Help
- Check error messages in terminal
- Review README.md for documentation
- Check API endpoint responses in browser DevTools
- Verify all files are in correct locations

---

## 🎉 You're Ready!

Your **RuralCare Connect** healthcare application is now ready to use! 

**Next Steps:**
1. Open http://localhost:5173 in your browser
2. Login with demo credentials
3. Explore the application
4. Customize and extend as needed

---

## 🙏 Thank You!

**RuralCare Connect** - Bringing Quality Healthcare to Every Corner! 🏥❤️

Built to improve healthcare accessibility in rural communities.

Last Updated: February 25, 2026

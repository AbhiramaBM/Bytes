# 🏗️ Complete Project Structure

## Directory Tree

```
ruralcare-connect/
│
├── 📁 client/                              # React Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/                  # Reusable UI Components
│   │   │   ├── Navbar.jsx                 # Navigation bar with auth
│   │   │   ├── Footer.jsx                 # Footer component
│   │   │   ├── Sidebar.jsx                # Dashboard sidebar
│   │   │   └── UI.jsx                     # Reusable UI elements
│   │   │
│   │   ├── 📁 pages/                       # Page Components
│   │   │   ├── HomePage.jsx               # Landing page
│   │   │   ├── LoginPage.jsx              # User login
│   │   │   ├── RegisterPage.jsx           # User registration
│   │   │   ├── PatientDashboard.jsx       # Patient home
│   │   │   ├── DoctorDashboard.jsx        # Doctor home
│   │   │   ├── AdminDashboard.jsx         # Admin home
│   │   │   ├── BookAppointmentPage.jsx    # Appointment booking
│   │   │   ├── ViewDoctorsPage.jsx        # Doctor listing
│   │   │   ├── ViewClinicsPage.jsx        # Clinic listing
│   │   │   ├── ProfilePage.jsx            # User profile
│   │   │   ├── AppointmentsPage.jsx       # Appointment history
│   │   │   ├── PrescriptionsPage.jsx      # Prescriptions
│   │   │   ├── HealthRecordsPage.jsx      # Health records
│   │   │   ├── MedicineRemindersPage.jsx  # Medicine reminders
│   │   │   └── ChatPage.jsx               # Doctor chat
│   │   │
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx            # Authentication context
│   │   │
│   │   ├── 📁 hooks/
│   │   │   └── useAuth.js                 # Auth hook
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── apiClient.js               # Axios instance
│   │   │   └── ProtectedRoute.jsx         # Route protection
│   │   │
│   │   ├── App.jsx                        # Main app component
│   │   ├── main.jsx                       # React entry point
│   │   └── index.css                      # Global styles
│   │
│   ├── index.html                         # HTML template
│   ├── vite.config.js                     # Vite configuration
│   ├── tailwind.config.js                 # Tailwind config
│   ├── postcss.config.js                  # PostCSS config
│   ├── .env                               # Environment variables
│   ├── .env.example                       # Env template
│   ├── .gitignore                         # Git ignore
│   └── package.json                       # Dependencies
│
├── 📁 server/                              # Express Backend Application
│   ├── 📁 controllers/                     # Business Logic Layer
│   │   ├── authController.js              # Auth logic
│   │   ├── doctorController.js            # Doctor operations
│   │   ├── clinicController.js            # Clinic operations
│   │   ├── patientController.js           # Patient operations
│   │   ├── messageController.js           # Messaging logic
│   │   └── adminController.js             # Admin operations
│   │
│   ├── 📁 routes/                         # API Routes
│   │   ├── authRoutes.js                  # Auth endpoints
│   │   ├── doctorRoutes.js                # Doctor endpoints
│   │   ├── clinicRoutes.js                # Clinic endpoints
│   │   ├── patientRoutes.js               # Patient endpoints
│   │   ├── messageRoutes.js               # Message endpoints
│   │   └── adminRoutes.js                 # Admin endpoints
│   │
│   ├── 📁 middleware/
│   │   ├── auth.js                        # JWT authentication
│   │   └── errorHandler.js                # Error handling
│   │
│   ├── 📁 config/
│   │   └── database.js                    # SQLite setup & schema
│   │
│   ├── 📁 utils/
│   │   ├── tokenUtils.js                  # JWT utilities
│   │   ├── responseHandler.js             # Response formatting
│   │   └── seedData.js                    # Sample data
│   │
│   ├── server.js                          # Main server file
│   ├── .env                               # Environment variables
│   ├── .env.example                       # Env template
│   ├── .gitignore                         # Git ignore
│   └── package.json                       # Dependencies
│
├── 📄 package.json                        # Root package
├── 📄 README.md                           # Main documentation
├── 📄 SETUP.md                            # Setup guide
├── 📄 PROJECT_STRUCTURE.md                # This file
└── 📄 .gitignore                          # Git ignore
```

---

## 📝 File Descriptions

### Client (Frontend)

#### Components
- **Navbar.jsx**: Navigation bar with responsive mobile menu
- **Footer.jsx**: Footer with contact info and links
- **Sidebar.jsx**: Dashboard sidebar with menu items
- **UI.jsx**: Reusable components (Button, Input, Card, etc.)

#### Pages
- **HomePage.jsx**: Landing page with hero, features, stats
- **LoginPage.jsx**: User login with demo credentials
- **RegisterPage.jsx**: User registration form
- **PatientDashboard.jsx**: Stats and recent appointments
- **DoctorDashboard.jsx**: Manage appointments, add prescriptions
- **AdminDashboard.jsx**: System stats and user management
- **BookAppointmentPage.jsx**: Appointment booking form
- **ViewDoctorsPage.jsx**: Doctor search and filtering
- **ViewClinicsPage.jsx**: Clinic search by location
- **ProfilePage.jsx**: User profile editing
- **AppointmentsPage.jsx**: Appointment history and management
- **PrescriptionsPage.jsx**: Prescription viewing and download
- **HealthRecordsPage.jsx**: Health information management
- **MedicineRemindersPage.jsx**: Medication reminder setup
- **ChatPage.jsx**: Doctor-patient messaging

#### Context & Hooks
- **AuthContext.jsx**: Global authentication state
- **useAuth.js**: Hook to access auth context

#### Utils
- **apiClient.js**: Configured Axios instance with interceptors
- **ProtectedRoute.jsx**: Route protection component

### Server (Backend)

#### Controllers
- **authController.js**: Registration, login, profile management
- **doctorController.js**: Appointment and prescription management
- **clinicController.js**: Clinic information retrieval
- **patientController.js**: Patient operations and health data
- **messageController.js**: Patient-doctor messaging
- **adminController.js**: Admin dashboard and analytics

#### Routes
- **authRoutes.js**: `/api/auth/*`
- **doctorRoutes.js**: `/api/doctors/*`
- **clinicRoutes.js**: `/api/clinics/*`
- **patientRoutes.js**: `/api/patients/*`
- **messageRoutes.js**: `/api/messages/*`
- **adminRoutes.js**: `/api/admin/*`

#### Middleware
- **auth.js**: JWT verification and role-based access
- **errorHandler.js**: Global error handling

#### Config & Utils
- **database.js**: SQLite schema and initialization
- **tokenUtils.js**: JWT creation and verification
- **responseHandler.js**: Standard response formatting
- **seedData.js**: Sample data for testing

---

## 📦 Database Schema

### Tables

#### 1. users
```sql
- id (PK)
- email (UNIQUE)
- password (hashed)
- fullName
- phone
- role (patient, doctor, admin)
- age
- gender
- address
- city
- state
- pincode
- createdAt
- updatedAt
```

#### 2. doctors
```sql
- id (PK)
- userId (FK)
- specialization
- registration
- experience
- clinicId (FK)
- consultationFee
- availability
- bio
- imageUrl
- rating
- createdAt
```

#### 3. clinics
```sql
- id (PK)
- name
- address
- city
- state
- pincode
- phone
- email
- lat, lng
- operatingHours
- services
- createdAt
```

#### 4. appointments
```sql
- id (PK)
- patientId (FK)
- doctorId (FK)
- clinicId (FK)
- appointmentDate
- appointmentTime
- status
- reason
- notes
- consultationType
- createdAt, updatedAt
```

#### 5. prescriptions
```sql
- id (PK)
- appointmentId (FK)
- doctorId (FK)
- patientId (FK)
- medicines
- dosage
- duration
- instructions
- createdAt
```

#### 6. healthRecords
```sql
- id (PK)
- patientId (FK)
- recordType
- bloodType
- allergies
- chronicDiseases
- surgicalHistory
- currentMedications
- familyHistory
- height, weight
- bloodPressure
- notes
- updatedAt
```

#### 7. messages
```sql
- id (PK)
- senderId (FK)
- receiverId (FK)
- message
- isRead
- createdAt
```

#### 8. emergencyRequests
```sql
- id (PK)
- patientId (FK)
- clinicId (FK)
- description
- location
- lat, lng
- status
- createdAt, updatedAt
```

#### 9. medicineReminders
```sql
- id (PK)
- patientId (FK)
- medicineName
- dosage
- frequency
- time
- daysOfWeek
- active
- createdAt
```

---

## 🔄 Data Flow

### User Registration Flow
```
Register Form
    ↓
Input Validation
    ↓
Hash Password (bcryptjs)
    ↓
Save to Users Table
    ↓
Generate JWT Token
    ↓
Store Token in LocalStorage
    ↓
Redirect to Dashboard
```

### Appointment Booking Flow
```
Book Appointment Form
    ↓
Select Doctor & Date
    ↓
Create Appointment Record
    ↓
Set Status: Pending
    ↓
Doctor Reviews
    ↓
Doctor Approves/Rejects
    ↓
Patient Notified
```

### Prescription Flow
```
Doctor Views Appointment
    ↓
Doctor Adds Prescription
    ↓
Save to Prescriptions Table
    ↓
Link to Appointment & Patient
    ↓
Patient Can View/Download
```

---

## 🔐 Authentication Flow

```
Client                    Server
  │                        │
  ├─── Login Form ────────→│
  │                        │
  │                ← Query Users Table
  │                        │
  │             Compare Password Hash
  │                        │
  │    ← Generate JWT Token
  │                        │
  │    ← Store in LocalStorage
  │                        │
  │     Add to Headers ────→│
  │                        │
  │     Verify JWT ────────→│
  │                        │
  │    ← Protected Content
  │                        │
```

---

## 🎨 Styling System

### Colors
- **Primary**: #0066CC (Blue)
- **Secondary**: #00B4D8 (Cyan)
- **Success**: #00A651 (Green)
- **Danger**: #DC2626 (Red)
- **Warning**: #F59E0B (Orange)

### Typography
- **Font**: Inter
- **Body**: 16px
- **Headings**: 24px - 48px
- **Small**: 12px - 14px

### Spacing
- **Padding**: 4px, 8px, 16px, 24px, 32px
- **Margin**: 8px, 16px, 24px, 32px, 48px
- **Gap**: 8px, 12px, 16px, 24px

---

## 🚀 Performance Optimizations

✅ Component-level code splitting
✅ Lazy loading components
✅ Image optimization
✅ Efficient API caching
✅ Database indexing
✅ Debounced search
✅ Optimized re-renders

---

## 📖 Development Workflow

1. **Frontend Development**
   - Edit in `client/src/`
   - Hot reload on save
   - Use browser DevTools

2. **Backend Development**
   - Edit in `server/`
   - Nodemon restarts on save
   - Check console for logs

3. **Testing**
   - Use demo credentials
   - Test all user roles
   - Check API responses

4. **Deployment**
   - Build frontend: `npm run build`
   - Deploy client build
   - Deploy server separately

---

## 📞 Support

For questions or issues:
1. Check README.md
2. Review SETUP.md
3. Check console logs
4. Verify API responses in DevTools

---

**Last Updated**: February 25, 2026

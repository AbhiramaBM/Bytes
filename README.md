# 🏥 RuralCare Connect

#Problem statement ID:
PS01SW

# 🏥 RuralCare – AI-Enabled Primary Healthcare Access System

## 📌 Problem Statement

Access to primary healthcare in semi-urban and rural regions is limited due to:

* Doctor shortages
* Long travel distances
* Poor digital infrastructure
* Manual record-keeping systems
* Lack of early health guidance

This leads to delayed treatment and poor health awareness.

---

# 💡 Proposed Solution

RuralCare is a digital healthcare platform designed to simplify access to primary healthcare services.

The system allows:

# 👨‍⚕️ Patients

* Book appointments
* View available doctors
* Receive digital prescriptions
* Store medical history
* Chat with AI for basic health guidance

# 🩺 Doctors

* Manage appointments
* Provide digital prescriptions
* View patient history

# 🛠 Admin

* Add and manage doctors
* Manage clinics
* Monitor system activity

---

# 🤖 AI Chatbox Feature

Integrated AI Health Assistant provides:

* Basic symptom guidance
* First-level health advice
* Health awareness support

⚠️ Note: AI guidance is not a replacement for professional medical consultation.

---

# file structure 
ruralcare-connect/
│
├── client/                     # Frontend (React + Vite)
│   ├── public/                 # Static assets
│   ├── src/                    # React source code
│   ├── node_modules/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env
│   └── .env.example
│
├── server/                     # Backend (Node.js + Express)
│   ├── config/                 # Configuration files
│   ├── controllers/            # Route controllers
│   ├── database/               # SQLite DB & connection
│   ├── middleware/             # Custom middleware
│   ├── models/                 # Data models
│   ├── routes/                 # API routes
│   ├── utils/                  # Utility functions
│   ├── node_modules/
│   ├── server.js               # Main server file
│   ├── migrate.js              # Database migration script
│   ├── .env
│   ├── .env.example
│   ├── crash.log
│   ├── table_info.txt
│   └── table_info_clean.txt
│
├── node_modules/
├── package.json
├── package-lock.json
│
├── README.md
├── SETUP.md
├── PROJECT_STRUCTURE.md
├── QUICK_START.md
├── COMPLETE_GUIDE.md
├── ADMIN_LOGIN_GUIDE.md
├── FINAL_STATUS_REPORT.md
├── FIXES_SUMMARY.md
└── .gitignore

--- 
# 🏗 Tech Stack

## Frontend

* React.js
* HTML
* CSS
* JavaScript

## Backend

* Node.js
* Express.js

# Database

* SQLite (Lightweight file-based database)

## Architecture

React → Express API → SQLite Database → AI Module

---

# ⚙️ Installation & Setup (Local)

### 1️⃣ Clone Repository

```bash
git clone <your-repository-link>
cd RuralCare
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```


### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

http://localhost:5173/

---

## 📊 System Features

* Role-based dashboard (Admin / Doctor / Patient)
* Appointment management
* Digital prescription system
* Secure data storage
* AI health guidance
* Lightweight and rural-friendly design

---

## 🎯 Target Users

* Rural communities
* Elderly individuals
* Low-income families
* Local clinics

---


# 👥 Team name : bytes

#Members

* Prajna Rajendra bhat
*spoorthi p
*abhirama BM
*Ashwath NS
RuralCare Connect is a digital healthcare platform that connects patients in rural and semi-urban areas with doctors through appointment booking, teleconsultation, and digital medical records management.




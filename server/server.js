import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';
import { initDB } from './config/db.js';
import { startReminderScheduler } from './services/reminderScheduler.js';

import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      process.env.FRONTEND_URL,
      'https://ruralcare-connect.vercel.app'
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve('server', 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'RuralCare Connect API',
    version: '1.0.0',
    status: 'running ✅',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      doctors: '/api/doctors',
      clinics: '/api/clinics',
      patients: '/api/patients',
      messages: '/api/messages',
      admin: '/api/admin',
      ai: '/api/ai',
      payments: '/api/payments'
    }
  });
});

// Routes (setup before starting server)
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'RuralCare Connect Server is running' });
});

// Error handling
app.use(errorHandler);

// Initialize MongoDB then start server
const startServer = async () => {
  try {
    console.log('Initializing MongoDB...');
    await initDB();
    console.log('MongoDB Connected successfully');

    app.listen(PORT, () => {
      console.log(`RuralCare Connect Server running on port ${PORT}`);
      startReminderScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

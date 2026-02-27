import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './utils/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointmentPage from './pages/BookAppointmentPage';
import ViewDoctorsPage from './pages/ViewDoctorsPage';
import ViewClinicsPage from './pages/ViewClinicsPage';
import ProfilePage from './pages/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import HealthRecordsPage from './pages/HealthRecordsPage';
import MedicineRemindersPage from './pages/MedicineRemindersPage';
import ChatPage from './pages/ChatPage';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorDescription from './pages/DoctorDescription';
import DoctorMessages from './pages/DoctorMessages';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminClinics from './pages/AdminClinics';
import AdminAddDoctor from './pages/AdminAddDoctor';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminAppointments from './pages/AdminAppointments';
import DoctorPrescription from './pages/DoctorPrescription';
import MedicalHistoryPage from './pages/MedicalHistoryPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/book-appointment" element={<ProtectedRoute requiredRole="patient"><BookAppointmentPage /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute requiredRole="patient"><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute requiredRole="patient"><PrescriptionsPage /></ProtectedRoute>} />
          <Route path="/patient/health-records" element={<ProtectedRoute requiredRole="patient"><HealthRecordsPage /></ProtectedRoute>} />
          <Route path="/patient/medicine-reminders" element={<ProtectedRoute requiredRole="patient"><MedicineRemindersPage /></ProtectedRoute>} />
          <Route path="/patient/ai-chat" element={<ProtectedRoute requiredRole="patient"><ChatPage /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute requiredRole="patient"><ProfilePage /></ProtectedRoute>} />
          <Route path="/patient/medical-history" element={<ProtectedRoute requiredRole="patient"><MedicalHistoryPage /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute requiredRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/description" element={<ProtectedRoute requiredRole="doctor"><DoctorDescription /></ProtectedRoute>} />
          <Route path="/doctor/messages" element={<ProtectedRoute requiredRole="doctor"><DoctorMessages /></ProtectedRoute>} />
          <Route path="/doctor/prescription/:appointmentId" element={<ProtectedRoute requiredRole="doctor"><DoctorPrescription /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/add-doctor" element={<ProtectedRoute requiredRole="admin"><AdminAddDoctor /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute requiredRole="admin"><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute requiredRole="admin"><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute requiredRole="admin"><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/clinics" element={<ProtectedRoute requiredRole="admin"><AdminClinics /></ProtectedRoute>} />

          {/* Public Routes */}
          <Route path="/doctors" element={<ViewDoctorsPage />} />
          <Route path="/clinics" element={<ViewClinicsPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Appointment from '../models/Appointment.js';

export const seedDatabase = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already seeded. Skipping seed data insertion.');
      return;
    }

    const hashedPassword = await bcryptjs.hash('test123', 10);

    const patient = await User.create({ email: 'patient@test.com', password: hashedPassword, fullName: 'John Patient', phone: '9876543210', role: 'patient' });
    const doctor = await User.create({ email: 'doctor@test.com', password: hashedPassword, fullName: 'Dr. Sarah Smith', phone: '9876543211', role: 'doctor' });
    const admin = await User.create({ email: 'admin@test.com', password: hashedPassword, fullName: 'Admin User', phone: '9876543212', role: 'admin' });

    const clinic1 = await Clinic.create({ name: 'City Medical Center', address: '123 Health Street', city: 'Mumbai', state: 'Maharashtra', phone: '9999999999', email: 'contact@citymedical.com' });
    const clinic2 = await Clinic.create({ name: 'Rural Health Clinic', address: '456 Village Road', city: 'Pune', state: 'Maharashtra', phone: '9888888888', email: 'contact@ruralhealthclinic.com' });

    await Appointment.create({ patientId: patient._id, doctorId: doctor._id, clinicId: clinic1._id, appointmentDate: '2026-03-01', appointmentTime: '10:00', status: 'pending' });

    console.log('✅ MongoDB seeded with sample data');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';
import { Link } from 'react-router-dom';

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get('/patients/appointments');
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await apiClient.delete(`/patients/appointments/${appointmentId}`);
        fetchAppointments();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel appointment');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold">My Appointments</h1>
              <Link to="/patient/book-appointment">
                <Button variant="primary">Book New</Button>
              </Link>
            </div>

            {appointments.length > 0 ? (
              <div className="grid gap-6">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-lg">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <User size={24} className="text-blue-600" />
                          <div>
                            <p className="text-gray-600 text-sm">Doctor</p>
                            <p className="font-bold text-lg">{appointment.doctorName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-gray-600 text-sm">{appointment.specialization}</span>
                        </div>

                        {appointment.clinicName && (
                          <p className="text-gray-600 text-sm mb-4">Clinic: {appointment.clinicName}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Calendar size={24} className="text-green-600" />
                          <div>
                            <p className="text-gray-600 text-sm">Date</p>
                            <p className="font-bold">{appointment.appointmentDate}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <Clock size={24} className="text-purple-600" />
                          <div>
                            <p className="text-gray-600 text-sm">Time</p>
                            <p className="font-bold">{appointment.appointmentTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4 flex justify-between items-center">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status.toUpperCase()}
                      </span>

                      <div className="flex gap-2">
                        {appointment.status !== 'cancelled' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button variant="secondary" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No appointments booked yet</p>
                <Link to="/patient/book-appointment">
                  <Button variant="primary">Book Your First Appointment</Button>
                </Link>
              </Card>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default AppointmentsPage;

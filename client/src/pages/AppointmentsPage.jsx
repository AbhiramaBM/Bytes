import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
        <Link to="/patient/book-appointment">
          <Button variant="primary" className="font-bold">Book New</Button>
        </Link>
      </div>

      {appointments.length > 0 ? (
        <div className="grid gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <div className="grid md:grid-cols-2 gap-8 p-2">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Consulting Doctor</p>
                      <p className="font-bold text-xl text-gray-900">{appointment.doctorName}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-blue-600 text-sm font-bold bg-blue-50 inline-block px-3 py-1 rounded-full">{appointment.specialization}</p>
                    {appointment.clinicName && (
                      <p className="text-gray-600 text-sm"><span className="font-medium">Clinic:</span> {appointment.clinicName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-xl">
                      <Calendar size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Scheduled Date</p>
                      <p className="font-bold text-lg text-gray-900">{appointment.appointmentDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <Clock size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Preferred Time</p>
                      <p className="font-bold text-lg text-gray-900">{appointment.appointmentTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mt-6 flex justify-between items-center">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                  }`}>
                  {appointment.status}
                </span>

                <div className="flex gap-3">
                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(appointment.id)}
                      className="font-bold px-5"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" className="font-bold px-5">
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-20 bg-gray-50/50 border-dashed border-2">
          <Calendar size={64} className="mx-auto text-gray-300 mb-6" />
          <p className="text-gray-600 text-xl font-medium mb-6">No appointments booked yet</p>
          <Link to="/patient/book-appointment">
            <Button variant="primary" className="font-bold py-3 px-8">Schedule Your First Visit</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default AppointmentsPage;

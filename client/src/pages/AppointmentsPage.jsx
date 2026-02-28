import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video } from 'lucide-react';
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

  const handleJoinVideo = async (appointmentId) => {
    try {
      const res = await apiClient.get(`/patients/appointments/${appointmentId}/video-room`);
      const url = res.data?.data?.roomUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join video room');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 font-display">My Appointments</h1>
          <p className="text-gray-500 mt-1">Manage and track your medical consultations</p>
        </div>
        <Link to="/patient/book-appointment">
          <Button variant="primary" size="sm" className="font-bold btn-premium shadow-lg shadow-blue-100">Book New Appointment</Button>
        </Link>
      </div>

      {appointments.length > 0 ? (
        <div className="grid gap-8">
          {appointments.map((appointment) => (
            <Card key={appointment._id} className="hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden shadow-lg group">
              <div className="grid md:grid-cols-2 gap-8 p-4">
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <User size={32} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Consulting Specialist</p>
                      <p className="font-bold text-2xl text-gray-900 leading-tight">
                        {appointment.doctorName || 'Healthcare Provider'}
                      </p>
                      <p className="text-primary font-semibold text-sm mt-1 inline-block bg-primary/5 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {appointment.specialization || 'General Consultation'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                    <p className="text-gray-700 font-medium">
                      <span className="text-gray-400 text-sm font-bold mr-2">LOCATION:</span>
                      {appointment.clinicName || 'Main Clinic'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 group-hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-2 text-primary mb-3">
                      <Calendar size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Date</span>
                    </div>
                    <p className="font-bold text-lg text-gray-900">{appointment.appointmentDate}</p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 group-hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-2 text-primary mb-3">
                      <Clock size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Time</span>
                    </div>
                    <p className="font-bold text-lg text-gray-900">{appointment.appointmentTime}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${appointment.status === 'pending' || appointment.status === 'booked' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    appointment.status === 'approved' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      appointment.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-gray-200 text-gray-800'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${appointment.status === 'pending' || appointment.status === 'booked' ? 'bg-amber-500' :
                      appointment.status === 'approved' ? 'bg-blue-500' :
                        appointment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    {appointment.status}
                  </span>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  {['approved', 'appointed'].includes(appointment.status) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleJoinVideo(appointment._id)}
                      className="font-bold px-6 flex-1 sm:flex-none"
                    >
                      <Video size={14} className="inline mr-1" />
                      Join Video
                    </Button>
                  )}
                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && appointment.status !== 'rejected' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(appointment._id)}
                      className="font-bold px-6 flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Cancel Consultation
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" className="font-bold px-6 flex-1 sm:flex-none bg-white border-gray-200 hover:bg-gray-50">
                    View Instructions
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-24 bg-white shadow-xl border-t-4 border-t-primary animate-fadeIn flex flex-col items-center">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Calendar size={64} className="text-blue-200" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">No Appointments Yet</h2>
          <p className="text-gray-500 max-w-sm mb-10 leading-relaxed text-lg italic">Your journey to better healthcare starts here. Book your first appointment today.</p>
          <Link to="/patient/book-appointment">
            <Button variant="primary" size="sm" className="font-bold btn-premium shadow-xl shadow-blue-100 transform transition-transform hover:scale-105 active:scale-95">Schedule Your First Visit</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default AppointmentsPage;

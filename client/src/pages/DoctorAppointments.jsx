import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching doctor appointments...');
      const response = await apiClient.get('/doctors/appointments/list');
      console.log('✅ Appointments fetched:', response.data);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      setError(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      await apiClient.put(`/doctors/appointments/${appointmentId}/status`, { status: 'approved' });
      setAppointments(appts => appts.map(a => a.id === appointmentId ? { ...a, status: 'approved' } : a));
    } catch (error) {
      console.error('❌ Error approving appointment:', error);
      setError('Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      await apiClient.put(`/doctors/appointments/${appointmentId}/status`, { status: 'rejected' });
      setAppointments(appts => appts.map(a => a.id === appointmentId ? { ...a, status: 'rejected' } : a));
    } catch (error) {
      console.error('❌ Error rejecting appointment:', error);
      setError('Failed to reject appointment');
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await apiClient.put(`/doctors/appointments/${appointmentId}/status`, { status: 'completed' });
      setAppointments(appts => appts.map(a => a.id === appointmentId ? { ...a, status: 'completed' } : a));
    } catch (error) {
      console.error('❌ Error completing appointment:', error);
      setError('Failed to complete appointment');
    }
  };

  const filteredAppointments = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-2">My Appointments</h1>
            <p className="text-gray-600 mb-6">Manage your patient appointments</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {['all', 'pending', 'approved', 'completed', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Appointments List */}
            <Card>
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map(appt => (
                    <div key={appt.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">{appt.patientName || 'N/A'}</h3>
                          <p className="text-sm text-gray-600">{appt.reason || 'General checkup'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appt.status === 'approved' ? 'bg-green-100 text-green-800' :
                            appt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                          {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span>{appt.appointmentDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          <span>{appt.appointmentTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span>{appt.consultationType === 'in-person' ? 'In-Person' : 'Online'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {appt.status === 'pending' && (
                          <>
                            <Button size="sm" variant="success" onClick={() => handleApprove(appt.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(appt.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {appt.status === 'approved' && (
                          <>
                            <Button size="sm" variant="primary" onClick={() => navigate(`/doctor/prescription/${appt.id}`)}>
                              <FileText size={14} className="inline mr-1" /> Prescribe
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleComplete(appt.id)}>
                              Mark Complete
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="secondary">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No appointments found</p>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default DoctorAppointments;

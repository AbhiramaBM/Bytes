import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, MessageSquare, FileText, AlertCircle, Clock, CheckSquare, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    appointedAppointments: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [callingId, setCallingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/doctors/appointments/list');
      const appts = response.data.data || [];
      setAppointments(appts);
      setStats({
        totalAppointments: appts.length,
        pendingAppointments: appts.filter(a => a.status === 'pending').length,
        appointedAppointments: appts.filter(a => a.status === 'appointed').length,
        completedAppointments: appts.filter(a => a.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await apiClient.put(`/doctors/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCall = async (appointmentId, phone) => {
    if (!phone) return alert('No phone number available for this patient.');
    setCallingId(appointmentId);
    try {
      await apiClient.post(`/doctors/appointments/${appointmentId}/log-call`);
      window.location.href = `tel:${phone}`;
    } catch (error) {
      console.error('Error logging call:', error);
      // Still attempt call even if logging fails, but warn
      window.location.href = `tel:${phone}`;
    } finally {
      setCallingId(null);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (activeTab === 'all') return true;
    return appt.status === activeTab;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar userRole="doctor" />
        <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
            <p className="text-gray-600 mb-8">Manage your patient appointments and prescriptions</p>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total', value: stats.totalAppointments, icon: Calendar, color: 'blue' },
                { label: 'Pending', value: stats.pendingAppointments, icon: Clock, color: 'yellow' },
                { label: 'Appointed', value: stats.appointedAppointments, icon: CheckSquare, color: 'indigo' },
                { label: 'Completed', value: stats.completedAppointments, icon: CheckCircle, color: 'green' }
              ].map((stat, idx) => (
                <Card key={idx} className="border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon size={24} className={`text-${stat.color}-500`} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
              {['all', 'pending', 'approved', 'appointed', 'completed', 'rejected'].map(tab => (
                <button
                  key={tab}
                  className={`pb-2 px-4 capitalize font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold capitalize">{activeTab} Appointments</h2>
              </div>

              {filteredAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 font-semibold text-gray-700">Patient</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Date/Time</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{appt.patientName}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Phone size={10} />
                              {appt.patientPhone || 'No phone'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {appt.appointmentDate} <span className="text-xs text-gray-400">at</span> {appt.appointmentTime}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              appt.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                appt.status === 'appointed' ? 'bg-indigo-100 text-indigo-700' :
                                  appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                              }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {/* Call Patient Button */}
                              {appt.status !== 'completed' && appt.status !== 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  onClick={() => handleCall(appt.id, appt.patientPhone)}
                                  loading={callingId === appt.id}
                                >
                                  <Phone size={14} className="mr-1" />
                                  Call
                                </Button>
                              )}

                              {appt.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="success" onClick={() => handleStatusChange(appt.id, 'approved')}>Approve</Button>
                                  <Button size="sm" variant="danger" onClick={() => handleStatusChange(appt.id, 'rejected')}>Reject</Button>
                                </>
                              )}
                              {appt.status === 'approved' && (
                                <>
                                  <Button size="sm" variant="indigo" onClick={() => handleStatusChange(appt.id, 'appointed')}>Arrived</Button>
                                  <Button size="sm" variant="primary" onClick={() => navigate(`/doctor/prescription/${appt.id}`)}>Prescribe</Button>
                                </>
                              )}
                              {appt.status === 'appointed' && (
                                <Button size="sm" variant="primary" onClick={() => navigate(`/doctor/prescription/${appt.id}`)}>Prescribe</Button>
                              )}
                              {appt.status === 'completed' && (
                                <span className="text-xs text-gray-400 italic">Consultation Finished</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-2 opacity-20" />
                  <p>No {activeTab === 'all' ? '' : activeTab} appointments found.</p>
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

export default DoctorDashboard;


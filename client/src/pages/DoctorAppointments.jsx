import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle, FileText, Video, Phone, X } from 'lucide-react';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [callingId, setCallingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
    const intervalId = setInterval(fetchAppointments, 15000);
    const onFocus = () => fetchAppointments();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
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
      setAppointments(appts => appts.map(a => a._id === appointmentId ? { ...a, status: 'approved' } : a));
    } catch (error) {
      console.error('❌ Error approving appointment:', error);
      setError('Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      await apiClient.put(`/doctors/appointments/${appointmentId}/status`, { status: 'rejected' });
      setAppointments(appts => appts.map(a => a._id === appointmentId ? { ...a, status: 'rejected' } : a));
    } catch (error) {
      console.error('❌ Error rejecting appointment:', error);
      setError('Failed to reject appointment');
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await apiClient.put(`/doctors/appointments/${appointmentId}/status`, { status: 'completed' });
      setAppointments(appts => appts.map(a => a._id === appointmentId ? { ...a, status: 'completed' } : a));
    } catch (error) {
      console.error('❌ Error completing appointment:', error);
      setError('Failed to complete appointment');
    }
  };

  const handleVideoCall = async (appointmentId) => {
    try {
      const res = await apiClient.get(`/doctors/appointments/${appointmentId}/video-room`);
      const url = res.data?.data?.roomUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setNotice('Video room opened successfully.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to open video room');
    }
  };

  const handleCall = async (appointmentId, phone) => {
    if (!phone) {
      setError('No patient phone number available for this appointment');
      return;
    }
    try {
      setCallingId(appointmentId);
      await apiClient.post(`/doctors/appointments/${appointmentId}/log-call`);
      setNotice('Call action logged. Opening dialer...');
      window.location.href = `tel:${phone}`;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to log call');
      window.location.href = `tel:${phone}`;
    } finally {
      setCallingId(null);
    }
  };

  const handleViewDetails = async (appointmentId) => {
    try {
      const res = await apiClient.get(`/doctors/appointments/${appointmentId}`);
      setSelectedAppointment(res.data?.data || null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load appointment details');
    }
  };

  const filteredAppointments = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">My Appointments</h1>
      <p className="text-gray-600 mb-6">Manage your patient appointments</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center justify-between gap-2">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'booked', 'pending', 'approved', 'appointed', 'completed', 'rejected'].map(status => (
          <Button
            key={status}
            onClick={() => setFilter(status)}
            size="sm"
            variant={filter === status ? 'primary' : 'secondary'}
            className="font-bold"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Appointments List */}
      <Card>
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map(appt => (
              <div key={appt._id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{appt.patientName || 'N/A'}</h3>
                    <p className="text-sm text-gray-600">{appt.reason || 'General checkup'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appt.status === 'booked' ? 'bg-yellow-100 text-yellow-800' :
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

                {appt.aiTriage && (
                  <div className="mb-4 p-3 rounded-lg border bg-indigo-50 border-indigo-100">
                    <p className="text-xs font-bold text-indigo-700 mb-1">AI TRIAGE</p>
                    <p className="text-sm text-gray-700">
                      Risk: <span className="font-semibold uppercase">{appt.aiTriage.riskLevel || 'n/a'}</span>
                    </p>
                    {appt.aiTriage.symptoms?.length > 0 && (
                      <p className="text-sm text-gray-700">Symptoms: {appt.aiTriage.symptoms.join(', ')}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {appt.status !== 'completed' && appt.status !== 'rejected' && (
                    <Button size="sm" variant="ghost" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleCall(appt._id, appt.patientPhone)} loading={callingId === appt._id}>
                      <Phone size={14} className="inline mr-1" /> Call
                    </Button>
                  )}
                  {['pending', 'booked'].includes(appt.status) && (
                    <>
                      <Button size="sm" variant="success" onClick={() => handleApprove(appt._id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleReject(appt._id)}>
                        Reject
                      </Button>
                    </>
                  )}
                  {appt.status === 'approved' && (
                    <>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/doctor/prescription/${appt._id}`)}>
                        <FileText size={14} className="inline mr-1" /> Prescribe
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleVideoCall(appt._id)}>
                        <Video size={14} className="inline mr-1" /> Video Call
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleComplete(appt._id)}>
                        Mark Complete
                      </Button>
                    </>
                  )}
                  {appt.status === 'appointed' && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => handleVideoCall(appt._id)}>
                        <Video size={14} className="inline mr-1" /> Video Call
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/doctor/prescription/${appt._id}`)}>
                        <FileText size={14} className="inline mr-1" /> Prescribe
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => handleViewDetails(appt._id)}>
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

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Appointment Details</h3>
              <button type="button" onClick={() => setSelectedAppointment(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Patient Name</p>
                <p className="font-semibold">{selectedAppointment.patientId?.fullName || selectedAppointment.patientName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Patient Phone</p>
                <p className="font-semibold">{selectedAppointment.patientId?.phone || selectedAppointment.patientPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-semibold">{selectedAppointment.appointmentDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-semibold">{selectedAppointment.appointmentTime}</p>
              </div>
              <div>
                <p className="text-gray-500">Consultation Type</p>
                <p className="font-semibold capitalize">{selectedAppointment.consultationType || 'in-person'}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold capitalize">{selectedAppointment.status}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-sm">Reason</p>
              <p className="font-medium text-gray-800">{selectedAppointment.reason || 'Not provided'}</p>
            </div>
            {selectedAppointment.aiTriage && (
              <div className="mt-4 p-3 rounded-lg border bg-indigo-50 border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 mb-2">AI TRIAGE DETAILS</p>
                <p className="text-sm text-gray-700">Risk: <span className="font-semibold uppercase">{selectedAppointment.aiTriage.riskLevel || 'n/a'}</span></p>
                {selectedAppointment.aiTriage.symptoms?.length > 0 && (
                  <p className="text-sm text-gray-700">Symptoms: {selectedAppointment.aiTriage.symptoms.join(', ')}</p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

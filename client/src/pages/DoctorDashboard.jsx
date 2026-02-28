import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, CheckSquare, Phone, PlusCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [callingId, setCallingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');
  const [availability, setAvailability] = useState({
    acceptingAppointments: true,
    statusNote: '',
    leaveRanges: [],
    blockedSlots: []
  });
  const [leaveDraft, setLeaveDraft] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'leave',
    reason: ''
  });
  const [blockDraft, setBlockDraft] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchAvailability();
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
      const response = await apiClient.get('/doctors/appointments/list');
      const appts = response.data.data || [];
      setAppointments(appts);
      setStats({
        totalAppointments: appts.length,
        pendingAppointments: appts.filter(a => ['pending', 'booked'].includes(a.status)).length,
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

  const fetchAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      const response = await apiClient.get('/doctors/availability/me');
      const payload = response.data?.data || {};
      setAvailability({
        acceptingAppointments: payload.acceptingAppointments !== false,
        statusNote: payload.statusNote || '',
        leaveRanges: payload.leaveRanges || [],
        blockedSlots: payload.blockedSlots || []
      });
    } catch (err) {
      setAvailabilityError(err.response?.data?.message || 'Failed to load availability settings');
    } finally {
      setAvailabilityLoading(false);
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
      setNotice('Call action logged. Opening dialer...');
      window.location.href = `tel:${phone}`;
    } catch (error) {
      console.error('Error logging call:', error);
      // Still attempt call even if logging fails, but warn
      window.location.href = `tel:${phone}`;
    } finally {
      setCallingId(null);
    }
  };

  const handleVideoCall = async (appointmentId) => {
    try {
      const res = await apiClient.get(`/doctors/appointments/${appointmentId}/video-room`);
      const url = res.data?.data?.roomUrl;
      if (url) {
        setNotice('Video room opened successfully.');
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to open video room');
    }
  };

  const addLeaveRange = () => {
    if (!leaveDraft.startDate || !leaveDraft.endDate) {
      setAvailabilityError('Leave start and end date are required');
      return;
    }
    if (leaveDraft.endDate < leaveDraft.startDate) {
      setAvailabilityError('Leave end date cannot be before start date');
      return;
    }

    setAvailabilityError('');
    setAvailability((prev) => ({
      ...prev,
      leaveRanges: [...prev.leaveRanges, { ...leaveDraft }]
    }));
    setLeaveDraft({ startDate: '', endDate: '', leaveType: 'leave', reason: '' });
  };

  const addBlockedSlot = () => {
    if (!blockDraft.date || !blockDraft.startTime || !blockDraft.endTime) {
      setAvailabilityError('Blocked slot requires date, start time, and end time');
      return;
    }
    if (blockDraft.endTime <= blockDraft.startTime) {
      setAvailabilityError('Blocked slot end time must be after start time');
      return;
    }

    setAvailabilityError('');
    setAvailability((prev) => ({
      ...prev,
      blockedSlots: [...prev.blockedSlots, { ...blockDraft }]
    }));
    setBlockDraft({ date: '', startTime: '', endTime: '', reason: '' });
  };

  const removeLeaveRange = (index) => {
    setAvailability((prev) => ({
      ...prev,
      leaveRanges: prev.leaveRanges.filter((_, idx) => idx !== index)
    }));
  };

  const removeBlockedSlot = (index) => {
    setAvailability((prev) => ({
      ...prev,
      blockedSlots: prev.blockedSlots.filter((_, idx) => idx !== index)
    }));
  };

  const saveAvailability = async () => {
    try {
      setAvailabilitySaving(true);
      setAvailabilityError('');
      setAvailabilitySuccess('');
      await apiClient.put('/doctors/availability', { availability });
      setAvailabilitySuccess('Availability saved. New leave and blocked slots are now active.');
    } catch (err) {
      setAvailabilityError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (activeTab === 'all') return true;
    return appt.status === activeTab;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your patient appointments and prescriptions</p>

      <Card className="mb-8">
        <h2 className="text-xl font-bold mb-4">Leave & Temporary Availability</h2>
        {availabilityLoading ? (
          <p className="text-sm text-gray-500">Loading availability settings...</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
              <div>
                <p className="font-semibold text-gray-800">Accepting New Appointments</p>
                <p className="text-xs text-gray-500">Turn this off when unavailable for any booking.</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={availability.acceptingAppointments}
                  onChange={(e) => setAvailability((prev) => ({ ...prev, acceptingAppointments: e.target.checked }))}
                />
                <span>{availability.acceptingAppointments ? 'Available' : 'Not Available'}</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status Note (extra info for patients)</label>
              <input
                type="text"
                value={availability.statusNote}
                onChange={(e) => setAvailability((prev) => ({ ...prev, statusNote: e.target.value }))}
                placeholder="Example: Emergency duty today, limited slots."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="font-semibold text-gray-800">Add Leave Range</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={leaveDraft.startDate} onChange={(e) => setLeaveDraft((prev) => ({ ...prev, startDate: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg" />
                  <input type="date" value={leaveDraft.endDate} onChange={(e) => setLeaveDraft((prev) => ({ ...prev, endDate: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <select value={leaveDraft.leaveType} onChange={(e) => setLeaveDraft((prev) => ({ ...prev, leaveType: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="leave">Leave</option>
                  <option value="vacation">Vacation</option>
                  <option value="conference">Conference</option>
                  <option value="training">Training</option>
                </select>
                <input type="text" value={leaveDraft.reason} onChange={(e) => setLeaveDraft((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Reason (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <Button type="button" size="sm" variant="secondary" onClick={addLeaveRange}>
                  <PlusCircle size={14} className="inline mr-1" />
                  Add Leave
                </Button>
                {availability.leaveRanges.length > 0 && (
                  <div className="space-y-2">
                    {availability.leaveRanges.map((leave, idx) => (
                      <div key={`${leave.startDate}-${leave.endDate}-${idx}`} className="flex items-center justify-between text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <span>{leave.startDate} to {leave.endDate} ({leave.leaveType}) {leave.reason ? `- ${leave.reason}` : ''}</span>
                        <button type="button" onClick={() => removeLeaveRange(idx)} className="text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-gray-800">Add Temporary Blocked Time</p>
                <input type="date" value={blockDraft.date} onChange={(e) => setBlockDraft((prev) => ({ ...prev, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" value={blockDraft.startTime} onChange={(e) => setBlockDraft((prev) => ({ ...prev, startTime: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg" />
                  <input type="time" value={blockDraft.endTime} onChange={(e) => setBlockDraft((prev) => ({ ...prev, endTime: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <input type="text" value={blockDraft.reason} onChange={(e) => setBlockDraft((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Reason (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                <Button type="button" size="sm" variant="secondary" onClick={addBlockedSlot}>
                  <PlusCircle size={14} className="inline mr-1" />
                  Add Block
                </Button>
                {availability.blockedSlots.length > 0 && (
                  <div className="space-y-2">
                    {availability.blockedSlots.map((block, idx) => (
                      <div key={`${block.date}-${block.startTime}-${block.endTime}-${idx}`} className="flex items-center justify-between text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <span>{block.date} {block.startTime}-{block.endTime} {block.reason ? `- ${block.reason}` : ''}</span>
                        <button type="button" onClick={() => removeBlockedSlot(idx)} className="text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {availabilityError && <p className="text-sm text-red-600">{availabilityError}</p>}
            {availabilitySuccess && <p className="text-sm text-green-600">{availabilitySuccess}</p>}

            <div>
              <Button type="button" onClick={saveAvailability} disabled={availabilitySaving}>
                {availabilitySaving ? 'Saving...' : 'Save Availability Settings'}
              </Button>
            </div>
          </div>
        )}
      </Card>

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
        {['all', 'booked', 'pending', 'approved', 'appointed', 'completed', 'rejected'].map(tab => (
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
      {notice && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center justify-between gap-2">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-bold">x</button>
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
                  <tr key={appt._id} className="border-b hover:bg-gray-50">
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
                        appt.status === 'booked' ? 'bg-yellow-100 text-yellow-700' :
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
                            onClick={() => handleCall(appt._id, appt.patientPhone)}
                            loading={callingId === appt._id}
                          >
                            <Phone size={14} className="mr-1" />
                            Call
                          </Button>
                        )}

                        {['pending', 'booked'].includes(appt.status) && (
                          <>
                            <Button size="sm" variant="success" onClick={() => handleStatusChange(appt._id, 'approved')}>Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => handleStatusChange(appt._id, 'rejected')}>Reject</Button>
                          </>
                        )}
                        {appt.status === 'approved' && (
                          <>
                            <Button size="sm" variant="indigo" onClick={() => handleStatusChange(appt._id, 'appointed')}>Arrived</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleVideoCall(appt._id)}>Video Call</Button>
                            <Button size="sm" variant="primary" onClick={() => navigate(`/doctor/prescription/${appt._id}`)}>Prescribe</Button>
                          </>
                        )}
                        {appt.status === 'appointed' && (
                          <>
                            <Button size="sm" variant="secondary" onClick={() => handleVideoCall(appt._id)}>Video Call</Button>
                            <Button size="sm" variant="primary" onClick={() => navigate(`/doctor/prescription/${appt._id}`)}>Prescribe</Button>
                          </>
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
  );
};

export default DoctorDashboard;


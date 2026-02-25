import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, Button, Input, Select, Textarea, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    doctorId: '',
    clinicId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    consultationType: 'in-person'
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/doctors');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return '';
    console.log('[DEBUG] Frontend Normalizing Time:', timeStr);

    const clean = timeStr.trim().toUpperCase();

    // Robust Regex for H:M, HH:MM, optional seconds, optional AM/PM, supporting dots/colons
    const match = clean.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(AM|PM)?$/);
    if (!match) {
      console.warn('[DEBUG] No frontend regex match for:', clean);
      return clean;
    }

    let [_, hours, minutes, modifier] = match;
    let h = parseInt(hours, 10);

    if (modifier === 'PM' && h < 12) {
      h += 12;
    } else if (modifier === 'AM' && h === 12) {
      h = 0;
    }

    const result = `${h.toString().padStart(2, '0')}:${minutes}`;
    console.log('[DEBUG] Frontend Result:', result);
    return result;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user changes input
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const normalizedTime = convertTo24Hour(formData.appointmentTime);
      const payload = {
        ...formData,
        appointmentTime: normalizedTime
      };

      console.log('[DEBUG] Submitting Appointment Payload:', JSON.stringify(payload, null, 2));

      const response = await apiClient.post('/patients/appointments', payload);
      if (response.data.success) {
        setSuccessMsg('Appointment booked successfully!');
        setTimeout(() => navigate('/patient/appointments'), 1500);
      }
    } catch (error) {
      console.error('[DEBUG] Booking Error Response:', error.response?.data);
      const backendMessage = error.response?.data?.message || 'Failed to book appointment';
      const backendError = error.response?.data?.error;
      const fullError = backendError ? `${backendMessage} (${backendError})` : backendMessage;
      setErrorMsg(fullError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-10 max-w-2xl">
            <h1 className="text-4xl font-bold mb-10">Book an Appointment</h1>

            {errorMsg && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" role="alert">
                <strong className="font-bold">Success: </strong>
                <span>{successMsg}</span>
              </div>
            )}

            <Card>
              <form onSubmit={handleSubmit}>
                <Select
                  label="Select Doctor"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  options={doctors.map(d => ({
                    value: d.id,
                    label: `${d.fullName} - ${d.specialization}`
                  }))}
                  required
                />

                <Input
                  label="Appointment Date"
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                />

                <div className="relative">
                  <Input
                    label="Appointment Time"
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-[-12px] mb-4">
                    Available in 30-minute slots from 09:00 to 18:00 (e.g., 09:00, 09:30)
                  </p>
                </div>

                <Select
                  label="Consultation Type"
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleChange}
                  options={[
                    { value: 'in-person', label: 'In-Person' },
                    { value: 'online', label: 'Online' }
                  ]}
                />

                <Textarea
                  label="Reason for Appointment"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Describe your symptoms or reason"
                  rows="4"
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Booking...' : 'Book Appointment'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default BookAppointmentPage;

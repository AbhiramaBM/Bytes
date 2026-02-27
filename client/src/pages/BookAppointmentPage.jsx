import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [drRes, clRes] = await Promise.all([
        apiClient.get('/doctors'),
        apiClient.get('/clinics')
      ]);
      setDoctors(drRes.data.data || []);
      setClinics(clRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return '';

    const clean = timeStr.trim().toUpperCase();

    // Robust Regex for H:M, HH:MM, optional seconds, optional AM/PM, supporting dots/colons
    const match = clean.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(AM|PM)?$/);
    if (!match) {
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

      const response = await apiClient.post('/patients/appointments', payload);
      if (response.data.success) {
        setSuccessMsg('Appointment booked successfully!');
        setTimeout(() => navigate('/patient/appointments'), 1500);
      }
    } catch (error) {
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
    <div className="container mx-auto py-10 max-w-2xl px-4">
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 font-display mb-2">Book an Appointment</h1>
        <p className="text-gray-500">Schedule your consultation with our expert medical team</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded-lg mb-8 shadow-sm animate-shake" role="alert">
          <div className="flex items-center">
            <div className="py-1"><AlertCircle className="h-6 w-6 text-red-500 mr-4" /></div>
            <div>
              <p className="font-bold">Booking Error</p>
              <p className="text-sm">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-4 rounded-lg mb-8 shadow-sm animate-fadeIn" role="alert">
          <div className="flex items-center">
            <div className="py-1"><CheckCircle className="h-6 w-6 text-green-500 mr-4" /></div>
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm">{successMsg}</p>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-xl border-t-4 border-t-primary animate-fadeIn">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Select
              label="Select Doctor"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              options={doctors.map(d => ({
                value: d._id, // Fixed: MongoDB uses _id
                label: `${d.fullName} - ${d.specialization}`
              }))}
              required
              className="bg-gray-50"
            />

            <Select
              label="Select Clinic"
              name="clinicId"
              value={formData.clinicId}
              onChange={handleChange}
              options={clinics.map(c => ({
                value: c._id,
                label: `${c.name} - ${c.city}`
              }))}
              required
              className="bg-gray-50"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Appointment Date"
                type="text"
                name="appointmentDate"
                placeholder="YYYY-MM-DD"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                className="bg-gray-50"
              />

              <Input
                label="Appointment Time"
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
                className="bg-gray-50"
              />
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
              className="bg-gray-50"
            />

            <Textarea
              label="Reason for Appointment"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Briefly describe your symptoms or reason for visit"
              rows="4"
              className="bg-gray-50"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button
              type="submit"
              variant="success"
              size="sm"
              disabled={submitting}
              className="flex-1 btn-premium shadow-lg shadow-green-100 font-bold"
            >
              {submitting ? 'Confirming...' : 'Confirm Appointment'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex-1 font-bold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      <p className="mt-8 text-center text-sm text-gray-400">
        By booking, you agree to RuralCare Connect's terms of service and privacy policy.
      </p>
    </div>
  );
};

export default BookAppointmentPage;

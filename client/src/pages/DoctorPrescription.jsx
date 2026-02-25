import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, PlusCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';

const DoctorPrescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    diagnosis: '',
    notes: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }]
  });

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/doctors/appointments/${appointmentId}`);
      setAppointment(res.data.data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError(err.response?.data?.message || 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const meds = [...form.medicines];
    meds[index][field] = value;
    setForm({ ...form, medicines: meds });
  };

  const addMedicine = () => {
    setForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedicine = (i) => {
    if (form.medicines.length <= 1) return;
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== i)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    if (!form.diagnosis.trim()) {
      setError('Diagnosis is required');
      setSubmitting(false);
      return;
    }

    // Validate all medicine fields
    const validMedicines = form.medicines.filter(m => m.name.trim());
    if (validMedicines.length === 0) {
      setError('At least one medicine is required');
      setSubmitting(false);
      return;
    }

    for (let i = 0; i < validMedicines.length; i++) {
      const m = validMedicines[i];
      if (!m.name.trim() || !m.dosage.trim() || !m.frequency.trim() || !m.duration.trim()) {
        setError(`Medicine #${i + 1}: All fields (name, dosage, frequency, duration) are required`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        appointmentId,
        diagnosis: form.diagnosis,
        medicines: validMedicines,
        notes: form.notes
      };

      console.log('[DEBUG] Submitting prescription:', payload);

      const res = await apiClient.post('/doctors/prescriptions', payload);
      if (res.data.success) {
        navigate('/doctor/dashboard');
      } else {
        setError(res.data.message || 'Failed to save prescription');
      }
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar userRole="doctor" />
        <div className="flex-1 p-8 md:ml-64">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create Prescription</h1>
            {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

            <Card className="mb-6">
              <h2 className="font-semibold text-lg border-b pb-2 mb-3">Patient Details</h2>
              {appointment ? (
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <p><strong>Name:</strong> {appointment.patientName}</p>
                  <p><strong>Phone:</strong> {appointment.patientPhone || 'N/A'}</p>
                  <p><strong>Appointment:</strong> {appointment.appointmentDate} at {appointment.appointmentTime}</p>
                  <p><strong>Clinic:</strong> {appointment.clinicName || 'N/A'}</p>
                  <p className="col-span-2"><strong>Reason:</strong> {appointment.reason || 'N/A'}</p>
                </div>
              ) : (
                <p>No appointment data found.</p>
              )}
            </Card>

            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Diagnosis</label>
                  <textarea
                    value={form.diagnosis}
                    onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter patient diagnosis..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-gray-700">
                      Medicines ({form.medicines.length} added)
                    </label>
                    <button
                      type="button"
                      onClick={addMedicine}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <PlusCircle size={16} /> Add Medicine
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.medicines.map((m, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-gray-50 relative">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-500">Medicine #{idx + 1}</span>
                          {form.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicine(idx)}
                              className="text-red-500 hover:text-red-700"
                              title="Remove medicine"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                        <input
                          placeholder="Medicine Name"
                          value={m.name}
                          onChange={e => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-2 mb-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            placeholder="Dosage (e.g. 500mg)"
                            value={m.dosage}
                            onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <input
                            placeholder="Frequency (e.g. 2/day)"
                            value={m.frequency}
                            onChange={e => handleMedicineChange(idx, 'frequency', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <input
                            placeholder="Duration (e.g. 5 days)"
                            value={m.duration}
                            onChange={e => handleMedicineChange(idx, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Additional Notes (Optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Any extra instructions for the patient..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Saving...' : 'Complete & Save Prescription'}
                  </Button>
                  <Button type="button" onClick={() => navigate('/doctor/dashboard')} variant="secondary">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorPrescription;

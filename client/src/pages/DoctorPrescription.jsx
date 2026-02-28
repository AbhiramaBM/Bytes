import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, PlusCircle, User, Activity, FileText, Clipboard, Pill } from 'lucide-react';
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
    consultationFee: '',
    medicineCharges: '',
    additionalCharges: '',
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
      const consultationFee = Number(form.consultationFee) || 0;
      const medicineCharges = Number(form.medicineCharges) || 0;
      const additionalCharges = Number(form.additionalCharges) || 0;
      const totalAmount = consultationFee + medicineCharges + additionalCharges;
      if (totalAmount <= 0) {
        setError('Add payment amount (consultation/medicine/extra) greater than 0');
        setSubmitting(false);
        return;
      }

      const payload = {
        appointmentId,
        diagnosis: form.diagnosis,
        medicines: validMedicines,
        notes: form.notes,
        consultationFee,
        medicineCharges,
        additionalCharges,
        currency: 'INR'
      };

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
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-800 font-display">Generate Prescription</h1>
        <p className="text-gray-500 mt-2 font-medium">Formulate official clinical orders for {appointment?.patientName || 'Patient'}</p>
      </div>

      {error && (
        <div className="mb-8 flex items-center gap-4 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm animate-pulse">
          <XCircle className="text-red-500" size={24} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <Card className="mb-8 border-l-8 border-l-blue-600 shadow-xl bg-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><User size={20} /></div>
            <h2 className="font-bold text-xl text-gray-800">Patient Electronic File</h2>
          </div>
          {appointment ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="font-bold text-lg text-gray-800">{appointment.patientName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Contact</p>
                  <p className="font-bold text-gray-700 italic">{appointment.patientPhone || 'Secure Record'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Activity className="text-indigo-500" size={24} />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consultation ID</p>
                    <p className="text-sm font-bold text-gray-600">{appointmentId.substring(0, 10)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Appointment Summary</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{appointment.appointmentDate} | {appointment.appointmentTime}</p>
                </div>
              </div>
              <div className="col-span-full bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clipboard size={14} /> Subjective Reason
                </p>
                <p className="text-gray-700 text-sm font-medium leading-relaxed italic">"{appointment.reason || 'Routine Wellness Checkup'}"</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic">Accessing secure medical node...</p>
          )}
        </div>
        <User className="absolute -right-12 -bottom-12 text-blue-50 opacity-20 rotate-12" size={200} />
      </Card>

      <Card className="shadow-2xl border-none bg-white p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
              <Activity className="text-primary" size={20} />
              Clinical Diagnosis
            </label>
            <textarea
              value={form.diagnosis}
              onChange={e => setForm({ ...form, diagnosis: e.target.value })}
              className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-400 text-lg font-medium"
              placeholder="What is the observed pathology or primary condition?"
              rows={4}
              required
            />
          </div>

          <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <Pill className="text-green-600" size={20} />
                Prescribed Interventions
              </label>
              <Button
                type="button"
                onClick={addMedicine}
                size="sm"
                variant="success"
                className="flex items-center gap-2 shadow-lg shadow-green-100"
              >
                <PlusCircle size={18} /> New Medicine
              </Button>
            </div>

            <div className="space-y-6">
              {form.medicines.map((m, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-primary"></span> Line Item #{idx + 1}
                    </span>
                    {form.medicines.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMedicine(idx)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="Remove medicine"
                      >
                        <XCircle size={22} />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <input
                      placeholder="Scientific/Brand Name"
                      value={m.name}
                      onChange={e => handleMedicineChange(idx, 'name', e.target.value)}
                      className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-gray-800"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <input
                          placeholder="Dosage (e.g. 100mg)"
                          value={m.dosage}
                          onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <input
                        placeholder="Frequency (e.g. 1-0-1)"
                        value={m.frequency}
                        onChange={e => handleMedicineChange(idx, 'frequency', e.target.value)}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-sm font-medium"
                      />
                      <input
                        placeholder="Duration (e.g. 7 Days)"
                        value={m.duration}
                        onChange={e => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
              <FileText className="text-amber-600" size={20} />
              Physician's Remarks
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-400 font-medium italic"
              placeholder="Lifestyle modifications, dietary restrictions, or follow-up instructions..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              min="0"
              placeholder="Consultation Fee"
              value={form.consultationFee}
              onChange={e => setForm({ ...form, consultationFee: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
            />
            <input
              type="number"
              min="0"
              placeholder="Medicine Charges"
              value={form.medicineCharges}
              onChange={e => setForm({ ...form, medicineCharges: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
            />
            <input
              type="number"
              min="0"
              placeholder="Additional Charges"
              value={form.additionalCharges}
              onChange={e => setForm({ ...form, additionalCharges: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
            <Button
              type="submit"
              disabled={submitting}
              size="sm"
              variant="success"
              className="flex-1 btn-premium shadow-2xl shadow-green-100 font-bold"
            >
              {submitting ? 'Encrypting Record...' : 'Authorize & Issue Prescription'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/doctor/dashboard')}
              variant="secondary"
              size="sm"
              className="flex-1 font-bold"
            >
              Discard Changes
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Activity size={14} /> RuralCare Connect Secure Node
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescription;

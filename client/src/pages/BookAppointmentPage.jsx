import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Sparkles, Bot } from 'lucide-react';
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
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiConversationId, setAiConversationId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [followUpAnswers, setFollowUpAnswers] = useState({});
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

  useEffect(() => {
    if (formData.consultationType !== 'online') return;

    const text = (formData.reason || '').toLowerCase().trim();
    if (text.length < 4) return;
    if (!/(fever|cough|cold|pain|headache|vomit|diarrhea|breath|throat|chest)/.test(text)) return;

    const timer = setTimeout(() => {
      runSymptomAnalysis(text);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.reason]);

  useEffect(() => {
    if (formData.consultationType === 'online') return;
    setAiResult(null);
    setSymptomsInput('');
    setFollowUpAnswers({});
    setAiConversationId(null);
  }, [formData.consultationType]);

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

  const fetchSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setSlots([]);
      setAvailabilityMessage('');
      return;
    }
    setSlotLoading(true);
    try {
      const res = await apiClient.get('/patients/appointments/slots', { params: { doctorId, date } });
      setSlots(res.data.data?.slots || []);
      const unavailableInfo = res.data.data?.unavailableSlots || [];
      setAvailabilityMessage(unavailableInfo.length ? 'Some time slots are blocked by doctor availability settings.' : '');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to fetch slots');
      setSlots([]);
      setAvailabilityMessage('');
    } finally {
      setSlotLoading(false);
    }
  };

  const handleChange = (e) => {
    const next = { ...formData, [e.target.name]: e.target.value };
    setFormData(next);
    // Clear errors when user changes input
    setErrorMsg('');
    setSuccessMsg('');

    if (e.target.name === 'doctorId' || e.target.name === 'appointmentDate') {
      const doctorId = e.target.name === 'doctorId' ? e.target.value : next.doctorId;
      const date = e.target.name === 'appointmentDate' ? e.target.value : next.appointmentDate;
      fetchSlots(doctorId, date);
    }
  };

  const extractQuestionsFromText = (text = '') => {
    const lines = `${text}`
      .split('\n')
      .map((line) => line.replace(/^[-*0-9.)\s]+/, '').trim())
      .filter(Boolean);

    const questions = lines
      .filter((line) => line.includes('?'))
      .map((line) => line.endsWith('?') ? line : `${line}?`);

    return questions.slice(0, 6);
  };

  const buildFallbackQuestions = (symptoms = []) => {
    const text = symptoms.join(' ').toLowerCase();
    const base = [
      'How many days have you been suffering from this?',
      'How severe are the symptoms now (mild, moderate, severe)?',
      'Do you have fever, breathing difficulty, or chest pain along with this?',
      'Is there a similar illness history in your family?',
      'Are you taking any medicines currently for this problem?',
      'Did this start suddenly or gradually?'
    ];

    if (text.includes('fever')) {
      base[2] = 'Is fever continuous or on and off, and what is the highest temperature?';
    }
    if (text.includes('cough')) {
      base[2] = 'Is cough dry or with phlegm, and is there blood in sputum?';
    }
    if (text.includes('diabetes') || text.includes('sugar')) {
      base[3] = 'Do you or anyone in your family have diabetes history?';
    }

    return base;
  };

  const runSymptomAnalysis = async (reasonText = '') => {
    const source = reasonText || symptomsInput;
    const symptoms = source.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (symptoms.length === 0) {
      setErrorMsg('Enter symptoms before AI analysis');
      return;
    }
    setErrorMsg('');
    try {
      const prompt = `Patient symptoms: ${symptoms.join(', ')}.
You are a triage assistant. Ask ONLY 6 concise follow-up questions.
Rules:
1) Output only questions, one per line.
2) No advice, no diagnosis, no treatment, no explanation.
3) Include: duration, severity, associated symptoms, family history, current medication, and risk red flags.
4) Every line must end with a question mark.`;

      const res = await apiClient.post('/ai/chat', {
        message: prompt,
        conversationId: aiConversationId || undefined
      });

      const responseMessage = res.data?.data?.message || '';
      const parsedQuestions = extractQuestionsFromText(responseMessage);
      const questions = parsedQuestions.length >= 4 ? parsedQuestions : buildFallbackQuestions(symptoms);
      setAiConversationId(res.data?.data?.conversationId || aiConversationId);
      setAiResult({
        followUpQuestions: questions,
        rawMessage: responseMessage
      });

      const initialAnswers = {};
      questions.forEach((q) => {
        initialAnswers[q] = followUpAnswers[q] || '';
      });
      setFollowUpAnswers(initialAnswers);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'AI analysis failed');
    }
  };

  const fetchSuggestedSlots = async () => {
    if (!formData.doctorId || !formData.appointmentDate) {
      setErrorMsg('Select doctor and date before requesting suggestions');
      return;
    }

    setSuggestLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.post('/patients/appointments/suggest-time', {
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        preferredTime: formData.appointmentTime || undefined
      });
      setSuggestedSlots(res.data.data?.suggestedSlots || []);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to fetch suggested slots');
      setSuggestedSlots([]);
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const selectedDoctor = doctors.find((d) => d._id === formData.doctorId);
      if (selectedDoctor?.availability?.acceptingAppointments === false) {
        setErrorMsg(selectedDoctor.availability.statusNote || 'Doctor is temporarily unavailable for appointments');
        setSubmitting(false);
        return;
      }

      const normalizedTime = convertTo24Hour(formData.appointmentTime);
      const payload = {
        ...formData,
        appointmentTime: normalizedTime,
        aiTriage: aiResult ? {
          symptoms: (symptomsInput || formData.reason || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
          followUpQuestions: aiResult.followUpQuestions || [],
          followUpAnswers: Object.entries(followUpAnswers).map(([question, answer]) => ({ question, answer })),
          riskLevel: aiResult.riskLevel,
          likelyConditions: aiResult.likelyConditions || [],
          recommendedSpecializations: aiResult.recommendedSpecializations || [],
          doctorAdvice: aiResult.doctorVisitAdvice || ''
        } : undefined
      };

      const response = await apiClient.post('/patients/appointments', payload);
      if (response.data.success) {
        setSuccessMsg('Appointment booked successfully!');
        setSlots((prev) => prev.map((slot) => (
          slot.startTime === normalizedTime ? { ...slot, isBooked: true } : slot
        )));
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
  const filteredDoctors = doctors;
  const selectedDoctor = doctors.find((d) => d._id === formData.doctorId);
  const doctorUnavailable = selectedDoctor?.availability?.acceptingAppointments === false;

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
              options={filteredDoctors.map(d => ({
                value: d._id, // Fixed: MongoDB uses _id
                label: `${d.fullName} - ${d.specialization}${d.availability?.acceptingAppointments === false ? ' (Temporarily Unavailable)' : ''}`
              }))}
              required
              className="bg-gray-50"
            />

            {doctorUnavailable && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                {selectedDoctor?.availability?.statusNote || 'This doctor is currently not accepting appointments.'}
              </div>
            )}

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
                type="date"
                name="appointmentDate"
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

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={fetchSuggestedSlots}
                variant="secondary"
                size="sm"
                disabled={suggestLoading}
                className="inline-flex items-center gap-2"
              >
                <Sparkles size={16} />
                {suggestLoading ? 'Finding best slots...' : 'Suggest Best Time'}
              </Button>
              {suggestedSlots.length > 0 && (
                <p className="text-xs text-gray-500">Click a suggested slot to auto-fill time.</p>
              )}
            </div>

            {suggestedSlots.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestedSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, appointmentTime: slot }))}
                    className="px-3 py-1.5 text-sm rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Calendar Slots (Green=Available, Red=Booked, Amber=Doctor Blocked)</p>
              {availabilityMessage && <p className="text-xs text-amber-700 mb-2">{availabilityMessage}</p>}
              {slotLoading ? (
                <p className="text-sm text-gray-500">Loading slots...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      title={slot.unavailableReason || ''}
                      disabled={slot.isBooked || slot.isUnavailable}
                      onClick={() => setFormData((prev) => ({ ...prev, appointmentTime: slot.startTime }))}
                      className={`px-3 py-1.5 text-sm rounded-full border ${
                        slot.isBooked
                          ? 'bg-red-100 text-red-700 border-red-200 cursor-not-allowed'
                          : slot.isUnavailable
                            ? 'bg-amber-100 text-amber-800 border-amber-200 cursor-not-allowed'
                          : formData.appointmentTime === slot.startTime
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
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

            {formData.consultationType === 'online' && (
              <div className="pt-4 border-t border-gray-100">
                <Textarea
                  label="Symptoms (AI-assisted Triage)"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="e.g., fever, body pain, sore throat"
                  rows="3"
                  className="bg-gray-50"
                />
                <Button type="button" onClick={() => runSymptomAnalysis()} variant="secondary" size="sm" className="inline-flex items-center gap-2 mt-2">
                  <Bot size={16} />
                  Ask AI Follow-up Questions
                </Button>

                {aiResult && (
                  <div className="rounded-xl p-4 border bg-blue-50 border-blue-200 mt-3">
                    {aiResult.followUpQuestions?.length > 0 ? (
                      <div className="space-y-2">
                        {aiResult.followUpQuestions.slice(0, 6).map((q, idx) => (
                          <div key={idx}>
                            <p className="text-sm text-gray-700 font-medium">{q}</p>
                            <input
                              type="text"
                              value={followUpAnswers[q] || ''}
                              onChange={(e) => setFollowUpAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                              placeholder="Enter your answer"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">{aiResult.rawMessage || 'No follow-up questions generated.'}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button
              type="submit"
              variant="success"
              size="sm"
              disabled={submitting || doctorUnavailable}
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

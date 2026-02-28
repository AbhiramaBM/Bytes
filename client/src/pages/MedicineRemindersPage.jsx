import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, Clock, Calendar, CheckCircle, Bell, X } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const MedicineRemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_date: '',
    reminder_time: ''
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await apiClient.get('/patients/medicine-reminders');
      setReminders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Past date check
    const now = new Date();
    const reminderDateTime = new Date(`${formData.reminder_date}T${formData.reminder_time}`);
    if (reminderDateTime < now) {
      alert('Reminder cannot be set in the past');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post('/patients/medicine-reminders', formData);
      if (response.data.success) {
        setFormData({
          title: '',
          description: '',
          reminder_date: '',
          reminder_time: ''
        });
        setShowForm(false);
        fetchReminders();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await apiClient.delete(`/patients/medicine-reminders/${id}`);
      fetchReminders();
    } catch (error) {
      alert('Failed to delete reminder');
    }
  };

  const handleToggleStatus = async (reminder) => {
    const newStatus = reminder.status === 'active' ? 'completed' : 'active';
    try {
      await apiClient.put(`/patients/medicine-reminders/${reminder._id}`, { status: newStatus });
      fetchReminders();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 font-display">Medication Vault</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Smart Reminders & Dose Tracking</p>
        </div>
        {!showForm && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)} className="font-bold btn-premium shadow-lg shadow-blue-200">
            <Plus size={18} className="mr-2" />
            New Medication
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-10 animate-slideDown overflow-hidden border-t-4 border-primary">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Assign Reminder</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Medicine Name"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Paracetamol 500mg"
              required
              className="h-12 border-gray-200 focus:border-primary shadow-sm"
            />

            <Textarea
              label="Dosage Instructions"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Take 1 tablet post-lunch with lukewarm water"
              rows="3"
              className="border-gray-200 focus:border-primary shadow-sm"
            />

            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Scheduled Date"
                type="date"
                name="reminder_date"
                value={formData.reminder_date}
                onChange={handleChange}
                required
                className="h-12 border-gray-200 focus:border-primary shadow-sm"
              />
              <Input
                label="Scheduled Time"
                type="time"
                name="reminder_time"
                value={formData.reminder_time}
                onChange={handleChange}
                required
                className="h-12 border-gray-200 focus:border-primary shadow-sm"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting}
                className="flex-1 font-bold btn-premium"
              >
                {submitting ? 'Archiving...' : 'Secure Reminder'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {reminders.length > 0 ? (
        <div className="grid gap-6">
          {reminders.map((reminder) => (
            <Card key={reminder._id} className={`${reminder.status === 'completed' ? 'opacity-60 bg-gray-50 border-gray-200' : 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none bg-white shadow-lg group'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-2">
                <div className="flex items-start gap-6 w-full">
                  <div className={`p-5 rounded-2xl shadow-inner transition-colors duration-300 ${reminder.status === 'active' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Pill size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-2xl font-bold ${reminder.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 group-hover:text-primary transition-colors'}`}>
                        {reminder.title}
                      </h3>
                      {reminder.status === 'active' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                          <Bell size={10} className="animate-bounce" /> Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Missed/Taken
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 font-medium italic mb-4 leading-relaxed">{reminder.description}</p>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-sm font-bold text-gray-500">
                        <Calendar size={14} className="text-primary" />
                        {reminder.reminder_date}
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-sm font-bold text-gray-500">
                        <Clock size={14} className="text-indigo-600" />
                        {reminder.reminder_time}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <Button
                    variant={reminder.status === 'active' ? 'success' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleStatus(reminder)}
                    className={`font-bold text-xs px-6 py-2.5 flex-1 sm:flex-none shadow-sm ${reminder.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-gray-200'}`}
                  >
                    {reminder.status === 'active' ? (
                      <div className="flex items-center gap-2"><CheckCircle size={14} /> Mark Taken</div>
                    ) : 'Re-activate'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(reminder._id)}
                    className="p-3 text-red-500 hover:bg-red-50 border-red-100 flex-none"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-24 bg-white shadow-xl border-t-8 border-t-blue-500 animate-fadeIn flex flex-col items-center">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-10 shadow-inner group">
            <Pill size={64} className="text-blue-200 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 font-display">Medication Vault Empty</h2>
          <p className="text-gray-500 max-w-sm mb-12 leading-relaxed text-lg italic">Organize your treatment schedule here for timely alerts and dose tracking.</p>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)} className="font-bold btn-premium shadow-xl shadow-blue-200">
            Set Your Primary Reminder
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MedicineRemindersPage;

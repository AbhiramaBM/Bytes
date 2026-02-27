import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2 } from 'lucide-react';
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
      await apiClient.put(`/patients/medicine-reminders/${reminder.id}`, { status: newStatus });
      fetchReminders();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-display">Medication Reminders</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Never miss your doses</p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)} className="font-bold">
            <Plus size={18} className="mr-2" />
            Add New
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-10 animate-slideDown">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Reminder</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Reminder Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Take Vitamin C"
              required
            />

            <Textarea
              label="Description / Dosage"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., 1 tablet after lunch"
              rows="2"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Reminder Date"
                type="date"
                name="reminder_date"
                value={formData.reminder_date}
                onChange={handleChange}
                required
              />
              <Input
                label="Reminder Time"
                type="time"
                name="reminder_time"
                value={formData.reminder_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="flex-1 font-bold"
              >
                {submitting ? 'Adding...' : 'Add Reminder'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
                className="flex-1 font-bold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {reminders.length > 0 ? (
        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={`${reminder.status === 'completed' ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'} transition-all`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${reminder.status === 'active' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                    <Pill size={24} className={reminder.status === 'active' ? 'text-blue-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className={`text-xl font-bold ${reminder.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${reminder.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {reminder.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 font-medium italic">{reminder.description}</p>
                    <div className="flex gap-6 mt-4 text-xs font-bold text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span>Date:</span>
                        <span className="text-gray-700">{reminder.reminder_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>Time:</span>
                        <span className="text-gray-700">{reminder.reminder_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={reminder.status === 'active' ? 'success' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleStatus(reminder)}
                    className="font-bold text-xs"
                  >
                    {reminder.status === 'active' ? 'Check' : 'Reopen'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(reminder.id)} className="p-2">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-20 bg-gray-50/30 border-dashed border-2">
          <Pill size={64} className="mx-auto text-gray-200 mb-6" />
          <p className="text-gray-500 text-xl font-bold">No reminders set yet</p>
          <p className="text-gray-400 text-sm mt-2 mb-8 max-w-xs mx-auto">Create medicine reminders to stay on top of your treatment plan.</p>
          <Button variant="primary" onClick={() => setShowForm(true)} className="font-bold">
            Add Your First Reminder
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MedicineRemindersPage;

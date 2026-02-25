import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
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
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold">Medicine Reminders</h1>
              {!showForm && (
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  <Plus size={18} className="mr-2" />
                  Add Reminder
                </Button>
              )}
            </div>

            {showForm && (
              <Card className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Add New Reminder</h2>
                <form onSubmit={handleSubmit}>
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

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? 'Adding...' : 'Add Reminder'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
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
                  <Card key={reminder.id} className={reminder.status === 'completed' ? 'opacity-60 bg-gray-100' : ''}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <Pill size={32} className={`mt-1 ${reminder.status === 'active' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-xl font-bold ${reminder.status === 'completed' ? 'line-through' : ''}`}>
                              {reminder.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${reminder.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                              }`}>
                              {reminder.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{reminder.description}</p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 font-medium">Date:</span>
                              <span className="font-semibold">{reminder.reminder_date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 font-medium">Time:</span>
                              <span className="font-semibold">{reminder.reminder_time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={reminder.status === 'active' ? 'success' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(reminder)}
                        >
                          {reminder.status === 'active' ? 'Complete' : 'Reopen'}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(reminder.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Pill size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-4">No medicine reminders set yet</p>
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  Add Your First Reminder
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default MedicineRemindersPage;

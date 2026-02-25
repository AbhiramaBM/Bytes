import React, { useState, useEffect } from 'react';
import { Heart, Edit2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, Button, Input, Textarea, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const HealthRecordsPage = () => {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: '',
    allergies: '',
    medical_conditions: '',
    weight: '',
    height: '',
    notes: ''
  });

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      const response = await apiClient.get('/patients/health-records');
      const data = response.data.data;
      setRecords(data);
      if (data) {
        setFormData({
          blood_group: data.blood_group || '',
          allergies: data.allergies || '',
          medical_conditions: data.medical_conditions || '',
          weight: data.weight || '',
          height: data.height || '',
          notes: data.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await apiClient.put('/patients/health-records', formData);
      if (response.data.success) {
        alert('Health records updated successfully');
        setEditing(false);
        fetchHealthRecords();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update health records');
    } finally {
      setSaving(false);
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
              <h1 className="text-4xl font-bold">Health Records</h1>
              {!editing && (
                <Button variant="primary" onClick={() => setEditing(true)}>
                  <Edit2 size={18} className="mr-2" />
                  Edit Records
                </Button>
              )}
            </div>

            {editing ? (
              <Card>
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Blood Group"
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                      placeholder="e.g., O+, A-, B+"
                    />

                    <Input
                      label="Height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="e.g., 175 cm"
                    />

                    <Input
                      label="Weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="e.g., 70 kg"
                    />

                    <div className="hidden"> {/* Placeholder to maintain grid if needed */} </div>
                  </div>

                  <Textarea
                    label="Allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="List any allergies"
                    rows="2"
                  />

                  <Textarea
                    label="Medical Conditions"
                    name="medical_conditions"
                    value={formData.medical_conditions}
                    onChange={handleChange}
                    placeholder="List any medical conditions, chronic diseases, or surgical history"
                    rows="3"
                  />

                  {/* Notes are handled separately below */}

                  <Textarea
                    label="Additional Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditing(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <div className="grid gap-6">
                {records ? (
                  <>
                    <Card>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Heart size={24} className="text-red-600" />
                        Basic Information
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm">Blood Group</p>
                          <p className="font-bold text-lg">{records.blood_group || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Height</p>
                          <p className="font-bold text-lg">{records.height || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Weight</p>
                          <p className="font-bold text-lg">{records.weight || 'N/A'}</p>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <h3 className="text-xl font-bold mb-4">Clinical Profile</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">Allergies</p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{records.allergies || 'No allergies reported'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">Medical Conditions</p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{records.medical_conditions || 'No conditions reported'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">Additional Notes</p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">{records.notes || 'No additional notes'}</p>
                        </div>
                      </div>
                    </Card>
                  </>
                ) : (
                  <Card className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg mb-4">No health records added yet</p>
                    <Button variant="primary" onClick={() => setEditing(true)}>
                      Add Health Records
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default HealthRecordsPage;

import React, { useState, useEffect } from 'react';
import { Heart, Edit2 } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold font-display">Health Records</h1>
        {!editing && (
          <Button variant="primary" size="sm" onClick={() => setEditing(true)} className="btn-premium shadow-md font-bold">
            <Edit2 size={16} className="mr-2" />
            Edit Records
          </Button>
        )}
      </div>

      {editing ? (
        <Card className="animate-fadeIn">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
            </div>

            <Textarea
              label="Allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="List any allergies"
              rows="3"
            />

            <Textarea
              label="Medical Conditions"
              name="medical_conditions"
              value={formData.medical_conditions}
              onChange={handleChange}
              placeholder="List any medical conditions, chronic diseases, or surgical history"
              rows="4"
            />

            <Textarea
              label="Additional Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any other relevant health information"
              rows="4"
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={saving}
                className="flex-1 btn-premium shadow-md font-bold"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditing(false)}
                className="flex-1 font-bold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid gap-8 animate-fadeIn">
          {records ? (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 font-display">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Heart size={24} className="text-red-600" />
                  </div>
                  Basic Bio-Metrics
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-sm font-semibold mb-1">Blood Group</p>
                    <p className="font-bold text-2xl text-primary">{records.blood_group || '—'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-sm font-semibold mb-1">Height</p>
                    <p className="font-bold text-2xl text-primary">{records.height || '—'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-sm font-semibold mb-1">Weight</p>
                    <p className="font-bold text-2xl text-primary">{records.weight || '—'}</p>
                  </div>
                </div>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold mb-6 font-display">Clinical Profile</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 px-1">Major Allergies</p>
                    <p className="text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[60px]">
                      {records.allergies || 'No allergies reported'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 px-1">Medical Conditions</p>
                    <p className="text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[60px]">
                      {records.medical_conditions || 'No conditions reported'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 px-1">Personal Notes</p>
                    <p className="text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100 italic min-h-[60px]">
                      {records.notes || 'No additional notes provided'}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="text-center py-16 border-dashed border-2">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Heart size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Health Records Found</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Complete your medical profile to help doctors provide better care.</p>
              <Button variant="primary" size="sm" onClick={() => setEditing(true)} className="btn-premium px-10 font-bold shadow-lg shadow-blue-100">
                Create Medical Profile
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthRecordsPage;

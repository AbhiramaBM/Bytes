import React, { useState, useEffect } from 'react';
import { Trash2, Plus, MapPin, Phone, Mail } from 'lucide-react';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';

const AdminClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/admin/clinics');
      setClinics(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching clinics:', error);
      setError(error.response?.data?.message || 'Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.city) {
        setError('Name and city are required');
        return;
      }

      const response = await apiClient.post('/admin/clinics', formData);
      setClinics([response.data.data, ...clinics]);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        email: ''
      });
      setShowForm(false);
      setError('');
    } catch (error) {
      console.error('❌ Error adding clinic:', error);
      setError(error.response?.data?.message || 'Failed to add clinic');
    }
  };

  const handleDeleteClinic = async (clinicId) => {
    if (!window.confirm('Are you sure you want to delete this clinic?')) return;

    try {
      await apiClient.delete(`/admin/clinics/${clinicId}`);
      setClinics(clinics.filter(c => c._id !== clinicId));
    } catch (error) {
      console.error('❌ Error deleting clinic:', error);
      setError(error.response?.data?.message || 'Failed to delete clinic');
    }
  };

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Clinics</h1>
            <p className="text-gray-600 mt-2">Manage all clinics in the system</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Clinic
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Add Clinic Form */}
        {showForm && (
          <Card className="mb-6 p-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">Add New Clinic</h2>
            <form onSubmit={handleAddClinic} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Clinic Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Add Clinic
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by clinic name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Clinics List */}
        {filteredClinics.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No clinics found</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredClinics.map(clinic => (
              <Card key={clinic._id} className="p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      {clinic.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{clinic.address}, {clinic.city}{clinic.state ? `, ${clinic.state}` : ''}</span>
                        </div>
                      )}
                      {clinic.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>{clinic.phone}</span>
                        </div>
                      )}
                      {clinic.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          <span>{clinic.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClinic(clinic._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete clinic"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClinics;

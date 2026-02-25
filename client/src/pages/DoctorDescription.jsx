import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Briefcase, Star, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner, Button, Input } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/apiClient';

const DoctorDescription = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching doctor profile...');
      const response = await apiClient.get('/auth/profile');
      console.log('✅ Profile fetched:', response.data);
      setProfile(response.data.data);
      setFormData(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await apiClient.put('/auth/profile', formData);
      setProfile(response.data.data);
      setIsEditing(false);
      setError('');
      console.log('✅ Profile updated');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600 mb-6">Manage your professional information</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {profile && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center">
                    <User size={50} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{profile.fullName}</h2>
                  <p className="text-gray-600 mb-1">Doctor</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star size={16} className="text-yellow-400" />
                    <span className="font-semibold">4.8/5</span>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="w-full">
                      Edit Profile
                    </Button>
                  )}
                </Card>

                {/* Profile Details */}
                <Card className="md:col-span-2">
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <Mail size={20} className="text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold">{profile.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pb-4 border-b">
                        <Phone size={20} className="text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold">{profile.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pb-4 border-b">
                        <MapPin size={20} className="text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold">{profile.city || 'Mumbai'}, {profile.state || 'Maharashtra'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Briefcase size={20} className="text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Specialization</p>
                          <p className="font-semibold">General Medicine</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="Phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="City"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange}
                      />
                      <Input
                        label="State"
                        name="state"
                        value={formData.state || ''}
                        onChange={handleInputChange}
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={handleSave}>
                          Save Changes
                        </Button>
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default DoctorDescription;

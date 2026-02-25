import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, Button, Input, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchMedicalHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      const profile = response.data.data;
      setUser(profile);
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        age: profile.age || '',
        gender: profile.gender || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const response = await apiClient.get('/patients/medical-history');
      setMedicalHistory((response.data.data || []).slice(0, 5));
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await apiClient.put('/auth/profile', formData);
      if (response.data.success) {
        alert('Profile updated successfully');
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
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
          <div className="container mx-auto px-4 py-10 max-w-2xl">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold">My Profile</h1>
              {!editing && (
                <Button variant="primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <Card>
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                  <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="e.g., +91 9876543210" />

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                    <Input label="State" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                  <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />

                  <div className="flex gap-4 mt-6">
                    <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setEditing(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{user.fullName || 'User Name'}</h2>
                      <p className="text-gray-500">{user.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Contact Info</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Phone Number</p>
                          <p className="font-semibold">{user.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold">{user.email}</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Personal Details</h3>
                      <div className="space-y-3">
                        <div className="flex gap-10">
                          <div>
                            <p className="text-xs text-gray-500">Age</p>
                            <p className="font-semibold">{user.age || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="font-semibold capitalize">{user.gender || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <section className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Residential Address</h3>
                    <p className="font-semibold">{user.address || 'Address not set'}</p>
                    <div className="flex gap-4 mt-2">
                      <p className="font-semibold">{user.city}{user.city && ','} {user.state} {user.pincode}</p>
                    </div>
                  </section>
                </div>
              )}
            </Card>

            {/* Medical History / Doctor Notes Section */}
            {!editing && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Medical History / Doctor Notes</h2>
                  <button
                    onClick={() => navigate('/patient/medical-history')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>

                {medicalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {medicalHistory.map((entry, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText size={20} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{entry.doctorName}</p>
                                <p className="text-sm text-gray-500">{entry.specialization}</p>
                              </div>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar size={12} /> {entry.appointmentDate}
                              </span>
                            </div>
                            {entry.diagnosis && (
                              <p className="mt-2 text-sm text-gray-700"><strong>Diagnosis:</strong> {entry.diagnosis}</p>
                            )}
                            {entry.notes && (
                              <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-sm text-gray-700">
                                <strong className="text-yellow-700">Doctor's Notes:</strong> {entry.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-8">
                    <p className="text-gray-400">No medical history yet</p>
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

export default ProfilePage;

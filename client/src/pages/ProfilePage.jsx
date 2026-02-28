import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar } from 'lucide-react';
import { Card, Button, Input, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const getImageUrl = (pathValue) => {
    if (!pathValue) return '';
    if (pathValue.startsWith('http')) return pathValue;
    const apiBase = apiClient.defaults.baseURL || '';
    const host = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
    return `${host}${pathValue}`;
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!selectedImage) return;
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append('profileImage', selectedImage);
      const res = await apiClient.post('/auth/profile/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        await fetchProfile();
        setSelectedImage(null);
        setPreviewImage('');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
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
  if (!user) return <div className="p-10 text-center">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">My Profile</h1>
        {!editing && (
          <Button variant="primary" size="sm" onClick={() => setEditing(true)} className="btn-premium font-bold shadow-lg shadow-blue-100">
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
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                >
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
              <Button type="submit" variant="success" size="sm" disabled={saving} className="flex-1 font-bold btn-premium shadow-lg shadow-green-100">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)} className="flex-1 font-bold bg-white border-gray-200">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-sm">
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold italic shadow-lg">
                {user.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt="profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  user.fullName ? user.fullName[0].toUpperCase() : 'U'
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">{user.fullName || 'User Name'}</h2>
                <p className="text-gray-500 font-medium">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageSelect} />
              {previewImage && <img src={previewImage} alt="preview" className="w-20 h-20 rounded-full object-cover border" />}
              <Button type="button" size="sm" variant="secondary" onClick={uploadImage} disabled={!selectedImage || uploadingImage}>
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Contact Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="font-bold text-gray-800">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="font-bold text-gray-800">{user.email}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Personal Details</h3>
                <div className="space-y-3">
                  <div className="flex gap-10">
                    <div>
                      <p className="text-xs text-gray-400">Age</p>
                      <p className="font-bold text-gray-800">{user.age || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Gender</p>
                      <p className="font-bold text-gray-800 capitalize">{user.gender || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="pt-6 border-t border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Residential Address</h3>
              <p className="font-bold text-gray-800 leading-relaxed">{user.address || 'Address not set'}</p>
              {(user.city || user.state || user.pincode) && (
                <p className="font-bold text-gray-600 mt-1 italic">
                  {user.city}{user.city && ','} {user.state} {user.pincode}
                </p>
              )}
            </section>
          </div>
        )}
      </Card>

      {!editing && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Clinical Narrative</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Recent Medical History</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patient/medical-history')}
              className="text-blue-600 font-black"
            >
              View Full History →
            </Button>
          </div>

          {medicalHistory.length > 0 ? (
            <div className="space-y-4">
              {medicalHistory.map((entry, idx) => (
                <Card key={idx} className="hover:shadow-md transition-all border-l-4 border-l-blue-100 group">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{entry.doctorName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{entry.specialization}</p>
                        </div>
                        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md font-black text-gray-400 flex items-center gap-1 uppercase">
                          <Calendar size={10} /> {entry.appointmentDate}
                        </span>
                      </div>
                      {entry.diagnosis && (
                        <p className="mt-3 text-sm text-gray-700 font-medium">
                          <span className="text-blue-600 font-bold">Diagnosis:</span> {entry.diagnosis}
                        </p>
                      )}
                      {entry.notes && (
                        <div className="mt-3 bg-amber-50/50 border border-amber-100 p-3 rounded-xl text-sm italic text-gray-700">
                          <span className="text-amber-700 font-bold block mb-1 uppercase tracking-widest text-[10px]">Doctor's Remarks:</span>
                          "{entry.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 border-dashed border-2 border-gray-200 bg-transparent">
              <p className="text-gray-400 font-bold italic">No medical narrative found on this node.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

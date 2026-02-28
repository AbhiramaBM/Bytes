import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Phone, Stethoscope, Briefcase, DollarSign, Fingerprint, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { Button, Input } from '../components/UI';
import apiClient from '../utils/apiClient';

const AddDoctor = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        googleMapsLink: '',
        specialization: '',
        experience: '',
        registrationNumber: '',
        consultationFee: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await apiClient.post('/admin/doctors', formData);
            setMessage({ type: 'success', text: 'Doctor profile created successfully!' });
            setFormData({
                email: '',
                password: '',
                fullName: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                latitude: '',
                longitude: '',
                googleMapsLink: '',
                specialization: '',
                experience: '',
                registrationNumber: '',
                consultationFee: ''
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to create doctor profile'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <UserPlus className="text-blue-600" size={32} />
                    Onboard New Doctor
                </h1>
                <p className="text-gray-600 mt-2">Create a professional profile for the healthcare provider.</p>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Account Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="Dr. Jane Smith"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="jane.smith@ruralcare.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="Clinic street address"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <input name="city" required value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition" placeholder="City" />
                                <input name="state" required value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition" placeholder="State" />
                                <input name="pincode" required value={formData.pincode} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition" placeholder="Pincode" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition" placeholder="Latitude" />
                                <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition" placeholder="Longitude" />
                            </div>

                            <input name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition" placeholder="Google Maps link (optional)" />
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Professional Profile</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <div className="relative">
                                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="Cardiology, General Medicine..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="10+ years"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                <div className="relative">
                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        required
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="REG-12345678"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        name="consultationFee"
                                        value={formData.consultationFee}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                        placeholder="50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        variant="primary"
                        size="sm"
                        className="font-bold flex items-center gap-2 btn-premium shadow-lg shadow-blue-200"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Profile...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Create Doctor Profile
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddDoctor;

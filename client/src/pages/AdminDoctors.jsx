import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, UserMinus, Mail, Phone, Stethoscope, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/UI';
import apiClient from '../utils/apiClient';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState('');
    const [error, setError] = useState('');

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/admin/doctors`, {
                params: { search, isActive: isActiveFilter || undefined }
            });
            setDoctors(response.data.data);
        } catch (err) {
            setError('Failed to fetch doctors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [search, isActiveFilter]);

    const toggleStatus = async (doctorId, currentStatus) => {
        try {
            await apiClient.put(`/admin/doctors/${doctorId}/status`,
                { isActive: !currentStatus }
            );
            setDoctors(doctors.map(d => d._id === doctorId ? { ...d, isActive: !currentStatus ? 1 : 0 } : d));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const deactivateDoctor = async (doctorId) => {
        if (!window.confirm('Are you sure you want to deactivate this doctor? This will soft-delete their user account.')) return;
        try {
            await apiClient.delete(`/admin/doctors/${doctorId}`);
            setDoctors(doctors.filter(d => d._id !== doctorId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to deactivate doctor');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Doctor Management</h1>
                    <p className="text-gray-600">Overview of all healthcare providers in the system.</p>
                </div>
                <Button
                    onClick={fetchDoctors}
                    variant="ghost"
                    size="sm"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                >
                    <RefreshCw size={24} />
                </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search name, specialization..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        value={isActiveFilter}
                        onChange={(e) => setIsActiveFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="true">Active Only</option>
                        <option value="false">Inactive Only</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : doctors.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                    <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">No doctors found matching filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {doctors.map((doc) => (
                        <div key={doc._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                                            {doc.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{doc.fullName}</h3>
                                            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                                                <Stethoscope size={14} />
                                                {doc.specialization}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${doc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {doc.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Mail size={16} className="text-gray-400" />
                                        {doc.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <Phone size={16} className="text-gray-400" />
                                        {doc.phone || 'No phone'}
                                    </div>
                                    <div className="col-span-2 text-gray-400 text-xs font-mono uppercase tracking-wider">
                                        REG: {doc.registrationNumber || 'Pending'}
                                    </div>
                                </div>

                                <div className="flex gap-2 border-t pt-4">
                                    <Button
                                        size="sm"
                                        variant={doc.isActive ? 'secondary' : 'success'}
                                        onClick={() => toggleStatus(doc._id, !!doc.isActive)}
                                        className={`flex-1 font-bold ${doc.isActive ? 'bg-white border-gray-200' : 'btn-premium shadow-lg shadow-green-100'}`}
                                    >
                                        {doc.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                        {doc.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => deactivateDoctor(doc._id)}
                                        className="flex-1 font-bold border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        <UserMinus size={16} />
                                        Delete Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDoctors;

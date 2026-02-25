import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Mail, Phone, Calendar, Heart, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminPatients = () => {
    const { token } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/patients`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search }
            });
            setPatients(response.data.data);
        } catch (err) {
            setError('Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [search]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Patient Registry</h1>
                    <p className="text-gray-600">Manage patient profiles and clinical history.</p>
                </div>
                <button
                    onClick={fetchPatients}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                >
                    <RefreshCw size={24} />
                </button>
            </div>

            <div className="mb-6 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : patients.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                    <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">No patients found.</p>
                </div>
            ) : (
                <div className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Patient</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Contact</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Medical Summary</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Joined</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {patients.map((p) => (
                                <tr key={p.patientId} className="hover:bg-blue-50/30 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                                                {p.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{p.fullName}</p>
                                                <p className="text-xs text-gray-500 font-mono">{p.patientId.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={14} className="text-gray-400" />
                                                {p.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={14} className="text-gray-400" />
                                                {p.phone || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Heart size={14} className="text-red-500" />
                                                <span className="text-sm font-bold text-gray-700">{p.bloodGroup || 'Not set'}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {p.medicalHistory || 'No history recorded'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="View Records">
                                            <FileText size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPatients;

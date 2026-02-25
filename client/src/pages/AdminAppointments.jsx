import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Filter, RefreshCw, AlertCircle, Clock, CheckCircle2, XCircle, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminAppointments = () => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/appointments`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: statusFilter || undefined, search }
            });
            setAppointments(response.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [statusFilter, search]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'appointed': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Appointment Master</h1>
                    <p className="text-gray-600">Complete schedule and clinical timeline overview.</p>
                </div>
                <button
                    onClick={fetchAppointments}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                >
                    <RefreshCw size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search patient or doctor..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="appointed">Arrived</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                    <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">No appointments found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {appointments.map((appt) => (
                        <div key={appt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-6 lg:border-r lg:pr-6 min-w-[250px]">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-blue-600">{new Date(appt.appointmentDate).getDate()}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase">
                                            {new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-700 font-bold">
                                            <Clock size={14} className="text-blue-500" />
                                            {appt.appointmentTime}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{appt.reason || 'Routine Checkup'}</p>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Patient</p>
                                            <p className="font-bold text-gray-800">{appt.patientName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                            <Stethoscope size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Doctor</p>
                                            <p className="font-bold text-gray-800">{appt.doctorName}</p>
                                            <p className="text-xs text-blue-600 italic">{appt.specialization}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:text-right min-w-[150px]">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase border ${getStatusStyle(appt.status)}`}>
                                        {appt.status === 'completed' && <CheckCircle2 size={14} />}
                                        {appt.status === 'rejected' && <XCircle size={14} />}
                                        {appt.status}
                                    </span>
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">ID: {appt.id.substring(0, 8)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;

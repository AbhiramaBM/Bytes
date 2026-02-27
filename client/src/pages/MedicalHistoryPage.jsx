import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Pill, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

const MedicalHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await apiClient.get('/patients/medical-history');
            setHistory(response.data.data || []);
        } catch (error) {
            console.error('Error fetching medical history:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Medical History</h1>
            <p className="text-gray-500 mb-8 font-medium">Your complete medical records from all consultations</p>

            {history.length > 0 ? (
                <div className="space-y-6">
                    {history.map((entry, idx) => (
                        <Card key={entry.prescriptionId || idx} className="hover:shadow-md transition-shadow">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-3 rounded-xl">
                                        <FileText size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">{entry.doctorName}</h3>
                                        <p className="text-sm font-bold text-blue-600 uppercase tracking-tight mt-0.5">{entry.specialization}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs font-bold text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" /> {entry.appointmentDate}
                                            </span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">{entry.appointmentTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleExpand(entry.prescriptionId)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    {expandedId === entry.prescriptionId ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </button>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                {/* Reason for Visit */}
                                {entry.reason && (
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reason for Visit</p>
                                        <p className="text-gray-700 text-sm font-medium">{entry.reason}</p>
                                    </div>
                                )}

                                {/* Diagnosis */}
                                {entry.diagnosis && (
                                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-50">
                                        <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1">Diagnosis</p>
                                        <p className="text-gray-800 text-sm font-bold">{entry.diagnosis}</p>
                                    </div>
                                )}
                            </div>

                            {/* Doctor Notes — highlighted */}
                            {entry.notes && (
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4">
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Doctor's Clinical Notes</p>
                                    <p className="text-gray-800 text-sm leading-relaxed">{entry.notes}</p>
                                </div>
                            )}

                            {/* Expanded: Medicines */}
                            {expandedId === entry.prescriptionId && entry.medicines && entry.medicines.length > 0 && (
                                <div className="border rounded-xl overflow-hidden mt-6 bg-white animate-fadeIn">
                                    <div className="bg-gray-50 px-4 py-3 border-b">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <Pill size={14} className="text-blue-500" /> Prescribed Medicines ({entry.medicines.length})
                                        </p>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="text-left px-4 py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Medicine</th>
                                                <th className="text-left px-4 py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Dosage</th>
                                                <th className="text-left px-4 py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Frequency</th>
                                                <th className="text-left px-4 py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {entry.medicines.map((med, mIdx) => (
                                                <tr key={mIdx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-4 font-bold text-gray-900">{med.name}</td>
                                                    <td className="px-4 py-4 text-blue-600 font-bold">{med.dosage || '-'}</td>
                                                    <td className="px-4 py-4 text-gray-600 font-medium">{med.frequency || '-'}</td>
                                                    <td className="px-4 py-4 text-gray-600 font-medium">{med.duration || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-20 bg-gray-50/30 border-dashed border-2">
                    <ClipboardList size={64} className="mx-auto text-gray-200 mb-6" />
                    <p className="text-gray-500 text-xl font-bold">No medical records yet</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Your consultation history will be safely stored here after your first doctor visit.</p>
                </Card>
            )}
        </div>
    );
};

export default MedicalHistoryPage;

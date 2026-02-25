import React, { useState, useEffect } from 'react';
import { Calendar, User, FileText, Pill, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
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
        <>
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
                    <div className="container mx-auto px-4 py-10 max-w-4xl">
                        <h1 className="text-4xl font-bold mb-2">Medical History</h1>
                        <p className="text-gray-600 mb-8">Your complete medical records from all consultations</p>

                        {history.length > 0 ? (
                            <div className="space-y-6">
                                {history.map((entry, idx) => (
                                    <Card key={entry.prescriptionId || idx} className="hover:shadow-lg transition-shadow">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-blue-100 p-3 rounded-lg">
                                                    <FileText size={24} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{entry.doctorName}</h3>
                                                    <p className="text-sm text-gray-500">{entry.specialization}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={14} /> {entry.appointmentDate}
                                                        </span>
                                                        <span>at {entry.appointmentTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleExpand(entry.prescriptionId)}
                                                className="text-gray-400 hover:text-gray-700 p-1"
                                            >
                                                {expandedId === entry.prescriptionId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </div>

                                        {/* Reason for Visit */}
                                        {entry.reason && (
                                            <div className="mb-3 text-sm">
                                                <span className="font-semibold text-gray-600">Reason: </span>
                                                <span className="text-gray-700">{entry.reason}</span>
                                            </div>
                                        )}

                                        {/* Diagnosis */}
                                        {entry.diagnosis && (
                                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                                                <p className="text-xs font-bold uppercase text-blue-600 mb-1">Diagnosis</p>
                                                <p className="text-gray-800 font-medium">{entry.diagnosis}</p>
                                            </div>
                                        )}

                                        {/* Doctor Notes — highlighted */}
                                        {entry.notes && (
                                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
                                                <p className="text-xs font-bold uppercase text-yellow-700 mb-1">Doctor's Notes</p>
                                                <p className="text-gray-800">{entry.notes}</p>
                                            </div>
                                        )}

                                        {/* Expanded: Medicines */}
                                        {expandedId === entry.prescriptionId && entry.medicines && entry.medicines.length > 0 && (
                                            <div className="border rounded-lg overflow-hidden mt-4">
                                                <div className="bg-gray-100 px-4 py-2">
                                                    <p className="text-xs font-bold uppercase text-gray-600 flex items-center gap-1">
                                                        <Pill size={14} /> Prescribed Medicines ({entry.medicines.length})
                                                    </p>
                                                </div>
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="text-left px-4 py-2 font-semibold text-gray-600">Medicine</th>
                                                            <th className="text-left px-4 py-2 font-semibold text-gray-600">Dosage</th>
                                                            <th className="text-left px-4 py-2 font-semibold text-gray-600">Frequency</th>
                                                            <th className="text-left px-4 py-2 font-semibold text-gray-600">Duration</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entry.medicines.map((med, mIdx) => (
                                                            <tr key={mIdx} className="border-t">
                                                                <td className="px-4 py-2 font-medium">{med.name}</td>
                                                                <td className="px-4 py-2 text-gray-600">{med.dosage || '-'}</td>
                                                                <td className="px-4 py-2 text-gray-600">{med.frequency || '-'}</td>
                                                                <td className="px-4 py-2 text-gray-600">{med.duration || '-'}</td>
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
                            <Card className="text-center py-16">
                                <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">No medical history yet</p>
                                <p className="text-gray-400 text-sm mt-2">Your consultation records will appear here after doctor visits</p>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default MedicalHistoryPage;

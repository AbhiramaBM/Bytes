import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Pill, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner, Button } from '../components/UI';
import apiClient from '../utils/apiClient';

export const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await apiClient.get('/patients/prescriptions');
      setPrescriptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
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
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-10">My Prescriptions</h1>

            {prescriptions.length > 0 ? (
              <div className="grid gap-6">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <FileText size={32} className="text-blue-600" />
                        <div>
                          <p className="font-bold text-lg">Prescription from {prescription.doctorName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={16} />
                              {prescription.appointmentDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(prescription.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedId === prescription.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>

                    {/* Diagnosis */}
                    {prescription.diagnosis && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800 mb-1">Diagnosis</p>
                        <p className="text-gray-800">{prescription.diagnosis}</p>
                      </div>
                    )}

                    {/* Medicines Table */}
                    {prescription.medicines && prescription.medicines.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden mb-4">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-700">Medicine</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-700">Dosage</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-700">Frequency</th>
                              <th className="text-left px-4 py-2 font-semibold text-gray-700">Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.medicines.map((med, idx) => (
                              <tr key={med.id || idx} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                                <td className="px-4 py-2 font-medium text-gray-900">{med.name}</td>
                                <td className="px-4 py-2 text-gray-700">{med.dosage || '-'}</td>
                                <td className="px-4 py-2 text-gray-700">{med.frequency || '-'}</td>
                                <td className="px-4 py-2 text-gray-700">{med.duration || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">No medicines listed</p>
                    )}

                    {/* Notes (expanded) */}
                    {expandedId === prescription.id && prescription.notes && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Doctor's Notes</p>
                        <p className="text-gray-700">{prescription.notes}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Pill size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No prescriptions yet</p>
              </Card>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PrescriptionsPage;

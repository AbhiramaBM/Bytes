import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Pill, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/UI';
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">My Prescriptions</h1>

      {prescriptions.length > 0 ? (
        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <FileText size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-gray-900">Dr. {prescription.doctorName}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mt-1">
                      <Calendar size={16} />
                      {prescription.appointmentDate}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleExpand(prescription.id)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {expandedId === prescription.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {/* Diagnosis */}
              {prescription.diagnosis && (
                <div className="mb-6 p-4 bg-blue-50/50 border-l-4 border-blue-500 rounded-r-xl">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Final Diagnosis</p>
                  <p className="text-gray-800 font-medium leading-relaxed">{prescription.diagnosis}</p>
                </div>
              )}

              {/* Medicines Table */}
              {prescription.medicines && prescription.medicines.length > 0 ? (
                <div className="border rounded-xl overflow-hidden mb-4 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3 font-bold text-gray-600 uppercase text-[10px] tracking-widest">#</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Medicine & Dosage</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Frequency</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {prescription.medicines.map((med, idx) => (
                        <tr key={med.id || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="px-4 py-4">
                            <p className="font-bold text-gray-900">{med.name}</p>
                            <p className="text-xs text-blue-600 font-medium">{med.dosage || '-'}</p>
                          </td>
                          <td className="px-4 py-4 text-gray-700 font-medium">{med.frequency || '-'}</td>
                          <td className="px-4 py-4 text-gray-700 font-medium">{med.duration || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl mb-4 italic text-gray-400 text-sm">
                  No specific medicines prescribed
                </div>
              )}

              {/* Notes (expanded) */}
              {expandedId === prescription.id && prescription.notes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mt-4">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Additional Instructions</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{prescription.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-24 bg-gray-50/50 border-dashed border-2">
          <Pill size={64} className="mx-auto text-gray-300 mb-6" />
          <p className="text-gray-600 text-xl font-medium">No prescriptions found</p>
          <p className="text-gray-400 text-sm mt-2">Your medical prescriptions will appear here after your checkups.</p>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionsPage;

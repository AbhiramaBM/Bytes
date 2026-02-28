import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Pill, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button, Card, LoadingSpinner } from '../components/UI';
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
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800 font-display">Medical Vault</h1>
        <p className="text-gray-500 mt-1">Your secure digital repository for prescriptions and health reports</p>
      </div>

      {prescriptions.length > 0 ? (
        <div className="grid gap-8 animate-fadeIn">
          {prescriptions.map((prescription) => (
            <Card key={prescription._id} className="hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden shadow-lg group">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <FileText size={32} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Prescribed By</p>
                      <p className="font-bold text-2xl text-gray-900 leading-tight">
                        Dr. {prescription.doctorId?.fullName || prescription.doctorName || 'Healthcare Provider'}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary mt-1">
                        <Calendar size={16} />
                        {prescription.appointmentId?.appointmentDate || prescription.appointmentDate}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleExpand(prescription._id)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-primary p-3"
                  >
                    {expandedId === prescription._id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </Button>
                </div>

                {/* Diagnosis */}
                {prescription.diagnosis && (
                  <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-primary rounded-r-2xl shadow-sm">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      Clinical Diagnosis
                    </p>
                    <p className="text-gray-800 font-bold text-lg leading-relaxed">{prescription.diagnosis}</p>
                  </div>
                )}

                {prescription.paymentRequired && (
                  <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <p className="text-sm font-bold text-amber-800">
                      Payment Pending: {prescription.currency || 'INR'} {prescription.totalAmount || 0}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">Complete payment to unlock full prescription details.</p>
                    {prescription.paymentLink && (
                      <a
                        href={prescription.paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-3 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700"
                      >
                        Pay Now
                      </a>
                    )}
                  </div>
                )}

                {/* Medicines Table */}
                {prescription.medicines && prescription.medicines.length > 0 ? (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6 bg-white shadow-sm transition-all duration-300 group-hover:border-primary/20">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                          <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">#</th>
                          <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Medicine & Dosage</th>
                          <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Frequency</th>
                          <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {prescription.medicines.map((med, idx) => (
                          <tr key={med._id || idx} className="hover:bg-primary/[0.02] transition-colors">
                            <td className="px-6 py-5 text-gray-400 font-bold">{idx + 1}</td>
                            <td className="px-6 py-5">
                              <p className="font-bold text-gray-900 text-base">{med.name}</p>
                              <p className="text-xs text-primary font-bold mt-0.5 inline-block bg-primary/5 px-2 py-0.5 rounded uppercase tracking-tighter">{med.dosage || '-'}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs">{med.frequency || '-'}</span>
                            </td>
                            <td className="px-6 py-5 text-gray-600 font-medium">
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" />
                                {med.duration || '-'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl mb-6 italic text-gray-400 font-medium border-2 border-dashed border-gray-100">
                    No pharmacological interventions prescribed
                  </div>
                )}

                {/* Notes (expanded) */}
                {expandedId === prescription._id && prescription.notes && (
                  <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 mt-6 shadow-inner animate-slideDown">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Pill size={14} />
                      Physician's Remarks
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed font-medium italic">{prescription.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-24 bg-white shadow-xl border-t-4 border-t-primary animate-fadeIn flex flex-col items-center">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Pill size={64} className="text-blue-200" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Workspace Empty</h2>
          <p className="text-gray-500 max-w-sm mb-10 leading-relaxed text-lg italic">Your clinical records will be securely archived here after your consultations.</p>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionsPage;

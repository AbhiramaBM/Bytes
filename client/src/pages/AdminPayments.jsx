import React, { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button, Card, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

const AdminPayments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState('');

  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/prescriptions/pending-payments');
      setRows(res.data.data || []);
    } catch (_error) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleUnlock = async (prescriptionId) => {
    const reason = window.prompt('Reason for admin unlock payment:', 'manual verification complete');
    if (!reason) return;

    try {
      setUnlockingId(prescriptionId);
      await apiClient.post(`/admin/prescriptions/${prescriptionId}/unlock-payment`, { reason });
      await fetchRows();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unlock payment');
    } finally {
      setUnlockingId('');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payment Completion</h1>
          <p className="text-gray-500">Unlock pending prescription payments manually when required.</p>
        </div>
        <Button size="sm" variant="secondary" onClick={fetchRows} className="inline-flex items-center gap-2">
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <Card>
        {rows.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ShieldCheck size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No pending prescription payments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Patient</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Doctor</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Appointment</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{row.patient?.fullName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{row.patient?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{row.doctor?.fullName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{row.doctor?.specialization || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.appointment?.appointmentDate || '-'} {row.appointment?.appointmentTime || ''}
                    </td>
                    <td className="px-4 py-3 font-semibold text-amber-700">
                      {row.currency} {row.totalAmount}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUnlock(row._id)}
                        disabled={unlockingId === row._id}
                        className="inline-flex items-center gap-2"
                      >
                        <CheckCircle2 size={14} />
                        {unlockingId === row._id ? 'Unlocking...' : 'Mark Paid'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminPayments;


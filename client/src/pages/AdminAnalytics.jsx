import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Calendar, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching analytics...');
      const response = await apiClient.get('/admin/analytics');
      console.log('✅ Analytics fetched:', response.data);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      setError(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const {
    appointmentStats = {},
    userTrends = []
  } = analytics || {};

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">System performance and user statistics</p>
              </div>
              <div>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold">{appointmentStats.totalAppointments || 0}</p>
                  </div>
                  <Calendar size={40} className="text-blue-400 opacity-50" />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{appointmentStats.completedAppointments || 0}</p>
                  </div>
                  <TrendingUp size={40} className="text-green-400 opacity-50" />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{appointmentStats.pendingAppointments || 0}</p>
                  </div>
                  <AlertCircle size={40} className="text-yellow-400 opacity-50" />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {appointmentStats.totalAppointments
                        ? Math.round((appointmentStats.completedAppointments / appointmentStats.totalAppointments) * 100)
                        : 0}%
                    </p>
                  </div>
                  <BarChart3 size={40} className="text-purple-400 opacity-50" />
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Appointment Status Distribution */}
              <Card>
                <h2 className="text-xl font-bold mb-4">Appointment Status Distribution</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Completed', value: appointmentStats.completedAppointments || 0, color: 'bg-green-500' },
                    { label: 'Pending', value: appointmentStats.pendingAppointments || 0, color: 'bg-yellow-500' },
                    { label: 'Cancelled', value: (appointmentStats.totalAppointments || 0) - (appointmentStats.completedAppointments || 0) - (appointmentStats.pendingAppointments || 0), color: 'bg-red-500' },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span>{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{
                            width: `${appointmentStats.totalAppointments ? (item.value / appointmentStats.totalAppointments) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* User Registration Trends */}
              <Card>
                <h2 className="text-xl font-bold mb-4">New User Registrations</h2>
                <div className="space-y-3">
                  {userTrends && userTrends.length > 0 ? (
                    userTrends.map((trend, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{trend._id || 'Date'}</span>
                          <span className="font-semibold">{trend.newUsers || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((trend.newUsers / 10) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No data available</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <h2 className="text-xl font-bold mb-4">System Activity Summary</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-gray-600 text-sm">Last 24 Hours</p>
                  <p className="text-2xl font-bold">
                    {userTrends && userTrends.length > 0 ? userTrends[userTrends.length - 1].newUsers : 0} new registrations
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-gray-600 text-sm">Peak Hours</p>
                  <p className="text-2xl font-bold">9:00 AM - 12:00 PM</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-gray-600 text-sm">System Uptime</p>
                  <p className="text-2xl font-bold">99.8%</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default AdminAnalytics;

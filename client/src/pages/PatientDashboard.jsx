import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Pill, AlertCircle, Users, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const PatientDashboard = () => {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    pastAppointments: 0,
    prescriptions: 0,
    reminders: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      setLoading(true);
      const [apptRes, prescRes] = await Promise.all([
        apiClient.get('/patients/appointments'),
        apiClient.get('/patients/prescriptions')
      ]);

      const appts = apptRes.data.data || [];
      const upcoming = appts.filter(a => ['pending', 'approved', 'appointed'].includes(a.status)).length;
      const past = appts.filter(a => a.status === 'completed').length;
      const prescs = prescRes.data.data || [];

      setStats({
        upcomingAppointments: upcoming,
        pastAppointments: past,
        prescriptions: prescs.length,
        reminders: 0
      });

      setAppointments(appts.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar userRole="patient" />
        <main className="flex-1 md:ml-64 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Patient Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-10">
              {[
                { icon: Calendar, label: 'Upcoming', value: stats.upcomingAppointments, color: 'blue' },
                { icon: Heart, label: 'Past', value: stats.pastAppointments, color: 'red' },
                { icon: Pill, label: 'Prescriptions', value: stats.prescriptions, color: 'green' },
                { icon: AlertCircle, label: 'Reminders', value: stats.reminders, color: 'purple' }
              ].map((stat, idx) => (
                <Card key={idx} className={`border-l-4 border-l-${stat.color === 'blue' ? 'blue' : stat.color === 'red' ? 'red' : stat.color === 'green' ? 'green' : 'purple'}-500`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <stat.icon size={24} className={`text-${stat.color === 'blue' ? 'blue' : stat.color === 'red' ? 'red' : stat.color === 'green' ? 'green' : 'purple'}-500 opacity-60`} />
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Appointments */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex items-center justify-between mb-6 pb-2 border-b">
                    <h2 className="text-xl font-bold">Recent Appointments</h2>
                    <span className="text-sm text-blue-600 font-medium">View all</span>
                  </div>
                  {appointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Doctor</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Date/Time</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appt) => (
                            <tr key={appt.id} className="border-b hover:bg-gray-50 transition">
                              <td className="px-4 py-3 font-medium text-gray-900">{appt.doctorName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{appt.appointmentDate} at {appt.appointmentTime}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  appt.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                    appt.status === 'appointed' ? 'bg-indigo-100 text-indigo-700' :
                                      appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        'bg-red-100 text-red-700'
                                  }`}>
                                  {appt.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 italic">
                      No appointments booked yet.
                    </div>
                  )}
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="hover:border-blue-500 border-2 border-transparent transition cursor-pointer">
                  <div className="flex gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Calendar size={24} /></div>
                    <div>
                      <h3 className="font-bold text-gray-800">Book Now</h3>
                      <p className="text-sm text-gray-500">Consult with a specialist</p>
                    </div>
                  </div>
                </Card>
                <Card className="hover:border-green-500 border-2 border-transparent transition cursor-pointer">
                  <div className="flex gap-4">
                    <div className="bg-green-100 p-3 rounded-lg text-green-600"><Pill size={24} /></div>
                    <div>
                      <h3 className="font-bold text-gray-800">Prescriptions</h3>
                      <p className="text-sm text-gray-500">View latest medical orders</p>
                    </div>
                  </div>
                </Card>
                <Card className="hover:border-red-500 border-2 border-transparent transition cursor-pointer">
                  <div className="flex gap-4">
                    <div className="bg-red-100 p-3 rounded-lg text-red-600"><Heart size={24} /></div>
                    <div>
                      <h3 className="font-bold text-gray-800">Checkups</h3>
                      <p className="text-sm text-gray-500">Regular wellness checks</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PatientDashboard;

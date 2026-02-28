import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Pill, AlertCircle, ChevronRight, Info, Brain } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const PatientDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    pastAppointments: 0,
    prescriptions: 0,
    reminders: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      setLoading(true);
      const [apptRes, prescRes, reminderRes] = await Promise.all([
        apiClient.get('/patients/appointments'),
        apiClient.get('/patients/prescriptions'),
        apiClient.get('/patients/medicine-reminders')
      ]);

      const appts = apptRes.data.data || [];
      const upcoming = appts.filter(a => ['booked', 'pending', 'approved', 'appointed'].includes(a.status)).length;
      const past = appts.filter(a => a.status === 'completed').length;
      const prescs = prescRes.data.data || [];
      const reminders = reminderRes.data.data || [];
      const activeReminders = reminders
        .filter((item) => item.status === 'active')
        .sort((a, b) => `${a.reminder_date} ${a.reminder_time}`.localeCompare(`${b.reminder_date} ${b.reminder_time}`));

      setStats({
        upcomingAppointments: upcoming,
        pastAppointments: past,
        prescriptions: prescs.length,
        reminders: activeReminders.length
      });

      setAppointments(appts.slice(0, 5));
      setUpcomingReminders(activeReminders.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
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
          <Card key={idx} className={`border-l-4 border-l-${stat.color === 'blue' ? 'blue' : stat.color === 'red' ? 'red' : stat.color === 'green' ? 'green' : 'purple'}-500 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
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
              <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs font-bold border-gray-200 bg-white hover:bg-gray-50 px-4"
                onClick={() => navigate('/patient/appointments')}
              >
                View all
              </Button>
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
                      <tr key={appt._id} className="border-b hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{appt.doctorName || 'Doctor'}</p>
                          <p className="text-xs text-gray-500">{appt.specialization || 'Healthcare'}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div className="font-medium text-gray-900">{appt.appointmentDate}</div>
                          <div className="text-xs">{appt.appointmentTime}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize shadow-sm ${appt.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            appt.status === 'approved' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              appt.status === 'appointed' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                appt.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                  'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${appt.status === 'pending' ? 'bg-amber-500' :
                              appt.status === 'approved' ? 'bg-blue-500' :
                                appt.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
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
          <Link to="/patient/book-appointment" className="block">
            <Card className="hover:border-blue-500 border-2 border-transparent transition cursor-pointer group shadow-sm bg-white">
              <div className="flex gap-4 items-center">
                <div className="bg-blue-100 p-4 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  <Calendar size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">Book Now</h3>
                  <p className="text-sm text-gray-500">Expert specialist consultation</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </Card>
          </Link>

          <Link to="/patient/prescriptions" className="block">
            <Card className="hover:border-green-500 border-2 border-transparent transition cursor-pointer group shadow-sm bg-white">
              <div className="flex gap-4 items-center">
                <div className="bg-green-100 p-4 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all shadow-inner">
                  <Pill size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">Prescriptions</h3>
                  <p className="text-sm text-gray-500">Latest medical orders & bills</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-green-500 transition-colors" />
              </div>
            </Card>
          </Link>

          <Link to="/patient/health-records" className="block">
            <Card className="hover:border-red-500 border-2 border-transparent transition cursor-pointer group shadow-sm bg-white">
              <div className="flex gap-4 items-center">
                <div className="bg-red-100 p-4 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                  <Heart size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">Health Vault</h3>
                  <p className="text-sm text-gray-500">Your secure medical profile</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-red-500 transition-colors" />
              </div>
            </Card>
          </Link>

          <Link to="/patient/symptom-checker" className="block">
            <Card className="hover:border-indigo-500 border-2 border-transparent transition cursor-pointer group shadow-sm bg-white">
              <div className="flex gap-4 items-center">
                <div className="bg-indigo-100 p-4 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                  <Brain size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">AI Symptom Check</h3>
                  <p className="text-sm text-gray-500">Instant triage suggestions</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </Card>
          </Link>

          <Link to="/patient/messages" className="block">
            <Card className="hover:border-cyan-500 border-2 border-transparent transition cursor-pointer group shadow-sm bg-white">
              <div className="flex gap-4 items-center">
                <div className="bg-cyan-100 p-4 rounded-xl text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-inner">
                  <AlertCircle size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">Doctor Messages</h3>
                  <p className="text-sm text-gray-500">Direct chat with your doctor</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-cyan-500 transition-colors" />
              </div>
            </Card>
          </Link>

          <Card className="border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Next Medicine Reminders</h3>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder._id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="font-semibold text-gray-900">{reminder.title}</p>
                    <p className="text-xs text-gray-500">{reminder.reminder_date} at {reminder.reminder_time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No active reminders.</p>
            )}
          </Card>

          <Card className="bg-blue-600 text-white border-none shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Health Tip</span>
              </div>
              <p className="font-medium">Stay hydrated! Drink at least 8 glasses of water daily for better kidney health.</p>
            </div>
            <Heart className="absolute -right-4 -bottom-4 text-white/10 rotate-12" size={100} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

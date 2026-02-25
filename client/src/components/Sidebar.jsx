import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Pill, Heart, MessageSquare, LogOut, User, AlertCircle, Users, BarChart3, UserPlus, ClipboardList } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems =
    user?.role === 'patient' ? [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
      { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
      { icon: Pill, label: 'Prescriptions', path: '/patient/prescriptions' },
      { icon: ClipboardList, label: 'Medical History', path: '/patient/medical-history' },
      { icon: Heart, label: 'Health Records', path: '/patient/health-records' },
      { icon: AlertCircle, label: 'Reminders', path: '/patient/medicine-reminders' },
      { icon: MessageSquare, label: 'AI Health Assistant', path: '/patient/ai-chat' },
      { icon: User, label: 'Profile', path: '/patient/profile' },
    ] : user?.role === 'doctor' ? [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
      { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    ] : user?.role === 'admin' ? [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: UserPlus, label: 'Add Doctor', path: '/admin/add-doctor' },
      { icon: Users, label: 'Doctors', path: '/admin/doctors' },
      { icon: User, label: 'Patients', path: '/admin/patients' },
      { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
      { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    ] : [];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen fixed left-0 top-0 pt-20 hidden md:block">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-8 capitalize">{user?.role} Menu</h2>
        <nav className="space-y-2">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname === item.path
                  ? 'bg-white text-blue-600 font-semibold'
                  : 'hover:bg-blue-700'
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))
          ) : (
            <p className="text-blue-100 text-sm">No menu items available</p>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition font-semibold"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Pill, Heart, MessageSquare,
  LogOut, User, AlertCircle, Users, BarChart3,
  UserPlus, ClipboardList, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = user?.role === 'patient' ? [
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
    { icon: MessageSquare, label: 'Messages', path: '/doctor/messages' },
    { icon: User, label: 'Profile', path: '/doctor/description' },
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

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {!isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(true)}
        />
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20 -translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col h-full py-6">
          <div className="flex-1 px-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                  }`}
              >
                <div className={`flex items-center justify-center ${!isOpen ? 'w-full' : ''}`}>
                  <item.icon size={22} className={isActive(item.path) ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                </div>

                {isOpen && (
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}

                {!isOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="px-3 border-t border-gray-50 pt-4">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group relative`}
            >
              <div className={`flex items-center justify-center ${!isOpen ? 'w-full' : ''}`}>
                <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
              </div>

              {isOpen && (
                <span className="font-medium text-sm">Logout</span>
              )}

              {!isOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </button>

            {/* Collapse Toggle (Desktop only) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden md:flex mt-4 items-center justify-center w-full p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


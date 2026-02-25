import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            RuralCare<span className="text-green-600">Connect</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/doctors" className="text-gray-600 hover:text-blue-600 transition">Doctors</Link>
            <Link to="/clinics" className="text-gray-600 hover:text-blue-600 transition">Clinics</Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'patient' && (
                  <>
                    <Link to="/patient/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                    <Link to="/patient/appointments" className="text-gray-600 hover:text-blue-600 transition">Appointments</Link>
                  </>
                )}
                {user?.role === 'doctor' && (
                  <Link to="/doctor/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600 transition">Admin</Link>
                )}
                {user?.role === 'patient' && (
                  <Link to="/patient/ai-chat" className="text-gray-600 hover:text-blue-600 transition">AI Health Assistant</Link>
                )}
                {user?.role === 'patient' && (
                <Link to="/patient/profile" className="text-gray-600 hover:text-blue-600 transition">Profile</Link>
                )}<button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <Link to="/doctors" className="block text-gray-600 hover:text-blue-600 py-2 transition">Doctors</Link>
            <Link to="/clinics" className="block text-gray-600 hover:text-blue-600 py-2 transition">Clinics</Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'patient' && (
                  <>
                    <Link to="/patient/dashboard" className="block text-gray-600 hover:text-blue-600 py-2 transition">Dashboard</Link>
                    <Link to="/patient/appointments" className="block text-gray-600 hover:text-blue-600 py-2 transition">Appointments</Link>
                  </>
                )}
                {user?.role === 'doctor' && (
                  <Link to="/doctor/dashboard" className="block text-gray-600 hover:text-blue-600 py-2 transition">Dashboard</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block text-gray-600 hover:text-blue-600 py-2 transition">Admin</Link>
                )}
                
                <Link to="/patient/profile" className="block text-gray-600 hover:text-blue-600 py-2 transition">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 hover:text-blue-600 py-2 transition">Login</Link>
                <Link to="/register" className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mt-2">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

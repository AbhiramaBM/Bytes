import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/UI';

export const Navbar = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Doctors', path: '/doctors' },
    { name: 'Clinics', path: '/clinics' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:block"
                aria-label="Toggle Sidebar"
              >
                <Menu size={22} className="text-gray-600" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-lg shadow-blue-200">
                <HeartPulse size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                RuralCare<span className="text-green-600">Connect</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-1 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all relative">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <Link
                  to={user?.role === 'admin' ? '/admin/dashboard' : `/${user?.role}/dashboard`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-blue-50 border border-gray-200 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserIcon size={16} />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-gray-900 leading-tight">{user?.fullName?.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user?.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="hidden md:flex border-blue-200 text-blue-600 hover:bg-blue-50 font-bold px-4">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')} className="hidden md:flex btn-premium font-bold shadow-lg shadow-blue-100 px-4">
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-100 animate-slideDown">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${isActive(link.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-gray-50 my-2 pt-2 px-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to={`/${user?.role}/dashboard`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-3 text-gray-600"
                  >
                    <UserIcon size={20} /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold mt-4 transition-colors"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-50 text-sm">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <Button variant="indigo" size="sm" className="w-full shadow-lg shadow-indigo-100 font-bold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// SVG Icon Helper
const HeartPulse = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </svg>
);

export default Navbar;


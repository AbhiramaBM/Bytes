import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/apiClient';
import { Card, Button, Input } from '../components/UI';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email address and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/login', formData);
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        login(userData, userData.token);
        const dashboardRoute =
          userData.role === 'admin' ? '/admin/dashboard' : `/${userData.role}/dashboard`;
        navigate(dashboardRoute);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold text-center mb-2 font-display">Welcome Back</h1>
        <p className="text-center text-gray-600 mb-8 font-medium">Log in with your email address</p>

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            ✅ {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-premium shadow-lg shadow-blue-100 font-bold"
            variant="primary"
            size="sm"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-gray-600">
            New here?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;


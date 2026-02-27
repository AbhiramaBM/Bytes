import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { Card, Button, Input } from '../components/UI';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Minimum 6 characters required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/register', formData);
      if (response.data.success) {
        navigate('/login', { state: { message: 'Registration successful! Please login with your email address.' } });
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold text-center mb-2 font-display">Create Account</h1>
        <p className="text-center text-gray-600 mb-8 font-medium">Join our healthcare community</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            error={fieldErrors.fullName}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            error={fieldErrors.email}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Choose a secure password"
            error={fieldErrors.password}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-premium py-4"
            variant="primary"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-gray-600">
            Already a member?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;


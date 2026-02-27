import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import Navbar from '../components/Navbar';
import { Card, Button, Input } from '../components/UI';

export const VerifyOTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [otp, setOtp] = useState('');
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleChange = (e) => {
        setOtp(e.target.value);
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!otp) {
            setError('Please enter the 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.post('/auth/verify-otp', { email, otp });
            if (response.data.success) {
                setSuccess('Email verified successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(response.data.message || 'Verification failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Verification failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
                <Card className="w-full max-w-md">
                    <h1 className="text-3xl font-bold text-center mb-2">Verify Email</h1>
                    <p className="text-center text-gray-600 mb-6">
                        We've sent a 6-digit OTP to <strong>{email}</strong>
                    </p>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <p className="font-semibold">❌ {error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            <p className="font-semibold">✅ {success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="One-Time Password (OTP)"
                            name="otp"
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={handleChange}
                            placeholder="Enter 6-digit OTP"
                            required
                        />

                        <Button
                            type="submit"
                            disabled={loading || success}
                            className="w-full mt-4"
                            variant="primary"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </Button>
                    </form>
                </Card>
            </div>
        </>
    );
};

export default VerifyOTPPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MapPin, DollarSign, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner, Button, Input } from '../components/UI';
import apiClient from '../utils/apiClient';

export const ViewDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/doctors');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold mb-10">Find Doctors</h1>

          <Input
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-10"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg">
                <div className="bg-blue-100 h-32 rounded-lg mb-4 flex items-center justify-center">
                  <Stethoscope size={64} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{doctor.fullName}</h3>
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <Stethoscope size={16} />
                  <span className="text-sm font-semibold">{doctor.specialization}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm font-semibold">{doctor.rating || 5.0}</span>
                </div>
                {doctor.clinicCity && (
                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm">{doctor.clinicCity}</span>
                  </div>
                )}
                {doctor.consultationFee && (
                  <div className="flex items-center gap-2 mb-4 text-green-600">
                    <DollarSign size={16} />
                    <span className="text-sm font-semibold">₹{doctor.consultationFee}</span>
                  </div>
                )}
                <p className="text-gray-600 text-sm mb-4">{doctor.experience || 'Experienced'}</p>
                <Link to="/patient/book-appointment">
                  <Button className="w-full" variant="primary">
                    Book Appointment
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No doctors found matching your search</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ViewDoctorsPage;

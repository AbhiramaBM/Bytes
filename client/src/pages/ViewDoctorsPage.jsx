import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MapPin, DollarSign, Star, Search } from 'lucide-react';
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
    (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-gray-800">Find Doctors</h1>
          <p className="text-gray-500 mt-1">Discover expert healthcare providers in your area</p>
        </div>

        <div className="relative max-w-md w-full">
          <Input
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 shadow-sm border-gray-200 focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor._id} className="hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden group">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-32 rounded-t-xl flex items-center justify-center relative overflow-hidden">
              <Stethoscope size={64} className="text-blue-600/20 absolute -right-4 -bottom-4 rotate-12 transition-transform group-hover:scale-110" />
              <div className="bg-white p-4 rounded-full shadow-md z-10 border border-blue-100">
                <Stethoscope size={40} className="text-primary" />
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">{doctor.fullName}</h3>
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-sm font-bold border border-yellow-100">
                  <Star size={14} className="fill-yellow-500" />
                  {doctor.rating || '5.0'}
                </div>
              </div>

              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <Stethoscope size={12} />
                {doctor.specialization}
              </div>

              <div className="space-y-3 mb-6">
                {doctor.clinicCity && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="bg-gray-100 p-1.5 rounded-md"><MapPin size={14} /></div>
                    <span className="text-sm font-medium">{doctor.clinicCity}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-green-600">
                  <div className="bg-green-50 p-1.5 rounded-md"><DollarSign size={14} /></div>
                  <span className="text-sm font-bold">₹{doctor.consultationFee || '500'} Consultation</span>
                </div>

                <p className="text-gray-500 text-sm italic leading-relaxed">
                  {doctor.experience || 'Highly experienced specialist'}
                </p>
              </div>

              <Link to={`/doctor/${doctor._id}`}>
                <Button size="sm" className="w-full btn-premium font-bold shadow-lg shadow-blue-100 px-8" variant="primary">
                  View Profile
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card className="text-center py-20 border-dashed border-2">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Doctors Found</h3>
          <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any doctors matching "{searchTerm}". Try a different search term.</p>
          <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')} className="mt-6 font-bold shadow-sm">
            Clear Search
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ViewDoctorsPage;

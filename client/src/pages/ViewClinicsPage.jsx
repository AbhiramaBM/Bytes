import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, LoadingSpinner, Input } from '../components/UI';
import apiClient from '../utils/apiClient';

export const ViewClinicsPage = () => {
  const [clinics, setClinic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      let url = '/clinics';
      if (searchCity) {
        url += `?city=${searchCity}`;
      }
      const response = await apiClient.get(url);
      setClinic(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold mb-10">Find Nearby Clinics</h1>

          <Input
            placeholder="Search by city..."
            value={searchCity}
            onChange={(e) => {
              setSearchCity(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                fetchClinics();
              }
            }}
            className="mb-10"
          />

          <div className="grid md:grid-cols-2 gap-6">
            {clinics.map((clinic) => (
              <Card key={clinic.id} className="hover:shadow-lg">
                <h3 className="text-2xl font-bold mb-4">{clinic.name}</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold">{clinic.address}</p>
                      <p className="text-gray-600">{clinic.city}, {clinic.state} {clinic.pincode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-green-600" />
                    <p className="font-semibold">{clinic.phone}</p>
                  </div>

                  {clinic.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-purple-600" />
                      <p className="font-semibold">{clinic.email}</p>
                    </div>
                  )}

                  {clinic.operatingHours && (
                    <div className="flex items-start gap-3">
                      <Clock size={20} className="text-orange-600 mt-1" />
                      <p className="text-sm text-gray-600">{clinic.operatingHours}</p>
                    </div>
                  )}
                </div>

                {clinic.services && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-sm mb-2">Services:</p>
                    <p className="text-sm text-gray-600">{clinic.services}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {clinics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No clinics found in this area</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ViewClinicsPage;

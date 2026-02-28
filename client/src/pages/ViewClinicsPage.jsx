import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Mail, Search, Building2 } from 'lucide-react';
import { Card, LoadingSpinner, Input, Button } from '../components/UI';
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
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-gray-800">Healthcare Centers</h1>
          <p className="text-gray-500 mt-1">Find state-of-the-art clinics and hospitals near you</p>
        </div>

        <div className="relative max-w-md w-full">
          <Input
            placeholder="Search by city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') fetchClinics();
            }}
            className="pl-10 h-12 shadow-sm border-gray-200 focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
        {clinics.map((clinic) => (
          <Card key={clinic._id} className="hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden group">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Building2 size={32} />
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                    Open Now
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-colors">{clinic.name}</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4 text-gray-600">
                  <div className="bg-gray-100 p-2 rounded-lg mt-0.5"><MapPin size={18} /></div>
                  <div>
                    <p className="font-semibold text-gray-800">{clinic.address}</p>
                    <p className="text-sm">{clinic.city}, {clinic.state} {clinic.pincode}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-600">
                  <div className="bg-gray-100 p-2 rounded-lg"><Phone size={18} /></div>
                  <p className="font-semibold text-gray-800">{clinic.phone}</p>
                </div>

                {clinic.email && (
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="bg-gray-100 p-2 rounded-lg"><Mail size={18} /></div>
                    <p className="font-semibold text-gray-800">{clinic.email}</p>
                  </div>
                )}

                {clinic.operatingHours && (
                  <div className="flex items-start gap-4 text-gray-600">
                    <div className="bg-gray-100 p-2 rounded-lg mt-0.5"><Clock size={18} /></div>
                    <p className="text-sm font-medium">{clinic.operatingHours}</p>
                  </div>
                )}
              </div>

              {clinic.services && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                  <p className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-2">Primary Services</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{clinic.services}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {clinics.length === 0 && (
        <Card className="text-center py-24 border-dashed border-2">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Building2 size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Clinics Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any healthcare centers in this area. Please try searching for a different city.</p>
          <Button variant="primary" size="sm" onClick={() => { setSearchCity(''); fetchClinics(); }} className="mt-8 px-10 font-bold shadow-lg shadow-blue-100">
            View All Clinics
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ViewClinicsPage;

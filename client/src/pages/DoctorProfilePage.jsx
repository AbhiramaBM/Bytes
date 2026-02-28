import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Languages, MapPin, Star, Stethoscope } from 'lucide-react';
import { Button, Card, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await apiClient.get(`/doctors/${id}`);
        setDoctor(res.data.data);
      } catch (error) {
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Card className="text-center py-14">
          <p className="text-gray-600">Doctor profile not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center">
              {doctor.profileImage ? (
                <img src={doctor.profileImage.startsWith('http') ? doctor.profileImage : `${apiClient.defaults.baseURL?.replace('/api', '')}${doctor.profileImage}`} alt="doctor" className="w-full h-full object-cover" />
              ) : (
                <Stethoscope className="text-blue-600" />
              )}
            </div>
            <div>
            <h1 className="text-3xl font-bold text-gray-800">Dr. {doctor.fullName}</h1>
            <p className="text-blue-700 font-semibold mt-1">{doctor.specialization || 'General Physician'}</p>
            <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> {doctor.address || 'Address not available'}</span>
              <span className="inline-flex items-center gap-1"><Stethoscope size={14} /> {doctor.experience || `${doctor.experienceYears || 0} years experience`}</span>
              <span className="inline-flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {doctor.rating || '5.0'}</span>
            </div>
            </div>
          </div>
          <div className="space-x-3">
            <Link to="/patient/book-appointment">
              <Button size="sm" variant="primary">Book Appointment</Button>
            </Link>
            <Link to={`/patient/messages?doctorId=${doctor._id}`}>
              <Button size="sm" variant="secondary">Chat with Doctor</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-lg text-gray-800 mb-3">Profile Details</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-semibold">Consultation Fee:</span> Rs {doctor.consultationFee || 0}</p>
            <p><span className="font-semibold">Education:</span> {doctor.education || 'Not provided'}</p>
            <p><span className="font-semibold">Hospital/Clinic:</span> {doctor.hospitalName || 'Not provided'}</p>
            <p className="inline-flex items-center gap-1"><Languages size={14} /> {doctor.languages?.join(', ') || 'Not specified'}</p>
            <p><span className="font-semibold">Location:</span> {[doctor.address, doctor.city, doctor.state, doctor.pincode].filter(Boolean).join(', ') || 'Not provided'}</p>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-lg text-gray-800 mb-3 inline-flex items-center gap-2">
            <Calendar size={16} /> Availability
          </h2>
          {doctor.availableSlots?.length ? (
            <div className="flex flex-wrap gap-2">
              {doctor.availableSlots.map((slot) => (
                <span key={slot} className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-100">{slot}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No availability slots configured.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-bold text-lg text-gray-800 mb-3">Clinic Map</h2>
        {(doctor.latitude && doctor.longitude) || doctor.googleMapsLink ? (
          <div className="space-y-3">
            <iframe
              title="doctor-location-map"
              src={doctor.googleMapsLink || `https://maps.google.com/maps?q=${doctor.latitude},${doctor.longitude}&z=14&output=embed`}
              className="w-full h-72 rounded-lg border"
              loading="lazy"
            />
            <a
              href={doctor.googleMapsLink || `https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="primary">Get Directions</Button>
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Map details are not available for this doctor.</p>
        )}
      </Card>
    </div>
  );
};

export default DoctorProfilePage;

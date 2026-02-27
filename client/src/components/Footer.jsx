import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">RuralCare Connect</h3>
            <p className="text-sm mb-4">Bringing quality healthcare to rural communities.</p>
            <div className="flex gap-4">
              <Facebook size={20} className="hover:text-blue-400 cursor-pointer transition" />
              <Twitter size={20} className="hover:text-blue-400 cursor-pointer transition" />
              <Linkedin size={20} className="hover:text-blue-400 cursor-pointer transition" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/doctors" className="hover:text-white transition">Find Doctors</a></li>
              <li><a href="/clinics" className="hover:text-white transition">Nearby Clinics</a></li>
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Appointments</a></li>
              <li><a href="#" className="hover:text-white transition">Prescriptions</a></li>
              <li><a href="#" className="hover:text-white transition">Health Records</a></li>
              <li><a href="#" className="hover:text-white transition">Emergency</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                1-800-RURAL-CARE
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                support@ruralcare.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                Rural India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-sm">
          <p>&copy; 2026 RuralCare Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

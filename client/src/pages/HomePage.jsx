import { useNavigate, Link } from 'react-router-dom';
import { Heart, Clock, Users, Award, Phone, Mail, MapPin, ArrowRight, Stethoscope, AlertCircle, FileText, MessageCircle } from 'lucide-react';
import { Button } from '../components/UI';

export const HomePage = () => {
  const navigate = useNavigate();
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient2 text-white py-20 rounded-3xl overflow-hidden mb-12">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="fade-in">
            <h1 className="text-5xl font-bold mb-6">Quality Healthcare, Anytime, Anywhere</h1>
            <p className="text-xl mb-8 text-gray-100">RuralCare Connect brings world-class healthcare to underserved communities. Book appointments, consult doctors, and manage your health digitally.</p>
            <div className="flex gap-4">
              {/* Replaced Link components with Buttons using onClick for navigation */}
              <Button size="sm" onClick={() => navigate('/register')} className="px-8 btn-premium font-bold shadow-xl shadow-blue-200" variant="primary">
                Join RuralCare Connect
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/doctors')} className="px-8 border-blue-200 text-blue-600 hover:bg-white/50 backdrop-blur-sm font-bold bg-white/30 transition-all duration-300">
                Find Doctors
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg">
              <Stethoscope size={120} className="text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white rounded-3xl shadow-sm mb-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'Book Appointments', desc: 'Schedule appointments with qualified doctors at your convenience' },
              { icon: FileText, title: 'Digital Prescriptions', desc: 'Access your prescriptions anytime, anywhere with E-prescriptions' },
              { icon: Heart, title: 'Health Records', desc: 'Secure storage of your complete medical history' },
              { icon: AlertCircle, title: 'Emergency SOS', desc: 'Quick access to emergency services in critical situations' },
              { icon: MessageCircle, title: 'Chat with Doctors', desc: 'Consult with doctors through secure messaging' },
              { icon: Stethoscope, title: 'Find Clinics', desc: 'Locate nearby clinics and healthcare facilities' },
            ].map((feature, idx) => (
              <div key={idx} className="card hover:shadow-lg">
                <feature.icon size={48} className="text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white rounded-3xl shadow-sm mb-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Register', desc: 'Create your account in minutes' },
              { step: '2', title: 'Choose', desc: 'Select doctor or clinic' },
              { step: '3', title: 'Book', desc: 'Schedule your appointment' },
              { step: '4', title: 'Consult', desc: 'Get quality healthcare' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16 rounded-3xl overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Improve Your Health?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of users who are already using RuralCare Connect for better healthcare access.</p>
          <Link to="/register" className="inline-block">
            <Button variant="secondary" size="sm" className="bg-white text-blue-600 px-10 border-none font-bold shadow-2xl shadow-blue-900/40 flex items-center gap-2 transform transition-transform hover:scale-105">
              Start Today <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;

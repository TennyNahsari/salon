import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ServiceList from '../components/ServiceList';
import TestimonialSection from '../components/TestimonialSection';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import AfterBookingModal from '../components/AfterBookingModal';
import CheckStatusModal from '../components/CheckStatusModal';
import { getServices, getConfigs } from '../services/api';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage({ onGoAdminLogin }) {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [isAfterBookingOpen, setIsAfterBookingOpen] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [paymentConfigs, setPaymentConfigs] = useState(null);

  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);

  useEffect(() => {
    fetchServicesData();
    fetchConfigsData();
  }, []);

  const fetchServicesData = async () => {
    try {
      setLoadingServices(true);
      const res = await getServices();
      if (res.success) {
        setServices(res.services);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchConfigsData = async () => {
    try {
      const res = await getConfigs();
      if (res.success && res.configs?.whatsapp_number) {
        setWhatsappNumber(res.configs.whatsapp_number);
        setPaymentConfigs(res.configs);
      }
    } catch (err) {
      console.error('Error loading configs:', err);
    }
  };

  const handleOpenBooking = (service = null) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleSuccessBooking = (bookingData, configsData) => {
    setLastBooking(bookingData);
    setPaymentConfigs(configsData);
    setIsAfterBookingOpen(true);
  };

  // WhatsApp Link
  const waText = encodeURIComponent('Halo Admin Luxe Salon & Spa, saya ingin bertanya tentang reservasi layanan.');
  const waLink = `https://wa.me/${whatsappNumber}?text=${waText}`;

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between relative">
      
      {/* Translucent Navbar */}
      <Navbar
        onOpenCheckStatus={() => setIsCheckStatusOpen(true)}
        onSelectServiceClick={() => handleOpenBooking()}
        onAdminClick={onGoAdminLogin}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        <HeroSection onBookingClick={() => handleOpenBooking()} />
        
        <ServiceList
          services={services}
          loading={loadingServices}
          onSelectService={(service) => handleOpenBooking(service)}
        />

        <TestimonialSection />
      </main>

      {/* Footer */}
      <Footer onAdminClick={onGoAdminLogin} configs={paymentConfigs} />

      {/* Floating WhatsApp Widget */}
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 bg-[#25D366] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-luxury hover:bg-[#20ba5a] hover:scale-105 active:scale-95 transition-all duration-300"
        title="Chat WhatsApp Admin"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
        </div>
        <span className="hidden sm:inline font-bold text-sm tracking-wide">
          {t('chat_wa_float')}
        </span>
      </a>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedService={selectedService}
        services={services}
        onSuccessBooking={handleSuccessBooking}
      />

      <AfterBookingModal
        isOpen={isAfterBookingOpen}
        onClose={() => setIsAfterBookingOpen(false)}
        booking={lastBooking}
        configs={paymentConfigs}
      />

      <CheckStatusModal
        isOpen={isCheckStatusOpen}
        onClose={() => setIsCheckStatusOpen(false)}
      />

    </div>
  );
}

